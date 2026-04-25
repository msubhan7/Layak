/**
 * AIToolkit.jsx
 * -------------
 * Hub page for all four AI features.
 * Clicking a tool card mounts the corresponding sub-tool in place
 * of this hub view; a "back" button returns here.
 */

import React, { useState } from "react";
import {
  FileCheck, Target, Sparkles, Zap, ArrowRight, ArrowUpRight,
} from "lucide-react";
import { SectionTitle } from "../components/ui";
import AIScorer     from "./AIScorer";
import AIEligibility from "./AIEligibility";
import AIMatcher    from "./AIMatcher";
import AIReshaper   from "./AIReshaper";
import { createEssay } from "../api";

/* ─── Tool registry ──────────────────────────────────────────── */
const TOOLS = [
  {
    id:     "scorer",
    kicker: "Evaluate & improve",
    title:  "Essay Scorer",
    desc:   "Scores your essay against a scholarship's prompt and evaluation criteria, returning criterion scores, weak sections, and line-level revision suggestions.",
    icon:   FileCheck,
  },
  {
    id:     "eligibility",
    kicker: "Before you apply",
    title:  "Eligibility Checker",
    desc:   "Compares scholarship rules against your profile — citizenship, CGPA, financial status, and other conditions — and flags hard disqualifiers before you waste hours writing.",
    icon:   Target,
  },
  {
    id:     "matcher",
    kicker: "Discover opportunities",
    title:  "Smart Scholarship Matcher",
    desc:   "Ranks every scholarship in the database by fit, with a reason and a risk for each — so you know where to focus first.",
    icon:   Sparkles,
  },
  {
    id:     "reshaper",
    kicker: "Adapt, don't re-invent",
    title:  "Content Reshaper",
    desc:   "Takes writing you've already done and reshapes it for a different prompt or word limit — preserving your voice, never adding fake achievements.",
    icon:   Zap,
  },
];

/* ─── Tool card ──────────────────────────────────────────────── */
const ToolCard = ({ tool, onOpen }) => {
  const Icon = tool.icon;
  return (
    <div
      onClick={onOpen}
      className="card card-hover p-7 cursor-pointer relative group overflow-hidden"
    >
      {/* Subtle glow blob */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.04]"
        style={{ background: "var(--accent)", filter: "blur(40px)" }}
      />

      <div className="flex items-start gap-5 relative">
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-soft)" }}
        >
          <Icon size={22} className="text-accent" />
        </div>

        <div className="flex-1">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-1">
            {tool.kicker}
          </div>
          <h3 className="serif text-[22px] font-medium text-ink leading-tight">{tool.title}</h3>
          <p className="text-[13px] text-ink-2 leading-relaxed mt-2.5">{tool.desc}</p>
          <div className="flex items-center gap-1.5 text-[12.5px] text-accent mt-4 font-medium">
            Open tool{" "}
            <ArrowUpRight
              size={13}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────── */
const AIToolkit = ({ setPage, setSelectedEssay }) => {
  const [activeTool, setActiveTool] = useState(null);

  // Render active sub-tool
  const back = () => setActiveTool(null);
  if (activeTool === "scorer")      return <AIScorer      back={back} setPage={setPage} />;
  if (activeTool === "eligibility") return <AIEligibility back={back} />;
  if (activeTool === "matcher")     return <AIMatcher     back={back} />;
  if (activeTool === "reshaper") return <AIReshaper back={back} setPage={setPage} setSelectedEssay={setSelectedEssay} />;

  return (
    <div className="px-8 py-8 fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="mono text-[10.5px] text-ink-4 tracking-widest uppercase mb-2">
          Powered by Z.ai · GLM-5.1
        </div>
        <h1 className="serif text-[36px] font-medium leading-tight">The AI toolkit</h1>
        <p className="text-ink-2 mt-3 max-w-2xl leading-relaxed">
          Four focused tools. Each one takes your stored profile, essays, and scholarship data
          and returns something specific you can act on. No generic chat, no hallucinated
          achievements.
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onOpen={() => setActiveTool(tool.id)} />
        ))}
      </div>

      {/* Triage banner */}
      <div
        className="mt-10 card p-7"
        style={{ background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" }}
      >
        <div className="flex items-start gap-6">
          <Sparkles size={26} style={{ color: "#D4CFBD" }} />
          <div>
            <div
              className="mono text-[10px] tracking-widest uppercase mb-2"
              style={{ color: "#9A978E" }}
            >
              Triage run · last Tuesday
            </div>
            <h3 className="serif text-[24px] font-medium mb-2">
              You have 5 hours of work across 6 applications.
            </h3>
            <p
              className="text-[13.5px] leading-relaxed max-w-2xl"
              style={{ color: "#D4CFBD" }}
            >
              The agent reviewed your pipeline and recommends: (1) finish the Cambridge essay
              first — it closes in 5 days, (2) upload the Recommendation Letter before anything
              else, (3) skip Shell — you fail the leadership criterion.
            </p>
            <button
              className="btn btn-sm mt-4"
              style={{ background: "#F4F2EA", color: "var(--ink)" }}
            >
              Re-run triage <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolkit;
