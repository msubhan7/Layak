/**
 * Register.jsx
 * ------------
 * Sign-up page — collects email + password and calls POST /auth/register,
 * then immediately logs in so the user lands directly in the app.
 * Routes: POST /auth/register → POST /auth/login
 */

import React, { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle, Check } from "lucide-react";
import { register, login } from "../api";

const REQUIREMENTS = [
  { test: (p) => p.length >= 8,          label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p),        label: "One uppercase letter"  },
  { test: (p) => /[0-9]/.test(p),        label: "One number"            },
];

const Register = ({ onLogin, onGoLogin }) => {
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [showReqs,  setShowReqs]  = useState(false);

  const passwordsMatch = password === confirm && confirm.length > 0;
  const allReqsMet     = REQUIREMENTS.every((r) => r.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    if (!allReqsMet)     { setError("Password does not meet requirements."); return; }
    setError(null);
    setLoading(true);
    try {
      await register({ email, password });
      // Auto-login after registration
      await login({ email, password });
      onLogin();
    } catch (err) {
      setError(err.message ?? "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
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
              Start here
            </div>
            <h1 className="serif" style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--ink)", margin: 0 }}>
              Fill once.<br />
              Apply<br />
              <span style={{ color: "var(--accent-2)", fontStyle: "italic" }}>everywhere.</span>
            </h1>
            <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 24, lineHeight: 1.7, maxWidth: 320 }}>
              Create your profile once and let Layak's AI engine reuse it
              across every application — no copy-pasting, no starting from scratch.
            </p>
          </div>

          <div className="auth-steps">
            {[
              "Create your account",
              "Fill your profile once",
              "Let AI handle the rest",
            ].map((step, i) => (
              <div key={step} className="auth-step">
                <div className="auth-step-num serif">{i + 1}</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-deco" aria-hidden>
          <div className="auth-deco-line" />
          <div className="auth-deco-dot" style={{ top: "25%" }} />
          <div className="auth-deco-dot" style={{ top: "55%", width: 8, height: 8, opacity: 0.4 }} />
          <div className="auth-deco-dot" style={{ top: "78%", width: 5, height: 5, opacity: 0.2 }} />
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            New account
          </div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
            Create your account
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
                  onChange={(e) => { setPassword(e.target.value); setShowReqs(true); }}
                  required
                />
              </div>
              {/* Password requirements */}
              {showReqs && (
                <div className="auth-reqs">
                  {REQUIREMENTS.map(({ test, label }) => {
                    const met = test(password);
                    return (
                      <div key={label} className="auth-req" style={{ color: met ? "var(--accent)" : "var(--ink-4)" }}>
                        <Check size={11} style={{ opacity: met ? 1 : 0.3 }} />
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm password</label>
              <div className="auth-input-wrap">
                <Lock size={14} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{
                    borderColor: confirm.length > 0
                      ? passwordsMatch ? "var(--accent)" : "var(--danger)"
                      : undefined,
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? "Creating account…" : <>Create account <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{" "}
            <button onClick={onGoLogin} className="auth-switch-btn">Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
