import { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../auth";
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
      <h1>Online code editor</h1>
    </body>
    </html>`);
  const [css, setCss] = useState(`h1{
  color: green;
}
  
`);
  const [js, setJs] = useState(`console.log('Javascript is running');`);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

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

  const editorTheme = theme === "dark" ? "vs-dark" : "light";

  const srcDoc = html
  .replace("</head>", `<style>${css}</style></head>`)
  .replace("</body>", `<script>${js}</script></body>`);

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
        <h1>Online Code Editor</h1>

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
          <div className="tabs">
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

          <div className="editor-box">{renderEditor()}</div>
        </div>

        <div className="output-pane" ref={outputRef}>
  <div className="output-header">
    <h2>Output</h2>

    <button
      className="fullscreen-btn"
      onClick={toggleFullscreen}
    >
      ⛶ Full Screen
    </button>
  </div>

  <iframe
    srcDoc={srcDoc}
    title="output"
    sandbox="allow-scripts"
    className="output-frame"
  />
</div>
      </div>
    </div>
  );
}
