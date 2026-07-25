"use client";
import { useState, useEffect } from "react";

function loadQueue() {
  try { return JSON.parse(localStorage.getItem("submitQueue") || "[]"); } catch { return []; }
}
function saveQueue(queue) {
  localStorage.setItem("submitQueue", JSON.stringify(queue));
}

export default function Home() {
  const [currentEntity, setCurrentEntity] = useState("Repository"); 
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info"); // "info" | "error" | "success"
  
  // Connection status
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [pendingQueue, setPendingQueue] = useState<any[]>(loadQueue());
  
  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitUrl, setSubmitUrl] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchData();
  }, []);

  async function checkConnection() {
    setBackendStatus("checking");
    try {
      const res = await fetch("/api/resources", { method: "HEAD", cache: "no-store" });
      setBackendStatus(res.ok ? "connected" : "disconnected");
    } catch {
      setBackendStatus("disconnected");
    }
  }

  async function flushQueue() {
    const queue = loadQueue();
    if (queue.length === 0) return;
    const pw = prompt("Enter admin password to submit " + queue.length + " queued items:");
    if (!pw) return;
    let success = 0;
    for (const item of queue) {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: item.url, password: pw })
        });
        if (res.ok) success++;
      } catch {}
    }
    const remaining = queue.slice(success);
    saveQueue(remaining);
    setPendingQueue(remaining);
    displayToast(`Submitted ${success} items. ${remaining.length > 0 ? remaining.length + " still queued." : "Queue empty!"}`, success > 0 ? "success" : "error");
    fetchData();
  }

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/resources", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch data from Teable API");
      
      const data = await response.json();
      setCurrentData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Derived state for the active tab
  const filteredByType = currentData.filter(item => item.type === currentEntity);
  const categories = ["All", ...Array.from(new Set(filteredByType.map(item => item.category)))];

  const matchQuery = (item: any, query: string) => {
    const cleanQuery = query.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ");
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);
    
    if (queryTokens.length === 0) return true;
    
    let matches = 0;
    const textToSearch = Object.values(item).flat().join(" ").toLowerCase();
    
    queryTokens.forEach(token => {
      if (textToSearch.includes(token)) matches++;
    });
    
    return matches > 0;
  };

  const filteredItems = filteredByType.filter(item => {
    const categoryMatch = activeCategory === "All" || item.category === activeCategory;
    const searchMatch = !searchQuery ? true : matchQuery(item, searchQuery);
    return categoryMatch && searchMatch;
  });

  const displayToast = (msg: string, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    if (type !== "error") setTimeout(() => setShowToast(false), 5000);
  };

  const handleLiveSubmit = async () => {
    if (!submitUrl) return displayToast("Please enter a URL first.", "error");
    if (!adminPassword) return displayToast("Admin password required.", "error");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: submitUrl, password: adminPassword })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze resource.");
      
      displayToast("Success! Resource added to Teable.", "success");
      setShowSubmitModal(false);
      setSubmitUrl("");
      fetchData(); // Refresh the grid
    } catch (err: any) {
      console.error(err);
      // Queue failed submission to localStorage for retry later
      const queue = loadQueue();
      queue.push({ url: submitUrl, time: new Date().toISOString() });
      saveQueue(queue);
      setPendingQueue(queue);
      displayToast(`Backend offline. URL saved to retry queue (${queue.length} pending). Start the server and use "Flush Queue".`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCard = (item: any) => {
    const tagsHTML = item.keywords?.map((tag: string, i: number) => (
      <span key={i} className="card-badge badge-tag">{tag.trim()}</span>
    ));

    let payloadStr = item.dataPayload || "";

    if (item.type === "Repository") {
      return (
        <div key={item.id} className="repo-card">
          <div className="card-header">
            <div className="card-title-area">
              <h3 className="repo-title">{item.name}</h3>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="repo-github-link">
                Source Link ↗
              </a>
            </div>
          </div>
          <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {tagsHTML}
          </div>
          <p className="card-description">{item.description}</p>
          {payloadStr && (
            <div className="card-field">
              <div className="field-label">Additional Data</div>
              <div className="how-to-content">{payloadStr}</div>
            </div>
          )}
        </div>
      );
    }
    
    if (item.type === "Skill") {
      return (
        <div key={item.id} className="repo-card">
          <div className="card-header">
            <div className="card-title-area">
              <h3 className="repo-title">{item.name}</h3>
            </div>
          </div>
          <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
            {tagsHTML}
          </div>
          <p className="card-description">{item.description}</p>
          {payloadStr && (
            <div className="card-field">
              <div className="field-label">Code Pattern / Snippet</div>
              <div className="code-block-snippet">{payloadStr}</div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.id} className="repo-card">
        <div className="card-header">
          <div className="card-title-area">
            <h3 className="repo-title">{item.name}</h3>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="repo-github-link">Documentation ↗</a>
          </div>
        </div>
        <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {tagsHTML}
        </div>
        <p className="card-description">{item.description}</p>
        {payloadStr && (
          <div className="card-field">
            <div className="field-label">Details</div>
            <div className="how-to-content">{payloadStr}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <div className="logo-section">
            <h1>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Agentic Knowledge Base
            </h1>
            <p>Live Teable Connection &bull; Centralized resource directory</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowSubmitModal(true)} className="btn btn-outline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px", verticalAlign: "middle"}}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Submit Resource
            </button>
            <button className="btn btn-primary" onClick={() => fetchData()}>
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      <nav className="entity-nav">
        {["Repository", "Skill", "API", "MCP"].map((tab) => (
          <button 
            key={tab}
            className={`nav-tab ${currentEntity === tab ? "active" : ""}`}
            onClick={() => { setCurrentEntity(tab); setActiveCategory("All"); }}
          >
            {tab === "Repository" ? "Repositories" : tab === "Skill" ? "Skills & Patterns" : tab === "API" ? "APIs" : "MCP Servers"}
          </button>
        ))}
      </nav>

      <section className="search-filter-section">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search knowledge base by keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="categories-container">
          {categories.map((cat: any) => (
            <button 
              key={cat} 
              className={`category-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="results-header">
        <div className="results-count">
          {loading ? "Fetching from Teable..." : error ? <span style={{color: "red"}}>{error}</span> : `Showing ${filteredItems.length} items`}
        </div>
      </div>

      <main className="repo-grid">
        {!loading && !error && filteredItems.map(item => renderCard(item))}
        {!loading && !error && filteredItems.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            No resources found. (Add one using the Submit button!)
          </div>
        )}
      </main>

      {/* SUBMIT RESOURCE MODAL */}
      <div className={`modal-overlay ${showSubmitModal ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowSubmitModal(false); }}>
        <div className="modal-container" style={{maxWidth: "500px"}}>
          <div className="modal-header">
            <h2 className="modal-title" style={{fontSize: "1.3rem"}}>Add New Resource</h2>
            <button className="modal-close" onClick={() => setShowSubmitModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="modal-body">
            <p className="wizard-step-title" style={{fontSize: "0.9rem"}}>
              Paste a URL below. Our AI backend will automatically crawl the page, extract the details, and categorize it into Teable.
            </p>
            <div className="idea-input-wrapper">
              <label className="field-label">Resource URL</label>
              <input 
                type="url" 
                placeholder="https://github.com/..." 
                value={submitUrl}
                onChange={(e) => setSubmitUrl(e.target.value)}
                style={{padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", width: "100%"}}
              />
            </div>
            <div className="idea-input-wrapper">
              <label className="field-label">Admin Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border)", width: "100%"}}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{marginTop: "1rem", justifyContent: "center"}}
              onClick={handleLiveSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "AI is analyzing... please wait" : "Submit to Teable"}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status Bar */}
      <div className={`connection-bar ${backendStatus}`}>
        <span className={`status-dot ${backendStatus}`}></span>
        <span className="status-text">
          {backendStatus === "connected" ? "Backend Connected" : backendStatus === "disconnected" ? "Backend Disconnected" : "Checking..."}
        </span>
        {backendStatus === "disconnected" && (
          <span className="status-hint">Start the knowledge base server first</span>
        )}
        <button className="btn btn-sm btn-outline" onClick={checkConnection} style={{marginLeft: "auto"}}>Refresh</button>
      </div>

      {/* Pending Queue Banner */}
      {pendingQueue.length > 0 && (
        <div className="queue-banner">
          <span className="queue-text">📋 {pendingQueue.length} submission(s) queued locally — not saved yet</span>
          <button className="btn btn-sm btn-primary" onClick={flushQueue}>Flush Queue</button>
        </div>
      )}

      <div className={`toast ${showToast ? 'show' : ''} toast-${toastType}`}>{toastMessage}</div>
    </div>
  );
}
