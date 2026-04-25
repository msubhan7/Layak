/**
 * ui/index.jsx
 * ------------
 * Small, stateless UI primitives shared across the entire app.
 * Each component is kept intentionally simple — no business logic.
 * Import from this barrel file: import { Pill, ScoreRing, ... } from '../components/ui'
 */

import React from "react";
import { Check, AlertTriangle, X } from "lucide-react";

/* ─── Pill / Badge ───────────────────────────────────────────── */

/**
 * Generic badge pill.
 * @param {"default"|"accent"|"warn"|"danger"|"neutral"} variant
 */
export const Pill = ({ children, variant = "default", className = "" }) => (
  <span className={`pill ${variant !== "default" ? `pill-${variant}` : ""} ${className}`}>
    {children}
  </span>
);

/* ─── Section heading ────────────────────────────────────────── */

/**
 * Consistent page-section heading with an optional kicker line
 * and a right-side action slot.
 */
export const SectionTitle = ({ kicker, title, children }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      {kicker && (
        <div className="text-ink-4 mono text-[10.5px] tracking-widest uppercase mb-1.5">
          {kicker}
        </div>
      )}
      <h2 className="serif text-[28px] font-medium text-ink leading-tight">{title}</h2>
    </div>
    <div>{children}</div>
  </div>
);

/* ─── Status badge ───────────────────────────────────────────── */

const STATUS_MAP = {
  draft:             { label: "Draft",       variant: "neutral" },
  reviewed:          { label: "Reviewed",    variant: "accent"  },
  "needs-improvement": { label: "Needs Work", variant: "warn"  },
  ready:             { label: "Ready",       variant: "accent"  },
  submitted:         { label: "Submitted",   variant: "accent"  },
  shortlisted:       { label: "Shortlisted", variant: "accent"  },
  rejected:          { label: "Rejected",    variant: "danger"  },
  accepted:          { label: "Accepted",    variant: "accent"  },
  "—":               { label: "—",           variant: "neutral" },
};

export const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? { label: status, variant: "neutral" };
  return <Pill variant={s.variant}>{s.label}</Pill>;
};

/* ─── Eligibility badge ──────────────────────────────────────── */

export const EligibilityBadge = ({ e }) => {
  if (e === "eligible")
    return <Pill variant="accent"><Check size={11} /> Eligible</Pill>;
  if (e === "warnings")
    return <Pill variant="warn"><AlertTriangle size={11} /> Review</Pill>;
  return <Pill variant="danger"><X size={11} /> Ineligible</Pill>;
};

/* ─── Score ring ─────────────────────────────────────────────── */

/**
 * Circular progress ring rendered with a CSS conic-gradient.
 * Accepts any score 0–100; renders "—" when score is null/undefined.
 */
export const ScoreRing = ({ score, size = 56 }) => {
  const pct = score ? `${score}%` : "0%";
  const innerSize = size - 10;

  return (
    <div
      className="score-ring"
      style={{ width: size, height: size, "--pct": pct }}
    >
      <div
        style={{ width: innerSize, height: innerSize }}
        className="flex items-center justify-center"
      >
        <span className="serif text-[15px] font-semibold text-ink">
          {score ?? "—"}
        </span>
      </div>
    </div>
  );
};
