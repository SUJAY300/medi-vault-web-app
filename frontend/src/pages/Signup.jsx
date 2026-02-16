import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "../api/auth";
import { ROLE_CONFIG } from "../constants/roles";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Patient");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await signup({ username, password, role, fullName });
      setSuccess("Account created. Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" aria-hidden />
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">
          Choose your role and fill in your details to get started with MediVault.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <span className="auth-role-label">I'm signing up as</span>
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
            <label className="auth-label" htmlFor="signup-name">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder="e.g. Dr. Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="auth-input"
              required
              autoComplete="name"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-username">
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              required
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
              autoComplete="new-password"
            />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="status">{success}</p>}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
      <Link to="/" className="auth-back">
        ← Back to home
      </Link>
    </div>
  );
}
