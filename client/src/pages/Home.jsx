import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Home = () => {
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
    <div className="home-container" style={{ position: "relative" }}>
      {/* Background Animation Elements */}
      <div className="bg-animation">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <nav className="home-navbar fade-in">
        <div className="nav-logo">
          <span className="highlight">&lt;/&gt;</span> CodeMaster
        </div>
        <div className="nav-links">
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features').scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
          <a href="#">About</a>
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

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title fade-in-up">
            Code <span className="highlight">Faster</span>. Build <span className="highlight">Better</span>.
          </h1>
          <p className="hero-description fade-in-up delay-1">
            Experience a powerful, lightning-fast online code editor. Write HTML, CSS, and JavaScript directly in your browser with real-time previews, beautiful themes, and premium syntax highlighting. No setup required.
          </p>
          <div className="fade-in-up delay-2">
            <button className="get-started-btn" onClick={() => navigate("/login")}>
              Get Started Free
              <span className="arrow">→</span>
            </button>
          </div>
        </div>

        <div className="hero-visual fade-in-up delay-3">
          <div className="glass-editor-mock">
            <div className="mock-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="mock-body">
              <pre>
                <code>
                  <span className="mock-keyword">const</span> <span className="mock-variable">editor</span> = <span className="mock-string">"awesome"</span>;
                  <br />
                  <span className="mock-keyword">function</span> <span className="mock-function">startCoding</span>() {'{'}
                  <br />
                  &nbsp;&nbsp;<span className="mock-keyword">return</span> <span className="mock-string">"Hello World!"</span>;
                  <br />
                  {'}'}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="features-section fade-in-up delay-1">
        <h2 className="features-title">Why Choose <span className="highlight">CodeMaster</span>?</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Experience instant feedback with our optimized real-time rendering engine. No more waiting for builds.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful Themes</h3>
            <p>Choose from carefully crafted dark and light themes that are easy on the eyes for those long coding sessions.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🚀</div>
            <h3>Zero Setup</h3>
            <p>Start coding immediately in your browser. No installation or configuration required. Just pure development.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">💻</div>
            <h3>VS Code Experience</h3>
            <p>Powered by Monaco Editor, enjoy advanced syntax highlighting, intelligent autocompletion, and familiar tools.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Workspaces</h3>
            <p>Save your code projects securely in the cloud. Access your HTML, CSS, and JS from any device, anytime.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">📥</div>
            <h3>Export to Zip</h3>
            <p>Done coding? Download your entire project as a clean, structured .zip archive with a single click.</p>
          </div>
        </div>
      </section>

      <section className="cta-banner fade-in-up delay-2">
        <div className="cta-banner-content">
          <p className="cta-text">Already signed up? Click here</p>
          <button className="cta-login-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Login
            <span className="arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </span>
          </button>
        </div>
      </section>

      <footer className="home-footer fade-in">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-logo"><span className="highlight">&lt;/&gt;</span> CodeMaster</div>
            <p>Your ultimate cloud development environment.</p>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Us</a>
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
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CodeMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
