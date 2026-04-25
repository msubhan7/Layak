import React, { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { login } from "../api";

const Login = ({ onLogin, onGoRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login({ email, password });
      onLogin();
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">L</div>

          <div>
            <h1>Layak</h1>
            <p>Scholarship Agent</p>
          </div>
        </div>

        <div className="auth-hero">
          <span>FOR MALAYSIAN STUDENTS</span>

          <h2>
            One profile.
            <br />
            Every
            <br />
            <em>scholarship.</em>
          </h2>

          <p>
            Discover opportunities, generate essays, and track applications —
            all in one intelligent platform.
          </p>
        </div>

        <div className="auth-metrics">
          <div>
            <strong>6</strong>
            <small>AI Tools</small>
          </div>

          <div>
            <strong>∞</strong>
            <small>Essay Versions</small>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="auth-mini">WELCOME BACK</span>
          <h3>Sign in to Layak</h3>

          {error && (
            <div className="auth-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <label>Email</label>
          <div className="auth-input-wrap">
            <Mail size={16} />
            <input
              type="email"
              placeholder="you@student.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="auth-input-wrap">
            <Lock size={16} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? "Signing in..." : <>Sign In <ArrowRight size={16} /></>}
          </button>

          <div className="auth-switch">
            Don't have an account?
            <button type="button" onClick={onGoRegister}>
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;