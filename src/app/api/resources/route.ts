import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tableId = process.env.TEABLE_TABLE_ID || "tblyGpv8b7UekbcTNdP";
    const apiKey = process.env.TEABLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Teable credentials' }, { status: 500 });
    }

    // Call the Teable API
    const response = await fetch(`https://app.teable.ai/api/table/${tableId}/record`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      // Ensure we don't aggressively cache the database
      cache: 'no-store' 
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Teable fetch error:', err);
      return NextResponse.json({ error: 'Failed to fetch from Teable' }, { status: response.status });
    }

    const data = await response.json();
    
    // Clean up the Teable response into our standard frontend object array
    const formattedData = data.records?.map((record: any) => ({
      id: record.id,
      name: record.fields.Name || 'Unnamed Resource',
      url: record.fields.URL || '#',
      category: record.fields.Category || 'Uncategorized',
      type: record.fields.Type || 'Repository', // Repository, Skill, API, MCP
      description: record.fields.Description || '',
      keywords: record.fields.Keywords ? (typeof record.fields.Keywords === 'string' ? record.fields.Keywords.split(',') : record.fields.Keywords) : [],
      dataPayload: record.fields.DataPayload || '' // JSON strings or text
    })) || [];

    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
