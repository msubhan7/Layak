import React, { useState } from "react";
import { ChevronLeft, Sparkles, CheckCircle2, XCircle, AlertTriangle, Loader2, ChevronDown } from "lucide-react";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";

const ELIGIBILITY_DATA = {
  sc1: { passed: ["Malaysian citizen", "CGPA ≥ 3.75", "Household income under RM8,000"], failed: [], warnings: ["Leadership record needs verification"] },
  sc2: { passed: ["Malaysian citizen", "SPM 9A+", "Interest in economics/finance"], failed: [], warnings: [] },
  sc3: { passed: ["Malaysian citizen", "CGPA ≥ 3.50"], failed: [], warnings: ["STEM track — confirm enrolment"] },
  sc4: { passed: ["Bumiputera status", "CGPA ≥ 3.70"], failed: [], warnings: ["Research proposal not submitted"] },
  sc5: { passed: ["Demonstrated financial need", "Academic excellence"], failed: [], warnings: ["Cambridge admission required"] },
  sc6: { passed: [], failed: ["Leadership at state level — not met", "Engineering/Business track — not confirmed"], warnings: [] },
};

const AIEligibility = ({ back }) => {
  const [scholarshipId, setScholarshipId] = useState("");
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState(null);

  const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === scholarshipId);
  const eligible    = result && result.failed.length === 0;

  const handleCheck = async () => {
    if (!scholarshipId) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1000));
    setResult(ELIGIBILITY_DATA[scholarshipId] ?? { passed: [], failed: [], warnings: [] });
    setLoading(false);
  };

  return (
    <div className="px-8 py-8 fade-up max-w-3xl">
      <button onClick={back} className="btn btn-ghost btn-sm mb-6">
        <ChevronLeft size={12} /> AI Toolkit
      </button>
      <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">02 · Eligibility Checker</div>
      <h1 className="serif text-[32px] font-medium leading-tight mb-2">Check your eligibility</h1>
      <p className="text-ink-2 leading-relaxed mb-6 max-w-xl">
        GLM-5.1 compares scholarship rules against your profile and flags hard disqualifiers before you spend time applying.
      </p>

      <div className="card p-5 mb-4">
        <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Scholarship</div>
        <div className="relative">
          <select className="input appearance-none pr-8" value={scholarshipId}
            onChange={(e) => { setScholarshipId(e.target.value); setResult(null); }}>
            <option value="">— Select a scholarship —</option>
            {MOCK_SCHOLARSHIPS.map((s) => (
              <option key={s.id} value={s.id}>{s.title} · {s.provider}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
        </div>
      </div>

      {scholarship && (
        <div className="card p-4 mb-5" style={{ background: "var(--surface-2)" }}>
          <div className="mono text-[9.5px] text-ink-4 uppercase tracking-widest mb-2">Requirements</div>
          {scholarship.requirements.map((r) => (
            <div key={r} className="text-[12.5px] text-ink-2 py-0.5">· {r}</div>
          ))}
        </div>
      )}

      <button onClick={handleCheck} disabled={!scholarshipId || loading} className="btn btn-primary mb-8">
        {loading ? <><Loader2 size={13} className="animate-spin" /> Checking…</> : <><Sparkles size={13} /> Check eligibility</>}
      </button>

      {result && (
        <div className="fade-up">
          <div className="card p-5 mb-5 flex items-center gap-4"
            style={{ background: eligible ? "var(--accent-soft)" : "var(--danger-soft)",
                     borderColor: eligible ? "#CBDBD2" : "#EBC1BE" }}>
            {eligible
              ? <CheckCircle2 size={22} className="text-accent shrink-0" />
              : <XCircle size={22} style={{ color: "var(--danger)" }} className="shrink-0" />}
            <div>
              <div className="serif text-[18px] font-medium text-ink">
                {eligible ? "You are eligible" : "You are not eligible"}
              </div>
              <div className="text-[12.5px] text-ink-2 mt-0.5">
                {eligible ? "All hard criteria met. Review warnings before applying." : "One or more hard criteria are not met."}
              </div>
            </div>
          </div>

          <div className="card p-6">
            {result.passed.length > 0 && (
              <div className="mb-5">
                <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Passed</div>
                {result.passed.map((c) => (
                  <div key={c} className="flex items-center gap-2.5 py-1.5">
                    <CheckCircle2 size={14} className="text-accent shrink-0" />
                    <span className="text-[13px] text-ink-2">{c}</span>
                  </div>
                ))}
              </div>
            )}
            {result.failed.length > 0 && (
              <div className="mb-5">
                <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Failed</div>
                {result.failed.map((c) => (
                  <div key={c} className="flex items-center gap-2.5 py-1.5">
                    <XCircle size={14} style={{ color: "var(--danger)" }} className="shrink-0" />
                    <span className="text-[13px] text-ink-2">{c}</span>
                  </div>
                ))}
              </div>
            )}
            {result.warnings.length > 0 && (
              <div>
                <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Warnings</div>
                {result.warnings.map((c) => (
                  <div key={c} className="flex items-center gap-2.5 py-1.5">
                    <AlertTriangle size={14} style={{ color: "var(--warn)" }} className="shrink-0" />
                    <span className="text-[13px] text-ink-2">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEligibility;