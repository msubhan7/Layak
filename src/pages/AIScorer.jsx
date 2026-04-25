import React, { useState } from "react";
import { ChevronLeft, Sparkles, Zap, Loader2, TrendingUp, RefreshCw, ChevronDown } from "lucide-react";
import { MOCK_SCHOLARSHIPS, MOCK_ESSAYS } from "../constants/mockData";

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} className="btn btn-ghost btn-sm mb-6">
    <ChevronLeft size={12} /> AI Toolkit
  </button>
);

const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div className="card p-5 mb-4">
    <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">{label}</div>
    <div className="relative">
      <select className="input appearance-none pr-8" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
    </div>
  </div>
);

const ScoreBar = ({ label, score }) => {
  const color = score >= 85 ? "var(--accent)" : score >= 70 ? "var(--warn)" : "var(--danger)";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex-1 text-[12.5px] text-ink-2">{label}</div>
      <div className="h-1.5 w-24 rounded-full" style={{ background: "var(--surface-2)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <div className="mono text-[12px] w-6 text-right text-ink-2">{score}</div>
    </div>
  );
};

const AIScorer = ({ back, setPage, setSelectedEssay }) => {
  const [essayId,       setEssayId]       = useState("");
  const [scholarshipId, setScholarshipId] = useState("");
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState(null);

  const essay       = MOCK_ESSAYS.find((e) => e.id === essayId);
  const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === scholarshipId);

  const handleRun = async () => {
    if (!essayId || !scholarshipId) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1400));
    setResult({
      overall_score: essay?.score ?? 82,
      previous_score: (essay?.score ?? 82) - 4,
      criterion_scores_json: {
        "Clarity of goals":                  85,
        "Specificity of achievements":       78,
        "Alignment with scholarship values": 91,
        "Emotional authenticity":            88,
        "Grammar & formality":               76,
        "Structure & flow":                  80,
        "Word count efficiency":             74,
      },
      weaknesses: [
        { location: "Paragraph 2", note: "Ends abruptly — reflect on what the moment revealed to you." },
        { location: "Final sentence", note: "Too abstract. Name a specific programme or contribution." },
      ],
      revision_suggestions: [
        "Quantify your tutoring — hours/week, number of students, SPM outcomes.",
        "Close the grandmother scene with your own action that echoes her words.",
        "Tighten paragraph 3 — 30 words can go without losing meaning.",
      ],
    });
    setLoading(false);
  };

  return (
    <div className="px-8 py-8 fade-up max-w-4xl">
      <BackBtn onClick={back} />
      <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">01 · Essay Scorer</div>
      <h1 className="serif text-[32px] font-medium leading-tight mb-2">Score your essay</h1>
      <p className="text-ink-2 leading-relaxed mb-6 max-w-xl">
        Pick an essay and a target scholarship. GLM-5.1 scores against that scholarship's exact criteria.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <SelectField label="Essay" value={essayId} onChange={setEssayId}
          placeholder="— Select an essay —"
          options={MOCK_ESSAYS.map((e) => ({ value: e.id, label: `${e.title} · v${e.version}` }))} />
        <SelectField label="Score against" value={scholarshipId} onChange={setScholarshipId}
          placeholder="— Select a scholarship —"
          options={MOCK_SCHOLARSHIPS.map((s) => ({ value: s.id, label: s.title }))} />
      </div>

      {scholarship && (
        <div className="card p-4 mb-5" style={{ background: "var(--surface-2)" }}>
          <div className="mono text-[9.5px] text-ink-4 uppercase tracking-widest mb-1">Prompt</div>
          <p className="serif text-[15px] italic text-ink">"{scholarship.prompt}"</p>
        </div>
      )}

      <button onClick={handleRun} disabled={!essayId || !scholarshipId || loading} className="btn btn-primary mb-8">
        {loading ? <><Loader2 size={13} className="animate-spin" /> Evaluating…</> : <><Sparkles size={13} /> Run evaluation</>}
      </button>

      {result && (
        <div className="fade-up">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-6">
              <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Overall score</div>
              <div className="flex items-end gap-4">
                <div className="serif text-[56px] font-medium leading-none text-ink">{result.overall_score}</div>
                <div className="pb-2">
                  <div className="text-[12px] text-ink-3 flex items-center gap-1.5">
                    <TrendingUp size={11} className="text-accent" /> Up from {result.previous_score} last version
                  </div>
                  <div className="text-[11px] text-ink-4 mt-0.5">out of 100</div>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Weak sections</div>
              {result.weaknesses.map(({ location, note }) => (
                <div key={location} className="mb-3 p-3 rounded-md"
                  style={{ background: "var(--warn-soft)", border: "1px solid #EBD6AD" }}>
                  <div className="mono text-[9.5px] uppercase tracking-widest mb-1" style={{ color: "var(--warn)" }}>{location}</div>
                  <p className="text-[12px] text-ink-2">{note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 mb-4">
            <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Criterion scores</div>
            {Object.entries(result.criterion_scores_json).map(([label, score]) => (
              <ScoreBar key={label} label={label} score={score} />
            ))}
          </div>

          <div className="card p-6 mb-5">
            <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Revision suggestions</div>
            <ol className="space-y-2.5">
              {result.revision_suggestions.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-ink-2">
                  <span className="mono text-[10px] text-accent mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <button className="btn btn-primary"
              onClick={() => { setSelectedEssay?.(essayId); setPage("essay-editor"); }}>
              <Zap size={13} /> Open in editor
            </button>
            <button className="btn btn-outline" onClick={() => setResult(null)}>
              <RefreshCw size={13} /> Re-run
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIScorer;