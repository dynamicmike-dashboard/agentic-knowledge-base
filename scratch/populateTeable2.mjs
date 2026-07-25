import fs from 'fs';

const apiKey = "teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=";
const tableId = "tblyGpv8b7UekbcTNdP";

const records = [
  { fields: { Name: "Reddit: 58 Antigravity Skills", Type: "Skill", Category: "Aggregator", Description: "A mega-collection of 58 curated Antigravity skills and workflows from the community.", Keywords: "antigravity, skills, collection, reddit", URL: "https://www.reddit.com/r/google_antigravity/comments/1qcuc8u/i_aggregated_58_skills_for_antigravity_into_one/", DataPayload: "" } },
  
  { fields: { Name: "Antigravity Skills Repo", Type: "Repository", Category: "Skills Repo", Description: "A repository by rmyndharis containing custom skills for the Antigravity IDE.", Keywords: "antigravity, skills, custom", URL: "https://github.com/rmyndharis/antigravity-skills", DataPayload: "git clone https://github.com/rmyndharis/antigravity-skills.git" } },
  
  { fields: { Name: "Antigravity Awesome Skills", Type: "Repository", Category: "Skills Repo", Description: "A curated awesome list of workflows and skills for Antigravity by sickn33.", Keywords: "awesome, list, workflows, antigravity", URL: "https://github.com/sickn33/antigravity-awesome-skills", DataPayload: "" } },
  
  { fields: { Name: "Cinematic Site Components", Type: "Repository", Category: "UI Components", Description: "Beautiful cinematic React/Next.js components for premium web design.", Keywords: "ui, cinematic, components, react, design", URL: "https://github.com/robonuggets/cinematic-site-components", DataPayload: "" } },
  
  { fields: { Name: "Remotion Best Practices Skill", Type: "Skill", Category: "Video Generation", Description: "An Antigravity skill for building programmatic video generation workflows using Remotion.", Keywords: "remotion, video, programmatic, best-practices", URL: "https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/remotion-best-practices", DataPayload: "" } },
  
  { fields: { Name: "UI/UX Pro Max Skill", Type: "Skill", Category: "UI/UX", Description: "An advanced agentic skill that enforces premium UI/UX design standards and modern aesthetic principles.", Keywords: "ui, ux, design, premium, skill", URL: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill", DataPayload: "" } },
  
  { fields: { Name: "HeyGen Hyperframes", Type: "Repository", Category: "Video Generation", Description: "HeyGen's hyperframes repository for advanced AI avatar video generation.", Keywords: "heygen, video, avatars, ai", URL: "https://github.com/heygen-com/hyperframes", DataPayload: "" } },
  
  { fields: { Name: "Byterover CLI", Type: "Repository", Category: "CLI Tool", Description: "Byterover command-line interface tool.", Keywords: "cli, terminal, tool", URL: "https://github.com/campfirein/byterover-cli", DataPayload: "" } },
  
  { fields: { Name: "Claw Code", Type: "Repository", Category: "Coding Assistant", Description: "An AI coding assistant or framework by ultraworkers.", Keywords: "coding, assistant, ai", URL: "https://github.com/ultraworkers/claw-code", DataPayload: "" } },
  
  { fields: { Name: "Microsoft VibeVoice", Type: "Repository", Category: "Audio/Voice", Description: "Microsoft's VibeVoice repository for advanced audio and voice AI.", Keywords: "microsoft, voice, audio, tts", URL: "https://github.com/microsoft/VibeVoice", DataPayload: "" } },

  { fields: { Name: "Official Gemini API Skill", Type: "Skill", Category: "API Integration", Description: "Official Google skill that bundles Gemini 3+ models, SDKs, and live docs for single-API multimodal features like search-grounded property infographics.", Keywords: "gemini, google, api, multimodal, real-estate", URL: "https://youtu.be/izVyptLrkYA?si=8870WPzdDDgUZtTV", DataPayload: "npm skills add @google/gemini" } }
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
