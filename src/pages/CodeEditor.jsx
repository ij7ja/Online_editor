import { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getAuthToken, getAuthUser } from "../auth";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "../App.css";

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>CodeMaster</h1>
  </body>
</html>`;

const DEFAULT_CSS = `body{
  background-color: #ddd;
  font-family: tahoma;
}
  
`;

const DEFAULT_JS = `console.log('Javascript is running');`;

export default function CodeEditor() {
  const outputRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("html");
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);

  const [autoRun, setAutoRun] = useState(false);
  const [srcDoc, setSrcDoc] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState({ html: true, css: true, js: true });

  const [codeSpaces, setCodeSpaces] = useState([]);
  const [currentCodeSpaceId, setCurrentCodeSpaceId] = useState(null);
  const [showSpacesModal, setShowSpacesModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [editingSpaceId, setEditingSpaceId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const updateSrcDoc = useCallback(() => {
    setSrcDoc(
      html
        .replace("</head>", `<style>${css}</style></head>`)
        .replace("</body>", `<script>${js}</script></body>`)
    );
  }, [html, css, js]);

  useEffect(() => {
    if (autoRun) {
      updateSrcDoc();
    }
  }, [html, css, js, autoRun, updateSrcDoc]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchCodeSpaces = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch("http://localhost:3001/api/codespaces", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCodeSpaces(data);
      }
    } catch (err) {
      console.error("Failed to fetch code spaces:", err);
    }
  }, []);

  useEffect(() => {
    fetchCodeSpaces();
  }, [fetchCodeSpaces]);

  // Auto-save logic
  useEffect(() => {
    if (!currentCodeSpaceId) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        const token = getAuthToken();
        if (!token) return;
        await fetch(`http://localhost:3001/api/codespaces/${currentCodeSpaceId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ html, css, js })
        });
        // Refresh the list to update timestamps
        fetchCodeSpaces();
      } catch (err) {
        console.error("Auto-save failed", err);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [html, css, js, currentCodeSpaceId, fetchCodeSpaces]);

  const handleCreateNewSpace = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Force save current project immediately before switching
      if (currentCodeSpaceId) {
        setIsSaving(true);
        await fetch(`http://localhost:3001/api/codespaces/${currentCodeSpaceId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ html, css, js })
        });
        fetchCodeSpaces();
      }

      const res = await fetch("http://localhost:3001/api/codespaces", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: newProjectTitle.trim() || undefined,
          html: DEFAULT_HTML,
          css: DEFAULT_CSS,
          js: DEFAULT_JS
        })
      });
      if (res.ok) {
        const newSpace = await res.json();
        setCodeSpaces([newSpace, ...codeSpaces]);
        setCurrentCodeSpaceId(newSpace._id);
        setHtml(newSpace.html);
        setCss(newSpace.css);
        setJs(newSpace.js);
        setSrcDoc(
          newSpace.html
            .replace("</head>", `<style>${newSpace.css}</style></head>`)
            .replace("</body>", `<script>${newSpace.js}</script></body>`)
        );
        setNewProjectTitle("");
        setShowSpacesModal(false);
      }
    } catch (err) {
      console.error("Failed to create space", err);
    }
  };

  const handleDeleteSpace = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`http://localhost:3001/api/codespaces/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCodeSpaces(codeSpaces.filter(space => space._id !== id));
        if (currentCodeSpaceId === id) {
          setCurrentCodeSpaceId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete space", err);
    }
  };

  const handleRenameSpace = async (e, id) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingSpaceId(null);
      return;
    }
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`http://localhost:3001/api/codespaces/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title: editTitle.trim() })
      });
      if (res.ok) {
        const updatedSpace = await res.json();
        setCodeSpaces(codeSpaces.map(s => s._id === id ? updatedSpace : s));
        setEditingSpaceId(null);
      }
    } catch (err) {
      console.error("Failed to rename space", err);
    }
  };

  const handleSelectSpace = async (space) => {
    if (currentCodeSpaceId) {
      try {
        const token = getAuthToken();
        if (token) {
          setIsSaving(true);
          await fetch(`http://localhost:3001/api/codespaces/${currentCodeSpaceId}`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ html, css, js })
          });
          setIsSaving(false);
        }
      } catch (err) {
        console.error("Failed to save before switching", err);
      }
    }

    setCurrentCodeSpaceId(space._id);
    setHtml(space.html);
    setCss(space.css);
    setJs(space.js);
    setSrcDoc(
      space.html
        .replace("</head>", `<style>${space.css}</style></head>`)
        .replace("</body>", `<script>${space.js}</script></body>`)
    );
    setShowSpacesModal(false);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await outputRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Allow Alt+F or Ctrl+Shift+F for Fullscreen
      if ((e.altKey && e.key.toLowerCase() === "f") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f")) {
        e.preventDefault();
        toggleFullscreen();
      }
      
      // Allow Ctrl+Enter for Run
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        updateSrcDoc();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateSrcDoc]);

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const executeDownload = async () => {
    const zip = new JSZip();

    let finalHtml = html;
    if (!finalHtml.includes("style.css") && downloadOptions.css) {
      finalHtml = finalHtml.replace("</head>", `  <link rel="stylesheet" href="style.css" />\n  </head>`);
    }
    if (!finalHtml.includes("script.js") && downloadOptions.js) {
      finalHtml = finalHtml.replace("</body>", `  <script src="script.js"></script>\n  </body>`);
    }

    if (downloadOptions.html) zip.file("index.html", finalHtml);
    if (downloadOptions.css) zip.file("style.css", css);
    if (downloadOptions.js) zip.file("script.js", js);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "code_master_project.zip");
    
    setShowDownloadModal(false);
  };

  const editorTheme = theme === "dark" ? "vs-dark" : "light";

  const renderEditor = () => {
    switch (activeTab) {
      case "html":
        return (
          <Editor
            height="100%"
            language="html"
            theme={editorTheme}
            value={html}
            onChange={(value) => setHtml(value || "")}
          />
        );

      case "css":
        return (
          <Editor
            height="100%"
            language="css"
            theme={editorTheme}
            value={css}
            onChange={(value) => setCss(value || "")}
          />
        );

      case "js":
        return (
          <Editor
            height="100%"
            language="javascript"
            theme={editorTheme}
            value={js}
            onChange={(value) => setJs(value || "")}
          />
        );

      default:
        return null;
    }
  };

  const currentSpace = codeSpaces.find(s => s._id === currentCodeSpaceId);

  return (
    <div className="container">
      <nav className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 className="nav-logo" style={{ margin: 0 }}>
            <span className="highlight">&lt;/&gt;</span> CodeMaster
          </h1>
          {currentSpace && (
            <>
              <span style={{ color: "var(--border-color)", fontSize: "1.2rem" }}>|</span>
              <span style={{ color: "var(--text-color)", fontSize: "0.95rem", fontWeight: "500", backgroundColor: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                {currentSpace.title}
              </span>
            </>
          )}
        </div>

        <div className="header-actions">
          {isSaving && <span style={{ fontSize: "14px", color: "var(--accent-color)", fontWeight: "600" }}>Saving...</span>}
          <button className="theme-toggle" onClick={() => setShowSpacesModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span className="btn-text">Create</span>
          </button>

          <button className="theme-toggle" onClick={toggleTheme} style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Toggle Theme">
            {theme === "dark" ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </>
            )}
          </button>

          <button className="theme-toggle" onClick={() => setShowProfileModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className="btn-text">Profile</span>
          </button>

          <button className="logout-button" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="btn-text">Logout</span>
          </button>
        </div>
      </nav>

      <div className="main">
        <div className="editor-pane">
          <div className="tabs" style={{ display: "flex", alignItems: "center", paddingRight: "16px" }}>
            <div className="tab-buttons" style={{ display: "flex", gap: "10px" }}>
              <button
                className={activeTab === "html" ? "tab active-tab" : "tab"}
                onClick={() => setActiveTab("html")}
              >
                HTML
              </button>

              <button
                className={activeTab === "css" ? "tab active-tab" : "tab"}
                onClick={() => setActiveTab("css")}
              >
                CSS
              </button>

              <button
                className={activeTab === "js" ? "tab active-tab" : "tab"}
                onClick={() => setActiveTab("js")}
              >
                JavaScript
              </button>
            </div>
            
            <div className="run-controls" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "15px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "var(--text-color)" }}>
                Auto 
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={autoRun}
                    onChange={(e) => setAutoRun(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              
              <button
                onClick={updateSrcDoc}
                disabled={autoRun}
                title="Shortcut: Ctrl+Enter"
                style={{
                  padding: "6px 16px",
                  cursor: autoRun ? "not-allowed" : "pointer",
                  backgroundColor: autoRun ? "var(--tab-bg)" : "#dc143c",
                  color: autoRun ? "var(--text-color)" : "#fff",
                  border: autoRun ? "1px solid var(--border-color)" : "1px solid #dc143c",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "0.3s",
                  opacity: autoRun ? 0.5 : 1
                }}
              >
                Run
              </button>
            </div>
          </div>

          <div className="editor-box">{renderEditor()}</div>
        </div>

        <div className="output-pane" ref={outputRef}>
          <div className="output-header">
            <h2>Output</h2>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="fullscreen-btn"
                onClick={handleDownloadClick}
                style={{ backgroundColor: "var(--accent-color)", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> 
                <span className="btn-text">Download</span>
              </button>
              
              <button
                className="fullscreen-btn"
                onClick={toggleFullscreen}
                title="Shortcut: Alt+F"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                <span className="btn-text">Full Screen</span>
              </button>
            </div>
          </div>

          <iframe
            srcDoc={srcDoc}
            title="output"
            sandbox="allow-scripts"
            className="output-frame"
          />
        </div>
      </div>

      {showDownloadModal && (
        <div className="modal-overlay">
          <div className="modal-content small">
            <h3 style={{ margin: "0 0 20px 0", fontSize: "1.2rem" }}>Download Options</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "1rem" }}>
                <input type="checkbox" checked={downloadOptions.html} onChange={(e) => setDownloadOptions({...downloadOptions, html: e.target.checked})} style={{ accentColor: "var(--accent-color)", width: "16px", height: "16px" }} /> 
                HTML File
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "1rem" }}>
                <input type="checkbox" checked={downloadOptions.css} onChange={(e) => setDownloadOptions({...downloadOptions, css: e.target.checked})} style={{ accentColor: "var(--accent-color)", width: "16px", height: "16px" }} /> 
                CSS File
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "1rem" }}>
                <input type="checkbox" checked={downloadOptions.js} onChange={(e) => setDownloadOptions({...downloadOptions, js: e.target.checked})} style={{ accentColor: "var(--accent-color)", width: "16px", height: "16px" }} /> 
                JavaScript File
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setShowDownloadModal(false)} style={{ padding: "8px 16px", backgroundColor: "transparent", border: "1px solid var(--border-color)", color: "var(--text-color)", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
              <button onClick={executeDownload} disabled={!downloadOptions.html && !downloadOptions.css && !downloadOptions.js} style={{ padding: "8px 16px", backgroundColor: "var(--accent-color)", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "600", opacity: (!downloadOptions.html && !downloadOptions.css && !downloadOptions.js) ? 0.5 : 1 }}>Download Now</button>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (() => {
        const user = getAuthUser();
        return (
          <div className="modal-overlay">
            <div className="modal-content small">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "1.5rem" }}>My Profile</h3>
                <button onClick={() => setShowProfileModal(false)} style={{ background: "none", border: "none", color: "var(--text-color)", cursor: "pointer", fontSize: "2rem", lineHeight: "1" }}>&times;</button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "#888", marginBottom: "6px", fontWeight: "500" }}>Username</label>
                  <input type="text" value={user?.username || "Unknown"} readOnly style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.05)", color: "var(--text-color)", cursor: "not-allowed" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "#888", marginBottom: "6px", fontWeight: "500" }}>Password</label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={user?.password || "********"} 
                      readOnly 
                      style={{ width: "100%", boxSizing: "border-box", padding: "10px 40px 10px 10px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.05)", color: "var(--text-color)", cursor: "not-allowed", fontSize: "16px" }} 
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "10px", background: "none", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => {setShowProfileModal(false); setShowPassword(false);}} style={{ padding: "8px 16px", backgroundColor: "var(--accent-color)", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {showSpacesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem" }}>Your Spaces</h3>
              <button onClick={() => setShowSpacesModal(false)} style={{ background: "none", border: "none", color: "var(--text-color)", cursor: "pointer", fontSize: "2rem", lineHeight: "1" }}>&times;</button>
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input 
                type="text" 
                placeholder="Project Name (optional)" 
                value={newProjectTitle} 
                onChange={(e) => setNewProjectTitle(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} 
              />
              <button onClick={handleCreateNewSpace} style={{ padding: "10px 16px", backgroundColor: "var(--accent-color)", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "600", transition: "0.3s", whiteSpace: "nowrap" }}>
                + New Space
              </button>
            </div>
            
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "5px" }}>
              {codeSpaces.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ color: "#888", fontSize: "1.1rem", marginBottom: "10px" }}>You don't have any projects yet.</p>
                  <p style={{ color: "#666", fontSize: "0.9rem" }}>Create a new code space to start auto-saving your work!</p>
                </div>
              ) : (
                codeSpaces.map(space => (
                  <div key={space._id} onClick={() => handleSelectSpace(space)} style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer", backgroundColor: currentCodeSpaceId === space._id ? "rgba(20, 184, 166, 0.1)" : "var(--tab-bg)", borderColor: currentCodeSpaceId === space._id ? "var(--accent-color)" : "var(--border-color)", transition: "0.3s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        {editingSpaceId === space._id ? (
                          <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              autoFocus
                              style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--accent-color)", backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
                            />
                            <button onClick={(e) => handleRenameSpace(e, space._id)} style={{ padding: "4px 8px", backgroundColor: "var(--accent-color)", border: "none", color: "#fff", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Save</button>
                            <button onClick={() => setEditingSpaceId(null)} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid var(--border-color)", color: "var(--text-color)", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{space.title}</h4>
                            <button onClick={(e) => { e.stopPropagation(); setEditingSpaceId(space._id); setEditTitle(space.title); }} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center" }} title="Rename Project">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                            </button>
                          </>
                        )}
                        {currentCodeSpaceId === space._id && <span style={{ fontSize: "12px", color: "var(--accent-color)", fontWeight: "bold", background: "rgba(20, 184, 166, 0.2)", padding: "4px 8px", borderRadius: "12px" }}>Active</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>Last updated: {new Date(space.updatedAt).toLocaleString()}</p>
                    </div>
                    <button onClick={(e) => handleDeleteSpace(e, space._id)} style={{ background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px" }} title="Delete Project">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
