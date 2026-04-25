import React, { useState } from "react";
import { Mail, Lock, ArrowRight, AlertCircle, Check } from "lucide-react";
import { register, login } from "../api";

const rules = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "1 number", test: (p) => /[0-9]/.test(p) },
];

const Register = ({ onLogin, onGoLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allValid = rules.every((r) => r.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!allValid) {
      setError("Password requirements not met.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({ email, password });
      await login({ email, password });
      onLogin();
    } catch (err) {
      setError(err.message || "Registration failed.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-root">
      {/* LEFT */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">L</div>

          <div>
            <h1>Layak</h1>
            <p>Scholarship Agent</p>
          </div>
        </div>

        <div className="auth-hero">
          <span>START HERE</span>

          <h2>
            Fill once.
            <br />
            Apply
            <br />
            <em>everywhere.</em>
          </h2>

          <p>
            Build one profile and let AI tailor essays, applications and
            recommendations automatically.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="auth-mini">NEW ACCOUNT</span>
          <h3>Create your account</h3>

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

          <div className="auth-rules">
            {rules.map((rule) => {
              const pass = rule.test(password);

              return (
                <div key={rule.label} className={pass ? "pass" : ""}>
                  <Check size={12} />
                  {rule.label}
                </div>
              );
            })}
          </div>

          <label>Confirm Password</label>
          <div className="auth-input-wrap">
            <Lock size={16} />
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? "Creating..." : <>Create Account <ArrowRight size={16} /></>}
          </button>

          <div className="auth-switch">
            Already have an account?
            <button type="button" onClick={onGoLogin}>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;