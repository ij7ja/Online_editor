import { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../auth";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import "../App.css";

export default function CodeEditor() {
  const outputRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("html");
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <h1>CodeMaster</h1>
  </body>
</html>`);
  const [css, setCss] = useState(`body{
  background-color: #ddd;
  font-family: tahoma;
}
  
`);
  const [js, setJs] = useState(`console.log('Javascript is running');`);

  const [autoRun, setAutoRun] = useState(false);
  const [srcDoc, setSrcDoc] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState({ html: true, css: true, js: true });

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

  return (
    <div className="container">
      <nav className="header">
        <h1 className="nav-logo" style={{ margin: 0 }}>
          <span className="highlight">&lt;/&gt;</span> CodeMaster
        </h1>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "Light/Dark" : "Light/Dark"}
          </button>

          <button className="logout-button" onClick={handleLogout}>
            Logout
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
                <span>⬇</span> Download 
              </button>
              
              <button
                className="fullscreen-btn"
                onClick={toggleFullscreen}
              >
                ⛶ Full Screen
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "var(--panel-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-color)", color: "var(--text-color)", minWidth: "320px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
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
              <button onClick={executeDownload} disabled={!downloadOptions.html && !downloadOptions.css && !downloadOptions.js} style={{ padding: "8px 16px", backgroundColor: "var(--accent-color)", border: "none", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "600", opacity: (!downloadOptions.html && !downloadOptions.css && !downloadOptions.js) ? 0.5 : 1 }}>Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
