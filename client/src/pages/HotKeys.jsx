import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const HotKeys = () => {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <div className="home-container" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <nav className="home-navbar fade-in">
        <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span className="highlight">&lt;/&gt;</span> CodeMaster
        </div>
        <div className="nav-links">
          <button className="nav-button" onClick={toggleTheme} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%", width: "40px", height: "40px" }} title="Toggle Theme" aria-label="Toggle Theme">
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
          <button className="nav-button" onClick={() => navigate("/login")}>Login</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "80px 20px 40px", maxWidth: "800px", margin: "0 auto", width: "100%", zIndex: 1 }}>
        <h1 className="hero-title fade-in-up" style={{ textAlign: "center", marginBottom: "40px" }}>
          Editor <span className="highlight">HotKeys</span> feels Handy
        </h1>
        
        <div className="glass-panel fade-in-up delay-1" style={{ padding: "30px", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px 15px", color: "var(--text-color)", opacity: 0.8 }}>Action</th>
                <th style={{ padding: "12px 15px", color: "var(--text-color)", opacity: 0.8 }}>Shortcut</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "15px", color: "var(--text-color)" }}>Run Code</td>
                <td style={{ padding: "15px" }}>
                  <kbd style={{ background: "var(--tab-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", color: "var(--text-color)" }}>Ctrl</kbd> + <kbd style={{ background: "var(--tab-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", color: "var(--text-color)" }}>Enter</kbd>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "15px", color: "var(--text-color)" }}>Toggle Fullscreen Output</td>
                <td style={{ padding: "15px" }}>
                  <kbd style={{ background: "var(--tab-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", color: "var(--text-color)" }}>Alt</kbd> + <kbd style={{ background: "var(--tab-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", color: "var(--text-color)" }}>F</kbd>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "15px", color: "var(--text-color)" }}>Toggle Light / Dark Mode</td>
                <td style={{ padding: "15px" }}>
                  <kbd style={{ background: "var(--tab-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", color: "var(--text-color)" }}>Alt</kbd> + <kbd style={{ background: "var(--tab-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", color: "var(--text-color)" }}>T</kbd>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "15px", color: "var(--text-color)" }}>HTML / CSS / Java Script Emmet</td>
                <td style={{ padding: "15px" }}>
                  <kbd style={{ background: "var(--tab-bg)", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", color: "var(--text-color)" }}>Tab</kbd>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer className="home-footer fade-in" style={{ marginTop: "auto" }}>
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}><span className="highlight">&lt;/&gt;</span> CodeMaster</div>
            <p>Your ultimate cloud development environment.</p>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/hotkeys'); }} style={{ color: "var(--accent-color)" }}>HotKeys</a>
            </div>
            <div className="social-icons">
              <a href="https://github.com/ij7ja/Online_editor" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HotKeys;
