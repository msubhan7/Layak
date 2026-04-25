import React, { useState } from "react";
import { ChevronDown, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { createApplication } from "../api";
import { MOCK_SCHOLARSHIPS, MOCK_ESSAYS } from "../constants/mockData";
import { SectionTitle, EligibilityBadge, Pill } from "../components/ui";

const NewApplication = ({ setPage }) => {
  const [scholarshipId, setScholarshipId] = useState("");
  const [essayId,       setEssayId]       = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === scholarshipId);
  const essay       = MOCK_ESSAYS.find((e) => e.id === essayId);
  

    const handleCreate = async (e) => {
    e.preventDefault();
    if (!scholarshipId) { setError("Please select a scholarship."); return; }
    setError(null);
    setLoading(true);
    try {
        await createApplication({ scholarship_id: scholarshipId, essay_id: essayId || null, status: "draft" });
    } catch {
        // backend not live yet, continue anyway
    } finally {
        setLoading(false);
        setPage("applications", { scholarship_id: scholarshipId });
    }
    };

  return (
    <div className="px-8 py-8 fade-up max-w-2xl">
      <SectionTitle kicker="Pipeline · New record" title="Start a new application" />

      {error && (
        <div className="px-4 py-3 rounded-md text-[12.5px] mb-5"
          style={{ background: "var(--danger-soft)", color: "var(--danger)", border: "1px solid #EBC1BE" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleCreate}>
        <div className="card p-6 mb-4">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Scholarship</div>
          <div className="relative">
            <select className="input appearance-none pr-8" value={scholarshipId}
              onChange={(e) => setScholarshipId(e.target.value)}>
              <option value="">— Select a scholarship —</option>
              {MOCK_SCHOLARSHIPS.map((s) => (
                <option key={s.id} value={s.id}>{s.title} · {s.provider}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
          </div>

          {scholarship && (
            <div className="mt-4 p-4 rounded-md hairline space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-ink">{scholarship.title}</div>
                  <div className="text-[12px] text-ink-3 mt-0.5">{scholarship.provider} · {scholarship.university}</div>
                </div>
                <EligibilityBadge e={scholarship.eligibility} />
              </div>
              <div className="flex items-center gap-4 text-[12px] text-ink-3">
                <span className="flex items-center gap-1.5">
                  <Clock size={11} /> {scholarship.daysLeft} days left · {scholarship.deadline}
                </span>
                <span>Fit score: <span className="serif text-[15px] font-medium text-accent">{scholarship.fitScore}</span></span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(scholarship.tags ?? []).map((tag) => <Pill key={tag}>{tag}</Pill>)}
              </div>
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="mono text-[9.5px] text-ink-4 uppercase tracking-widest mb-2">Requirements</div>
                {(scholarship.requirements ?? []).map((req) => (
                  <div key={req} className="flex items-center gap-2 text-[12px] text-ink-2 py-0.5">
                    <CheckCircle2 size={12} className="text-accent shrink-0" /> {req}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 mb-4">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">
            Link an essay <span className="normal-case">(optional)</span>
          </div>
          <div className="relative">
            <select className="input appearance-none pr-8" value={essayId}
              onChange={(e) => setEssayId(e.target.value)}>
              <option value="">— No essay yet —</option>
              {MOCK_ESSAYS.map((e) => (
                <option key={e.id} value={e.id}>{e.title} · v{e.version} · {e.words} words</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
          </div>
          {essay && (
            <div className="mt-3 p-3 rounded-md flex items-center justify-between text-[12px]"
              style={{ background: "var(--surface-2)" }}>
              <span className="font-medium text-ink">{essay.title}</span>
              <span className="mono text-ink-3">{essay.words} words · score {essay.score ?? "—"}</span>
            </div>
          )}
        </div>

        <div className="card p-5 mb-6 flex items-center gap-3"
          style={{ background: "var(--accent-soft)", borderColor: "#CBDBD2" }}>
          <AlertCircle size={15} className="text-accent shrink-0" />
          <p className="text-[12.5px] text-ink-2">
            Your application will start as <strong>Draft</strong>. Move it through the pipeline on the Applications board as you progress.
          </p>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating…" : <> Create application <ArrowRight size={13} /></>}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setPage("applications")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewApplication;