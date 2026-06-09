import fs from 'fs';

const apiKey = "teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=";
const tableId = "tblyGpv8b7UekbcTNdP";
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};

async function run() {
  console.log("Renaming primary field 'Label' to 'Name'...");
  const patchRes = await fetch(`https://app.teable.ai/api/table/${tableId}/field/fld4kz2GYZsIyQLBVEI`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ name: 'Name' })
  });
  if (!patchRes.ok) console.error("Error renaming:", await patchRes.text());

  console.log("Deleting 'Number' field...");
  await fetch(`https://app.teable.ai/api/table/${tableId}/field/fldUn6blLCaKVwyOpTd`, { method: 'DELETE', headers });

  console.log("Deleting 'Status' field...");
  await fetch(`https://app.teable.ai/api/table/${tableId}/field/flduoZIn5uHRYqnMFgj`, { method: 'DELETE', headers });

  const fieldsToAdd = [
    { name: 'URL', type: 'url' },
    { name: 'Type', type: 'singleLineText' },
    { name: 'Category', type: 'singleLineText' },
    { name: 'Description', type: 'longText' },
    { name: 'Keywords', type: 'singleLineText' },
    { name: 'DataPayload', type: 'longText' }
  ];

  for (const field of fieldsToAdd) {
    console.log(`Creating field: ${field.name}...`);
    const res = await fetch(`https://app.teable.ai/api/table/${tableId}/field`, {
      method: 'POST',
      headers,
      body: JSON.stringify(field)
    });
    if (!res.ok) {
        console.error("Failed to create", field.name, await res.text());
    }
  }

  console.log("Teable automated setup complete!");
}

run();
