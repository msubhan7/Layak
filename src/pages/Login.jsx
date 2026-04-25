/**
 * Login.jsx
 * ---------
 * Login page.
 * Routes: POST /auth/login
 * On success: stores JWT token (handled in api/auth.js) and calls onLogin().
 */

import React, { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { login } from "../api";

const Login = ({ onLogin, onGoRegister }) => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      onLogin();
    } catch (err) {
      setError(err.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }; 

  

  return (
    <div className="auth-root">
      {/* Left panel — editorial */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-wordmark">
            <div className="auth-logo">L</div>
            <div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>Layak</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 2 }}>
                Scholarship Agent
              </div>
            </div>
          </div>

          <div className="auth-hero">
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>
              For Malaysian students
            </div>
            <h1 className="serif" style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--ink)", margin: 0 }}>
              One profile.<br />
              Every<br />
              <span style={{ color: "var(--accent-2)", fontStyle: "italic" }}>scholarship.</span>
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.7, maxWidth: 320 }}>
              Layak uses Gemini AI to score your essays, check your eligibility,
              and rank opportunities — so you spend time writing, not searching.
            </p>
          </div>

          {/* Decorative stat strip */}
          <div className="auth-stats">
            {[
              { value: "6",    label: "AI tools"         },
              { value: "∞",    label: "Essay versions"   },
            ].map(({ value, label }) => (
              <div key={label} className="auth-stat">
                <div className="serif" style={{ fontSize: 26, fontWeight: 600, color: "var(--ink)", lineHeight: 1 }}>{value}</div>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative vertical line + circles */}
        <div className="auth-deco" aria-hidden>
          <div className="auth-deco-line" />
          <div className="auth-deco-dot" style={{ top: "20%" }} />
          <div className="auth-deco-dot" style={{ top: "50%", width: 8, height: 8, opacity: 0.4 }} />
          <div className="auth-deco-dot" style={{ top: "80%", width: 5, height: 5, opacity: 0.2 }} />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            Welcome back
          </div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
            Sign in to Layak
          </h2>

          {error && (
            <div className="auth-error">
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <Mail size={14} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@student.my"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "Signing in…" : <> Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <button onClick={onGoRegister} className="auth-switch-btn">
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
