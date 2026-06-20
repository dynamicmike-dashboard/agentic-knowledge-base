require('dotenv').config();
const fs = require('fs');
const path = require('path');

const TEABLE_API_KEY = process.env.TEABLE_API_KEY;
const TEABLE_TABLE_ID = process.env.TEABLE_TABLE_ID;

if (!TEABLE_API_KEY || !TEABLE_TABLE_ID) {
  console.error("Missing TEABLE_API_KEY or TEABLE_TABLE_ID. Falling back to static data.");
  process.exit(0); 
}

async function fetchTeableData() {
  try {
    const url = `https://api.teable.io/api/table/${TEABLE_TABLE_ID}/record`;
    
    console.log("Fetching data from Teable...");
    
    // We use the native Node 18+ fetch API
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TEABLE_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Teable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.records) {
      throw new Error("No records found in the response.");
    }

    // Map records to the expected JSON format for the frontend
    const formattedData = data.records.map(record => {
      const f = record.fields;
      
      // We safely try to match potential column names you might use in Teable
      return {
        name: f.name || f.Name || f.Title || "Unnamed Resource",
        url: f.url || f.URL || f.Url || f.Link || "",
        category: f.category || f.Category || "Uncategorized",
        replaces: f.replaces || f.Replaces || "",
        howToStart: f.howToStart || f.HowToStart || f["How To Start"] || "",
        caveat: f.caveat || f.Caveat || "",
        description: f.description || f.Description || f.Desc || "",
        stars: f.stars || f.Stars || "",
        // Teable multi-select fields might come back as strings or arrays, so we parse them safely
        tags: Array.isArray(f.tags) ? f.tags : (f.Tags ? (Array.isArray(f.Tags) ? f.Tags : String(f.Tags).split(',')) : (f.Keywords ? (Array.isArray(f.Keywords) ? f.Keywords : String(f.Keywords).split(',')) : [])),
        keywords: Array.isArray(f.keywords) ? f.keywords : (f.Keywords ? (Array.isArray(f.Keywords) ? f.Keywords : String(f.Keywords).split(',')) : [])
      };
    });

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'repositories.json'),
      JSON.stringify(formattedData, null, 2)
    );
    
    console.log(`Successfully synced ${formattedData.length} records from Teable to repositories.json`);

  } catch (error) {
    console.error("Error syncing from Teable:", error.message);
    process.exit(1); 
  }
}

fetchTeableData();
