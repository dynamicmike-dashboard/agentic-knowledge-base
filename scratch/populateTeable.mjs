import fs from 'fs';

const apiKey = "teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=";
const tableId = "tblyGpv8b7UekbcTNdP";

const records = [
  // Repositories
  { fields: { Name: "LangChain", Type: "Repository", Category: "Framework", Description: "A framework for developing applications powered by LLMs.", Keywords: "llm, framework, agents, tools", URL: "https://github.com/langchain-ai/langchain", DataPayload: "pip install langchain" } },
  { fields: { Name: "AutoGPT", Type: "Repository", Category: "Agent", Description: "An experimental open-source attempt to make GPT-4 fully autonomous.", Keywords: "autonomous, agent, cli", URL: "https://github.com/Significant-Gravitas/AutoGPT", DataPayload: "git clone https://github.com/Significant-Gravitas/AutoGPT.git" } },
  { fields: { Name: "Browser-Use", Type: "Repository", Category: "Web Automation", Description: "Make AI agents securely interact with web browsers using Playwright.", Keywords: "browser, playwright, automation, scraping", URL: "https://github.com/browser-use/browser-use", DataPayload: "pip install browser-use" } },
  { fields: { Name: "LibreChat", Type: "Repository", Category: "UI", Description: "Enhanced ChatGPT Clone. Supports multiple models, image generation, and plugins.", Keywords: "chat, ui, openai, anthropic", URL: "https://github.com/danny-avila/LibreChat", DataPayload: "docker-compose up -d" } },
  { fields: { Name: "LlamaIndex", Type: "Repository", Category: "RAG", Description: "Data framework for building LLM applications over external data.", Keywords: "rag, data, vector, embedding", URL: "https://github.com/run-llama/llama_index", DataPayload: "pip install llama-index" } },
  
  // APIs
  { fields: { Name: "OpenAI API", Type: "API", Category: "LLM", Description: "Access to GPT-4o, embeddings, and fine-tuning.", Keywords: "gpt4, llm, fast, api", URL: "https://platform.openai.com/docs/", DataPayload: "Base URL: https://api.openai.com/v1" } },
  { fields: { Name: "Anthropic Claude API", Type: "API", Category: "LLM", Description: "API for Claude 3.5 Sonnet, highly capable of coding and large context windows.", Keywords: "claude, sonnet, coding, context", URL: "https://docs.anthropic.com/", DataPayload: "Base URL: https://api.anthropic.com/v1" } },
  { fields: { Name: "Groq", Type: "API", Category: "LLM Inference", Description: "Extremely fast inference engine for open-source models like Llama 3.", Keywords: "fast, llama, inference", URL: "https://console.groq.com/", DataPayload: "Base URL: https://api.groq.com/openai/v1" } },
  
  // MCPs
  { fields: { Name: "Brave Search MCP", Type: "MCP", Category: "Search", Description: "Allows agents to search the live web for up-to-date information.", Keywords: "search, live, web, internet", URL: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search", DataPayload: "Requires BRAVE_API_KEY environment variable." } },
  { fields: { Name: "GitHub MCP", Type: "MCP", Category: "Git", Description: "Allows agents to read repos, pull requests, and push code directly to GitHub.", Keywords: "github, git, repo, code", URL: "https://github.com/modelcontextprotocol/servers/tree/main/src/github", DataPayload: "Requires GITHUB_PERSONAL_ACCESS_TOKEN." } },
  { fields: { Name: "Puppeteer MCP", Type: "MCP", Category: "Web Automation", Description: "Control a headless browser to scrape Javascript rendered content.", Keywords: "scraping, browser, javascript", URL: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer", DataPayload: "npx -y @modelcontextprotocol/server-puppeteer" } },
  
  // Skills
  { fields: { Name: "Python BeautifulSoup Scraping", Type: "Skill", Category: "Data Extraction", Description: "Standard pattern for extracting data from static HTML using Python.", Keywords: "python, bs4, scraping, html", URL: "https://www.crummy.com/software/BeautifulSoup/bs4/doc/", DataPayload: "from bs4 import BeautifulSoup\nimport requests\nres = requests.get(url)\nsoup = BeautifulSoup(res.text, 'html.parser')" } },
  { fields: { Name: "PowerShell File Search", Type: "Skill", Category: "File System", Description: "Quick command to search for text within files across a whole directory.", Keywords: "powershell, search, grep, find", URL: "https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/select-string", DataPayload: "Get-ChildItem -Recurse -File | Select-String -Pattern 'search_term'" } }
];

async function run() {
  console.log("Bulk inserting to Teable...");
  const res = await fetch(`https://app.teable.ai/api/table/${tableId}/record`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records })
  });
  
  if (!res.ok) {
    console.error("Failed!", await res.text());
  } else {
    console.log("Successfully populated Teable with", records.length, "items!");
  }
}
run();
