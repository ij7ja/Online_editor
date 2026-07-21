import { useNavigate } from "react-router-dom";
import "../App.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <nav className="home-navbar fade-in">
        <div className="nav-logo">
          <span className="highlight">&lt;/&gt;</span> CodeMaster
        </div>
        <div className="nav-links">
          <a href="#">Features</a>
          <a href="#">About</a>
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

      <footer className="home-footer fade-in">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="nav-logo"><span className="highlight">&lt;/&gt;</span> CodeMaster</div>
            <p>Your ultimate cloud development environment.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
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
