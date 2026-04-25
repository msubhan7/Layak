import React, { useState } from "react";
import { ChevronLeft, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { ScoreRing } from "../components/ui";

const MATCH_REASONS = {
  sc1: { reason: "Your B40 background, CGPA 3.89, and community leadership record map directly to the evaluation rubric.", risk: "Competition is heavy — expect 1,200+ applicants for ~40 awards." },
  sc2: { reason: "Strong economics/finance interest shown in your goals bio. SPM results meet the threshold.", risk: "Interview panel heavily weights monetary policy knowledge — prepare this area." },
  sc3: { reason: "CGPA meets threshold. STEM background is a strong match.", risk: "Essay alignment is currently below target — your Petronas draft needs work." },
  sc4: { reason: "Bumiputera status confirmed. CGPA 3.89 exceeds the 3.70 floor.", risk: "Research proposal is outstanding — this is a hard blocker." },
  sc5: { reason: "Financial need is well-documented. Academic record is competitive for Cambridge.", risk: "Closes in 5 days — this is your most urgent application." },
  sc6: { reason: "Energy sector interest is present in your profile.", risk: "You do not meet the state-level leadership criterion — hard disqualifier." },
};

const AIMatcher = ({ back, setPage, setSelectedScholarship }) => {
  const [loading, setLoading] = useState(false);
  const [ranked,  setRanked]  = useState(null);

  const handleMatch = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const sorted = [...MOCK_SCHOLARSHIPS]
      .filter((s) => s.eligibility !== "not-eligible")
      .sort((a, b) => b.fitScore - a.fitScore);
    setRanked(sorted);
    setLoading(false);
  };

  return (
    <div className="px-8 py-8 fade-up max-w-4xl">
      <button onClick={back} className="btn btn-ghost btn-sm mb-6">
        <ChevronLeft size={12} /> AI Toolkit
      </button>
      <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">03 · Smart Matcher</div>
      <h1 className="serif text-[32px] font-medium leading-tight mb-2">Rank scholarships by fit</h1>
      <p className="text-ink-2 leading-relaxed mb-6 max-w-xl">
        GLM-5.1 scores every scholarship against your profile and returns a ranked list with a reason and a risk for each.
      </p>

      <div className="flex gap-3 mb-8">
        <button onClick={handleMatch} disabled={loading} className="btn btn-primary">
          {loading ? <><Loader2 size={13} className="animate-spin" /> Matching…</> : <><Sparkles size={13} /> Run smart match</>}
        </button>
        {ranked && (
          <button onClick={() => setRanked(null)} className="btn btn-outline">
            <RefreshCw size={13} /> Reset
          </button>
        )}
      </div>

      {ranked && (
        <div className="space-y-3 fade-up">
          {ranked.map((s, i) => {
            const { reason, risk } = MATCH_REASONS[s.id] ?? { reason: "Strong profile match.", risk: "Review requirements carefully." };
            return (
              <div key={s.id} className="card p-5 flex items-start gap-5">
                <div className="text-center shrink-0">
                  <div className="mono text-[9.5px] text-ink-4 uppercase tracking-widest">Rank</div>
                  <div className="serif text-[28px] font-medium text-ink leading-none mt-1">#{i + 1}</div>
                </div>
                <div className="w-px self-stretch" style={{ background: "var(--border)" }} />
                <div className="flex-1">
                  <div className="font-medium text-ink">{s.title}</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5 mb-3">{s.provider}</div>
                  <div className="text-[12.5px] text-ink-2 mb-1.5">
                    <span className="mono text-[9.5px] text-accent uppercase tracking-widest mr-2">Why it fits</span>
                    {reason}
                  </div>
                  <div className="text-[12.5px] text-ink-2">
                    <span className="mono text-[9.5px] uppercase tracking-widest mr-2" style={{ color: "var(--warn)" }}>One risk</span>
                    {risk}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <ScoreRing score={s.fitScore} size={60} />
                  <button className="btn btn-ghost btn-sm text-[11px]"
                    onClick={() => { setSelectedScholarship?.(s.id); setPage("scholarship-detail"); }}>
                    View →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIMatcher;