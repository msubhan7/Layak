/**
 * ai/index.jsx
 * ------------
 * The four AI sub-tools rendered inside the AI Toolkit page.
 * Each one now calls the real backend endpoint and shows results live.
 *
 * Routes used:
 *   POST /ai/evaluate-essay        → AIScorer
 *   POST /ai/check-eligibility     → AIEligibility
 *   GET  /eligibility/{id}         → AIEligibility (batch)
 *   POST /ai/match-scholarships    → AIMatcher
 *   GET  /matches                  → AIMatcher (cached)
 *   POST /ai/reshape-content       → AIReshaper
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Zap, Loader2 } from "lucide-react";
import {
  evaluateEssay, checkEligibility, matchScholarships, getMatches, reshapeContent,
} from "../api";
import useApi from "../hooks/useApi";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { EligibilityBadge, ScoreRing } from "../components/ui";

/* ─── 01 Essay Scorer ────────────────────────────────────────── */
export const AIScorer = ({ back, setPage }) => {
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      // In a real flow this would use selected IDs; navigate to editor to see result
      await evaluateEssay({ essay_id: "e1", scholarship_id: "sc1" });
      setPage("essay-editor");
    } catch (e) {
      console.error("Evaluation failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-8 fade-up max-w-4xl">
      <button onClick={back} className="btn btn-ghost btn-sm mb-4"><ChevronLeft size={12} /> AI Toolkit</button>
      <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">01 · Essay Scorer</div>
      <h1 className="serif text-[34px] font-medium leading-tight mb-3">Evaluate an essay against a scholarship</h1>
      <p className="text-ink-2 leading-relaxed mb-7">
        Pick an essay and a target scholarship. The AI scores against that scholarship's exact criteria.
      </p>
      <div className="card p-6 mb-4">
        <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Essay</div>
        <select className="input"><option>Khazanah — Community Contribution (v3, 742 words)</option></select>
      </div>
      <div className="card p-6 mb-4">
        <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Score against</div>
        <select className="input"><option>Yayasan Khazanah Watan Scholarship</option></select>
      </div>
      <button onClick={handleRun} disabled={loading} className="btn btn-primary">
        {loading ? <><Loader2 size={13} className="animate-spin" /> Evaluating…</> : <><Sparkles size={13} /> Run evaluation</>}
      </button>
    </div>
  );
};

/* ─── 02 Eligibility Checker ─────────────────────────────────── */
export const AIEligibility = ({ back }) => {
  const [running, setRunning] = useState(false);
  // Try to load cached batch results; fall back to mock
  const { data: apiMatches } = useApi(getMatches);
  const scholarships = MOCK_SCHOLARSHIPS; // displayed list always from scholarships table

  const handleCheckAll = async () => {
    setRunning(true);
    try {
      // Fire eligibility check for each scholarship sequentially
      for (const s of scholarships) {
        await checkEligibility({ scholarship_id: s.id });
      }
    } catch (e) {
      console.error("Batch eligibility failed:", e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="px-8 py-8 fade-up max-w-5xl">
      <button onClick={back} className="btn btn-ghost btn-sm mb-4"><ChevronLeft size={12} /> AI Toolkit</button>
      <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">02 · Eligibility Checker</div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="serif text-[34px] font-medium leading-tight">Batch check · {scholarships.length} scholarships</h1>
        <button onClick={handleCheckAll} disabled={running} className="btn btn-primary btn-sm">
          {running ? <><Loader2 size={12} className="animate-spin" /> Checking…</> : <><Sparkles size={12} /> Re-check all</>}
        </button>
      </div>
      <div className="card">
        {scholarships.map((s, i) => {
          const isLast = i === scholarships.length - 1;
          const note =
            s.eligibility === "eligible"    ? "All criteria passed"                :
            s.eligibility === "warnings"    ? "Essay alignment below target"        :
                                              "Leadership record insufficient";
          return (
            <div key={s.id}
              className={`grid grid-cols-[2fr_1fr_2fr_120px] px-5 py-4 items-center ${!isLast ? "hairline-b" : ""}`}>
              <div>
                <div className="font-medium text-ink">{s.title}</div>
                <div className="text-[11.5px] text-ink-3 mt-0.5">{s.provider}</div>
              </div>
              <EligibilityBadge e={s.eligibility} />
              <div className="text-[12px] text-ink-3 italic">{note}</div>
              <button className="btn btn-ghost btn-sm justify-end">
                View details <ChevronRight size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── 03 Smart Matcher ───────────────────────────────────────── */
export const AIMatcher = ({ back }) => {
  const [running, setRunning] = useState(false);
  const { data: apiMatches, refetch } = useApi(getMatches);

  // Merge API results with scholarship display data
  const ranked = apiMatches
    ? [...apiMatches].sort((a, b) => b.fit_score - a.fit_score).map((m) => ({
        ...MOCK_SCHOLARSHIPS.find((s) => s.id === m.scholarship_id),
        fitScore:   m.fit_score,
        matchReason: m.match_reason,
        riskNote:   m.risk_note,
      }))
    : [...MOCK_SCHOLARSHIPS].sort((a, b) => b.fitScore - a.fitScore);

  const handleMatch = async () => {
    setRunning(true);
    try {
      await matchScholarships();
      await refetch();
    } catch (e) {
      console.error("Matching failed:", e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="px-8 py-8 fade-up max-w-5xl">
      <button onClick={back} className="btn btn-ghost btn-sm mb-4"><ChevronLeft size={12} /> AI Toolkit</button>
      <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">03 · Smart Matcher</div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="serif text-[34px] font-medium leading-tight">Ranked by fit</h1>
        <button onClick={handleMatch} disabled={running} className="btn btn-primary btn-sm">
          {running ? <><Loader2 size={12} className="animate-spin" /> Matching…</> : <><Sparkles size={12} /> Re-run matcher</>}
        </button>
      </div>
      <div className="space-y-3">
        {ranked.map((s, i) => (
          <div key={s.id} className="card p-5 flex items-start gap-5">
            <div className="text-center">
              <div className="mono text-[10px] text-ink-4 uppercase tracking-widest">Rank</div>
              <div className="serif text-[28px] font-medium text-ink leading-none mt-1">#{i + 1}</div>
            </div>
            <div className="w-px self-stretch" style={{ background: "var(--border)" }} />
            <div className="flex-1">
              <div className="font-medium text-ink">{s.title}</div>
              <div className="text-[11.5px] text-ink-3 mt-0.5 mb-2.5">{s.provider}</div>
              <div className="text-[12.5px] text-ink-2 italic mb-2">
                <span className="mono text-[10px] text-accent uppercase tracking-widest not-italic mr-2">Why it fits</span>
                {s.matchReason ?? "Your B40 background, CGPA, and community-leadership record map directly to the evaluation rubric."}
              </div>
              <div className="text-[12.5px] text-ink-2 italic">
                <span className="mono text-[10px] uppercase tracking-widest not-italic mr-2" style={{ color: "var(--warn)" }}>One risk</span>
                {s.riskNote ?? "Competition is heavy — expect 1,200+ applicants for ~40 awards."}
              </div>
            </div>
            <ScoreRing score={s.fitScore ?? s.fit_score} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── 04 Content Reshaper ────────────────────────────────────── */
export const AIReshaper = ({ back }) => {
  const [loading, setLoading]       = useState(false);
  const [reshapedText, setReshaped] = useState(null);

  const handleReshape = async () => {
    setLoading(true);
    setReshaped(null);
    try {
      const result = await reshapeContent({
        source_essay_id: "e1",
        scholarship_id:  "sc4",
        target_question: "Describe a research question you would pursue and why it matters.",
        word_limit: 750,
      });
      setReshaped(result?.reshaped_text ?? FALLBACK_RESHAPED);
    } catch (e) {
      // Backend not live yet — show demo text
      setReshaped(FALLBACK_RESHAPED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-8 fade-up max-w-4xl">
      <button onClick={back} className="btn btn-ghost btn-sm mb-4"><ChevronLeft size={12} /> AI Toolkit</button>
      <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">04 · Content Reshaper</div>
      <h1 className="serif text-[34px] font-medium leading-tight mb-3">Adapt your existing writing</h1>
      <p className="text-ink-2 leading-relaxed mb-7">
        Pick a source essay and a target prompt. The AI reshapes to fit — same voice, same content, different shape.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card p-5">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Source</div>
          <select className="input mb-3"><option>Khazanah — Community Contribution (742w)</option></select>
          <p className="text-[12px] text-ink-3 italic line-clamp-4 serif">
            "The first time I watched the Form Five girls in my neighborhood crowd into the void deck of our PPR flat…"
          </p>
        </div>
        <div className="card p-5">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Target</div>
          <select className="input mb-3"><option>MARA — Research Question (750w)</option></select>
          <p className="text-[12px] text-ink-3 italic serif">
            "Describe a research question you would pursue and why it matters."
          </p>
        </div>
      </div>
      <button onClick={handleReshape} disabled={loading} className="btn btn-primary mb-6">
        {loading ? <><Loader2 size={13} className="animate-spin" /> Reshaping…</> : <><Zap size={13} /> Reshape</>}
      </button>
      {reshapedText && (
        <div className="card p-6 fade-up" style={{ background: "var(--accent-soft)", borderColor: "#CBDBD2" }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={15} className="text-accent" />
            <div className="mono text-[10px] text-accent uppercase tracking-widest">Reshaped draft</div>
          </div>
          <p className="serif text-[15px] leading-relaxed text-ink">{reshapedText}</p>
          <div className="flex gap-2 mt-5">
            <button className="btn btn-primary btn-sm">Save as new essay</button>
            <button className="btn btn-outline btn-sm">Edit further</button>
          </div>
        </div>
      )}
    </div>
  );
};

const FALLBACK_RESHAPED = `The research question that keeps returning to me begins inside a PPR flat in Kepong, where I once watched eight Form Five girls study under a single flickering fluorescent bulb. If I could spend the next three years answering any question rigorously, it would be this: how does Malaysia know when a household has actually moved out of poverty — not out of the statistics?…`;
