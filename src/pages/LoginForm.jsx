// import { FaUserAlt } from "react-icons/fa";
// import { FaLock } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../auth";
import "../App.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitLabel = isRegistering ? "Create account" : "Login";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const endpoint = isRegistering ? "/api/register" : "/api/login";
      const response = await fetch(endpoint, {
        body: JSON.stringify({ password, username }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Cannot reach the login server. Make sure to start the full app with 'npm run dev:full'.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      saveAuth({
        remember,
        token: data.token,
        user: data.user,
      });
      navigate("/editor", { replace: true });
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Cannot reach the login server. Start it with npm run server."
          : error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((currentValue) => !currentValue);
    setMessage("");
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="heading">{submitLabel}</h1>

        <div className="input-box">
          <input
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            required
            type="text"
            value={username}
          />
          {/* <FaUserAlt className="icon" /> */}
        </div>

        <div className="input-box">
          <input
            autoComplete={isRegistering ? "new-password" : "current-password"}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
            type="password"
            value={password}
          />
          {/* <FaLock className="icon" /> */}
        </div>

        <div className="remember-forgot">
          <label>
            <input
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              type="checkbox"
            /> Remember me
          </label>
          <a href="#">Forgot password?</a>
        </div>

        {message && <p className="auth-message">{message}</p>}

        <button className="button" disabled={isLoading} type="submit">
          {isLoading ? "Please wait..." : submitLabel}
        </button>

        <div className="register-link">
          <p>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <button className="link-button" onClick={toggleMode} type="button">
              {isRegistering ? " Login" : " Sign Up"}
            </button>
          </p>
        </div>
      </form>
    </main>
  );
};

export default LoginForm;
