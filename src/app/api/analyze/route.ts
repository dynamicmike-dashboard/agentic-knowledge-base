import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url, password } = await req.json();

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized. Invalid admin password.' }, { status: 401 });
    }

    // 1. Fetch webpage content
    let htmlText = "";
    try {
      const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' } });
      htmlText = await pageRes.text();
    } catch (e) {
      console.warn("Failed to fetch webpage directly, passing just URL to AI.");
    }
    
    // Trim to save processing overhead (OpenAI gpt-4o-mini has 128k context)
    const trimmedHtml = htmlText.substring(0, 40000);

    // 2. Call OpenAI API
    const openAiKey = process.env.OPENAI_API_KEY;
    
    // Explicit system instruction for OpenAI JSON mode
    const prompt = `Analyze the following webpage content from ${url} and extract its details.
    If the content is missing or unreadable, do your best to categorize based on the URL itself (e.g. github repos).
    You MUST output valid JSON matching this schema exactly, and nothing else:
    {
      "Name": "Resource Name",
      "Type": "Repository" | "Skill" | "API" | "MCP",
      "Category": "A short 1-2 word category like 'Web Automation', 'Database', etc.",
      "Description": "A concise 2-sentence summary of what this is.",
      "Keywords": "comma, separated, list, of, tags",
      "URL": "${url}",
      "DataPayload": "Extract specific instructions, code snippets, API base URLs, or setup commands. Keep it clean."
    }

    Content Context:
    ${trimmedHtml}
    `;

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI assistant categorizing developer resources. You must respond in pure JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    const openAiData = await openAiRes.json();
    if (!openAiRes.ok) throw new Error(openAiData.error?.message || 'OpenAI API Error');

    const jsonText = openAiData.choices[0].message.content;
    const parsedData = JSON.parse(jsonText);

    // 3. Post to Teable
    const teableKey = process.env.TEABLE_API_KEY;
    const tableId = process.env.TEABLE_TABLE_ID || "tblyGpv8b7UekbcTNdP";
    
    const teableRes = await fetch(`https://app.teable.ai/api/table/${tableId}/record`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teableKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields: parsedData
          }
        ]
      })
    });

    if (!teableRes.ok) {
      const err = await teableRes.text();
      console.error('Teable Error details:', err);
      throw new Error('Teable insertion failed. Ensure column names match exactly (Name, Type, Category, Description, Keywords, URL, DataPayload).');
    }

    return NextResponse.json({ success: true, data: parsedData });

  } catch (err: any) {
    console.error('Analyze Route Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
