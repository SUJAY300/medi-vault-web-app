import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../api/auth";
import { ROLE_CONFIG } from "../constants/roles";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ username, password, role });
      localStorage.setItem("medivault_user", JSON.stringify(data.user));
      navigate(`/dashboard/${data.user.role.toLowerCase()}`, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden />
      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">
          Choose your role and enter your credentials to access your dashboard.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="auth-role-label">I'm signing in as</span>
            <div className="auth-role-grid">
              {ROLE_CONFIG.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`auth-role-card ${role === r.value ? "active" : ""}`}
                  onClick={() => setRole(r.value)}
                  aria-pressed={role === r.value}
                  aria-label={`Select role ${r.label}`}
                  style={{ "--role-accent": r.accent }}
                >
                  <div className="auth-role-img-wrap">
                    <img
                      src={r.image}
                      alt=""
                      className="auth-role-img"
                      loading="lazy"
                    />
                    <div className="auth-role-img-overlay" />
                    <span className="auth-role-name">{r.label}</span>
                  </div>
                  <span className="auth-role-check" aria-hidden>✓</span>
                </button>
              ))}
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              required
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
      <Link to="/" className="auth-back">
        ← Back to home
      </Link>
    </div>
  );
}
