// app.js

// Global State
let currentEntity = "repositories"; // can be repositories, skills, apis, mcps
let currentData = [];
let activeCategory = "All";
let searchQuery = "";

// DOM Elements
const repoGrid = document.getElementById("repo-grid");
const searchInput = document.getElementById("search-input");
const categoriesContainer = document.getElementById("categories-container");
const resultsCount = document.getElementById("results-count");
const navTabs = document.querySelectorAll(".nav-tab");
const submitResourceBtn = document.getElementById("submit-resource-btn");
const hiddenSubmitPrompt = document.getElementById("hidden-submit-prompt");

// Modal Elements
const openWizardBtn = document.getElementById("open-wizard-btn");
const closeWizardBtn = document.getElementById("close-wizard-btn");
const wizardModal = document.getElementById("wizard-modal");
const presetBtns = document.querySelectorAll(".preset-btn");
const customIdeaInput = document.getElementById("custom-idea-input");
const generateRecBtn = document.getElementById("generate-recommendation-btn");
const recommendationResult = document.getElementById("recommendation-result");
const recRepoName = document.getElementById("rec-repo-name");
const recRepoDesc = document.getElementById("rec-repo-desc");
const recPromptText = document.getElementById("rec-prompt-text");
const copyPromptBtn = document.getElementById("copy-prompt-btn");
const toastNotification = document.getElementById("toast-notification");

// --- DATA FETCHING ---

async function fetchEntityData(entity) {
  try {
    resultsCount.textContent = "Loading resources...";
    repoGrid.innerHTML = "";
    
    // In a real production build without a local server, fetch might fail due to CORS.
    // For local http-server, this works perfectly.
    const response = await fetch(`./data/${entity}.json`);
    if (!response.ok) throw new Error("Network response was not ok");
    
    currentData = await response.json();
    
    // Reset state
    activeCategory = "All";
    searchQuery = searchInput.value = "";
    
    initCategories();
    renderGrid();
  } catch (error) {
    console.error("Error fetching data:", error);
    resultsCount.textContent = "Error loading data. Make sure you are running a local server.";
    repoGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--accent-rose);">
        <h3>⚠️ Cannot load JSON data</h3>
        <p>Browsers block local file fetching for security. Please run a local server (e.g. <code>npx http-server</code>).</p>
      </div>
    `;
  }
}

// --- NAVIGATION ---

navTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // UI Update
    navTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    
    // State Update
    currentEntity = tab.getAttribute("data-entity");
    fetchEntityData(currentEntity);
  });
});

// --- CATEGORIES & RENDER ---

function initCategories() {
  const categories = ["All", ...new Set(currentData.map(item => item.category))];
  categoriesContainer.innerHTML = "";
  
  categories.forEach(category => {
    const pill = document.createElement("button");
    pill.classList.add("category-pill");
    if (category === activeCategory) pill.classList.add("active");
    pill.textContent = category;
    
    pill.addEventListener("click", () => {
      document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = category;
      renderGrid();
    });
    
    categoriesContainer.appendChild(pill);
  });
}

function matchQuery(item, query) {
  const cleanQuery = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ");
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);
  
  if (queryTokens.length === 0) return true;
  
  let matches = 0;
  
  // Create a giant string of all values to search against
  const textToSearch = Object.values(item)
    .flat()
    .join(" ")
    .toLowerCase();
  
  queryTokens.forEach(token => {
    if (textToSearch.includes(token)) {
      matches++;
    }
  });
  
  return matches > 0;
}

function renderGrid() {
  const filtered = currentData.filter(item => {
    const categoryMatch = activeCategory === "All" || item.category === activeCategory;
    const searchMatch = !searchQuery ? true : matchQuery(item, searchQuery);
    return categoryMatch && searchMatch;
  });
  
  repoGrid.innerHTML = filtered.map(item => generateCardHTML(item)).join("");
  resultsCount.textContent = `Showing ${filtered.length} of ${currentData.length} items`;
}

// Handle Search Input
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderGrid();
});

// --- CARD TEMPLATES ---

function generateCardHTML(item) {
  const tagsHTML = item.tags ? item.tags.map(tag => `<span class="card-badge badge-tag">${tag}</span>`).join("") : "";
  
  // Template router based on entity type
  if (currentEntity === "repositories") {
    return `
      <div class="repo-card">
        <div class="card-header">
          <div class="card-title-area">
            <h3 class="repo-title">${item.name}</h3>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="repo-github-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              github.com / ${item.url.split('/').slice(-2).join('/')}
            </a>
          </div>
          <div class="card-meta">
            <span class="repo-stars">⭐ ${item.stars}</span>
          </div>
        </div>
        <div style="margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
          ${tagsHTML}
        </div>
        <p class="card-description">${item.description}</p>
        <div class="card-field">
          <div class="field-label">Replaces</div>
          <div class="replaces-content">${item.replaces}</div>
        </div>
        <div class="card-field">
          <div class="field-label">How to Start</div>
          <div class="how-to-content">${item.howToStart}</div>
        </div>
        ${item.caveat ? `
        <div class="caveat-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <div class="caveat-text">${item.caveat}</div>
        </div>` : ''}
        <div class="card-actions">
          <button class="btn btn-sm" onclick="openWizardWithRepo('${item.name}')">Build with Antigravity</button>
        </div>
      </div>
    `;
  }
  
  if (currentEntity === "skills") {
    return `
      <div class="repo-card">
        <div class="card-header">
          <div class="card-title-area">
            <h3 class="repo-title">${item.name}</h3>
          </div>
        </div>
        <div style="margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
          ${tagsHTML}
        </div>
        <p class="card-description">${item.description}</p>
        <div class="card-field">
          <div class="field-label">Code Pattern</div>
          <div class="code-block-snippet">${item.codeSnippet.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        </div>
      </div>
    `;
  }

  if (currentEntity === "apis") {
    return `
      <div class="repo-card">
        <div class="card-header">
          <div class="card-title-area">
            <h3 class="repo-title">${item.name}</h3>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="repo-github-link">Documentation Docs ↗</a>
          </div>
        </div>
        <div style="margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
          ${tagsHTML}
        </div>
        <p class="card-description">${item.description}</p>
        <div class="card-field">
          <div class="field-label">Base URL</div>
          <div class="how-to-content">${item.baseUrl}</div>
        </div>
        <div class="card-field">
          <div class="field-label">Auth Method</div>
          <div class="replaces-content" style="color: var(--accent-purple);">${item.authMethod}</div>
        </div>
      </div>
    `;
  }

  if (currentEntity === "mcps") {
    return `
      <div class="repo-card">
        <div class="card-header">
          <div class="card-title-area">
            <h3 class="repo-title">${item.name}</h3>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="repo-github-link">Source Code ↗</a>
          </div>
        </div>
        <div style="margin-bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
          ${tagsHTML}
        </div>
        <p class="card-description">${item.description}</p>
        <div class="card-field">
          <div class="field-label">Setup Command</div>
          <div class="how-to-content">${item.setupCommand}</div>
        </div>
      </div>
    `;
  }
}

// --- SUBMIT RESOURCE WORKFLOW ---

submitResourceBtn.addEventListener("click", () => {
  const promptText = "Hey Antigravity, please analyze this URL: [PASTE URL HERE]. Identify if it is a Repo, API, MCP, or Skill. Extract its purpose, keywords, and how to use it, then format it into JSON and inject it into the appropriate file in my `data/` folder.";
  
  navigator.clipboard.writeText(promptText).then(() => {
    showToast("Prompt copied! Paste it in the chat.");
  }).catch(err => {
    hiddenSubmitPrompt.value = promptText;
    hiddenSubmitPrompt.select();
    document.execCommand("copy");
    showToast("Prompt copied! Paste it in the chat.");
  });
});

// --- RECOMMENDER WIZARD (Runs only against currently loaded data) ---

// Modal Actions
openWizardBtn.addEventListener("click", () => {
  wizardModal.classList.add("active");
  recommendationResult.classList.remove("active");
  customIdeaInput.value = "";
});

closeWizardBtn.addEventListener("click", () => { wizardModal.classList.remove("active"); });
wizardModal.addEventListener("click", (e) => { if (e.target === wizardModal) wizardModal.classList.remove("active"); });

function scanIdea(text) {
  const input = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ");
  const tokens = input.split(/\s+/).filter(t => t.length > 2);
  
  let bestMatch = null;
  let highestScore = -1;
  
  currentData.forEach(item => {
    let score = 0;
    
    // Check keywords 
    if (item.keywords) {
      item.keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (text.toLowerCase().includes(keywordLower)) score += 4;
        tokens.forEach(token => {
          if (keywordLower.includes(token) || token.includes(keywordLower)) score += 1.5;
        });
      });
    }
    
    // Check tags
    if (item.tags) {
      item.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (text.toLowerCase().includes(tagLower)) score += 5;
        tokens.forEach(token => {
          if (tagLower.includes(token)) score += 2;
        });
      });
    }
    
    // Check name
    const nameWords = item.name.toLowerCase().split(/\s+/);
    nameWords.forEach(nWord => {
      if (tokens.includes(nWord)) score += 8;
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  });
  
  if (highestScore <= 0 && currentData.length > 0) bestMatch = currentData[0];
  return bestMatch;
}

function generatePromptText(item, ideaText) {
  const descriptionSnippet = ideaText ? `I want to build: "${ideaText}"` : `I want to utilize the "${item.name}" resource.`;
  
  return `Hey Antigravity! I want to start a task using the following resource from my Knowledge Base:

Resource: ${item.name}
Target Pattern: ${descriptionSnippet}

Please guide me through integrating this resource step-by-step in my AI Studio / Stitch environment!`;
}

function displayRecommendation(item, customText = "") {
  if (!item) return;
  recRepoName.textContent = item.name;
  recRepoDesc.textContent = `Based on your idea, ${item.name} is the best fit from the current tab.`;
  
  const prompt = generatePromptText(item, customText);
  recPromptText.textContent = prompt;
  
  recommendationResult.classList.add("active");
  recommendationResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.openWizardWithRepo = function(itemName) {
  const item = currentData.find(r => r.name === itemName);
  if (!item) return;
  
  wizardModal.classList.add("active");
  customIdeaInput.value = `I want to build a project utilizing ${item.name}.`;
  displayRecommendation(item, `I want to build a project utilizing ${item.name}`);
};

presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if(currentEntity !== "repositories") {
      alert("Please switch to the Repositories tab to use the project presets!");
      return;
    }
    const preset = btn.getAttribute("data-preset");
    let idea = "";
    switch (preset) {
      case "scraping": idea = "I want to crawl data from bot-protected web pages and convert the DOM into clean accessibility trees to cut LLM token costs."; break;
      case "video": idea = "I need programmatic video generation where I can write HTML structure and render out high-definition MP4 clips deterministically."; break;
      case "trading": idea = "I want to simulate an autonomous trading floor with AI agents running quantitative finance strategies and monitoring portfolio risks."; break;
      case "email": idea = "I want to set up an automated serverless agent to sort my email inbox, draft replies, and triage tasks on Cloudflare workers."; break;
    }
    customIdeaInput.value = idea;
    const match = scanIdea(idea);
    displayRecommendation(match, idea);
  });
});

generateRecBtn.addEventListener("click", () => {
  const text = customIdeaInput.value.trim();
  if (!text) return alert("Please enter a description!");
  const match = scanIdea(text);
  displayRecommendation(match, text);
});

copyPromptBtn.addEventListener("click", () => {
  const text = recPromptText.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Prompt copied for Antigravity!");
  }).catch(err => {
    hiddenSubmitPrompt.value = text;
    hiddenSubmitPrompt.select();
    document.execCommand("copy");
    showToast("Prompt copied for Antigravity!");
  });
});

// Toast Utility
function showToast(msg) {
  toastNotification.textContent = msg;
  toastNotification.classList.add("show");
  setTimeout(() => toastNotification.classList.remove("show"), 2500);
}

// Init Application
fetchEntityData(currentEntity);
