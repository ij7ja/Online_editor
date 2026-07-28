import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || "";

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        body: JSON.stringify({ username, newPassword }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Cannot reach the server. Make sure to start the backend with 'npm start'.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setIsSuccess(true);
      setMessage(data.message || "Password updated successfully!");
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
          <button className="nav-button" onClick={() => navigate("/login")}>Login</button>
        </div>
      </nav>

      <main className="auth-section">
        <form className="glass-form fade-in-up" onSubmit={handleSubmit}>
          <h1 className="heading">Reset Password</h1>
          
          {!isSuccess ? (
            <>
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
                  autoComplete="new-password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  type="password"
                  value={newPassword}
                />
              </div>

              <div className="input-box">
                <input
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>

              {message && <p className="auth-message">{message}</p>}

              <button className="get-started-btn" disabled={isLoading} type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                {isLoading ? "Please wait..." : "Reset Password"}
              </button>

              <div className="register-link" style={{ marginTop: '20px' }}>
                <p>
                  Remembered your password?
                  <button className="link-button" onClick={() => navigate("/login")} type="button">
                    Login
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="auth-message" style={{ color: 'var(--success-color)' }}>{message}</p>
              <button className="get-started-btn" onClick={() => navigate("/login")} type="button" style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}>
                Go to Login
              </button>
            </>
          )}
        </form>
      </main>
    </div>
  );
};

export default ForgotPassword;
