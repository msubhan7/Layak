import React, { useState } from "react";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { createEssay } from "../api";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { SectionTitle } from "../components/ui";

const NewEssay = ({ setPage, setSelectedEssay }) => {
  const [title,         setTitle]         = useState("");
  const [scholarshipId, setScholarshipId] = useState("");
  const [useAI,         setUseAI]         = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const selectedScholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === scholarshipId);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Please give your essay a title."); return; }
    setError(null);
    setLoading(true);
    try {
      const result = await createEssay({
        title: title.trim(),
        scholarship_id: scholarshipId || null,
        essay_text: "",
        version: 1,
      });
      setSelectedEssay(result?.id ?? null);
      setPage("essay-editor");
    } catch {
      setSelectedEssay(null);
      setPage("essay-editor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-8 fade-up max-w-2xl">
      <SectionTitle kicker="Workshop · New draft" title="Create a new essay" />

      {error && (
        <div className="px-4 py-3 rounded-md text-[12.5px] mb-5"
          style={{ background: "var(--danger-soft)", color: "var(--danger)", border: "1px solid #EBC1BE" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleCreate}>
        <div className="card p-6 mb-4">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Essay title</div>
          <input
            className="input"
            placeholder="e.g. Khazanah — Community Contribution"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <p className="text-[11.5px] text-ink-4 mt-2">Give it a name you'll recognise — you can rename it later.</p>
        </div>

        <div className="card p-6 mb-4">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">
            Link to scholarship <span className="normal-case">(optional)</span>
          </div>
          <div className="relative">
            <select className="input appearance-none pr-8" value={scholarshipId}
              onChange={(e) => setScholarshipId(e.target.value)}>
              <option value="">— Not linked to a scholarship —</option>
              {MOCK_SCHOLARSHIPS.map((s) => (
                <option key={s.id} value={s.id}>{s.title} · {s.provider}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
          </div>

          {selectedScholarship && (
            <div className="mt-4 p-4 rounded-md" style={{ background: "var(--surface-2)" }}>
              <div className="mono text-[9.5px] text-ink-4 uppercase tracking-widest mb-2">
                Prompt · {selectedScholarship.wordLimit} words
              </div>
              <p className="serif text-[15px] italic text-ink leading-snug">
                "{selectedScholarship.prompt}"
              </p>
            </div>
          )}
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-ink text-[13.5px] flex items-center gap-2">
                <Sparkles size={14} className="text-accent" /> Start with AI suggestions
              </div>
              <p className="text-[12px] text-ink-3 mt-1">
                GLM-5.1 will generate an outline based on your profile and the prompt.
              </p>
            </div>
            <button type="button" onClick={() => setUseAI((v) => !v)}
              className="shrink-0 w-10 h-6 rounded-full transition-colors relative"
              style={{ background: useAI ? "var(--accent)" : "var(--border-strong)" }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: useAI ? "calc(100% - 20px)" : "4px" }} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating…" : <> Create & open editor <ArrowRight size={13} /></>}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setPage("essays")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewEssay;