import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../auth";
import "../App.css";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/login", {
        body: JSON.stringify({ password, username }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Cannot reach the login server. Make sure to start the backend with 'npm start'.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      saveAuth({ remember, token: data.token, user: data.user });
      navigate("/editor", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <nav className="home-navbar fade-in">
        <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate("/")}>
          <span className="highlight">&lt;/&gt;</span> CodeMaster
        </div>
        <div className="nav-links">
          <button className="nav-button" onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </nav>

      <main className="auth-section">
        <form className="glass-form fade-in-up" onSubmit={handleSubmit}>
          <h1 className="heading">Welcome Back</h1>
          
          <div className="input-box">
            <input
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              type="text"
              value={username}
            />
          </div>

          <div className="input-box">
            <input
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
          </div>

          <div className="remember-forgot">
            <label>
              <input
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                type="checkbox"
              /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          {message && <p className="auth-message">{message}</p>}

          <button className="get-started-btn" disabled={isLoading} type="submit" style={{ width: '100%', justifyContent: 'center' }}>
            {isLoading ? "Please wait..." : "Login"}
          </button>

          <div className="register-link">
            <p>
              Don't have an account?
              <button className="link-button" onClick={() => navigate("/signup")} type="button">
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
