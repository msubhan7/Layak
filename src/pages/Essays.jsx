import React from "react";
import { Plus } from "lucide-react";
import { getEssays } from "../api";
import useApi from "../hooks/useApi";
import { MOCK_ESSAYS, MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { SectionTitle, Pill } from "../components/ui";

const ScoreBar = ({ score }) => {
  const color = score >= 85 ? "var(--accent)" : score >= 70 ? "var(--warn)" : "var(--danger)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full" style={{ background: "var(--surface-2)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="serif text-[13px] font-medium">{score}</span>
    </div>
  );
};

const EssayRow = ({ essay: e, isLast, onOpen }) => {
  const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === (e.scholarship_id ?? e.scholarshipId));
  const words   = e.word_count ?? e.words ?? 0;
  const score   = e.latest_score ?? e.score;
  const version = e.version ?? 0;

  return (
    <div onClick={onOpen}
      className={`grid grid-cols-[2.5fr_1fr_1fr_1fr_120px] px-5 py-4 items-center cursor-pointer hover:bg-surface-2 ${!isLast ? "hairline-b" : ""}`}>
      <div>
        <div className="font-medium text-ink">{e.title}</div>
        <div className="text-[11.5px] text-ink-3 mt-0.5">{scholarship?.provider}</div>
      </div>
      <div><Pill variant="neutral">v{version}</Pill></div>
      <div className="mono text-[12.5px] text-ink-2">
        {words > 0 ? words : "—"}
        {scholarship && words > 0 && (
          <span className="text-ink-4"> / {scholarship.wordLimit ?? scholarship.word_limit}</span>
        )}
      </div>
      <div>
        {score ? <ScoreBar score={score} /> : <span className="text-ink-4 text-[12px]">Not scored</span>}
      </div>
      <div className="text-right text-[11.5px] text-ink-3">{e.updated_at ?? e.updated}</div>
    </div>
  );
};

const Essays = ({ setPage, setSelectedEssay }) => {
  const { data: apiData, loading, error } = useApi(getEssays);
  const essays = apiData ?? MOCK_ESSAYS;

  return (
    <div className="px-8 py-8 fade-up">
      <SectionTitle kicker={`Workshop · ${essays.length} drafts`} title="Essays">
        <button onClick={() => setPage("new-essay")} className="btn btn-primary btn-sm">
          <Plus size={13} /> New essay
        </button>
      </SectionTitle>

      <div className="card">
        {loading && !apiData && (
          <div className="text-center py-10 text-ink-3 text-[13px] shimmer">Loading essays…</div>
        )}
        {error && (
          <div className="px-5 py-3 text-[12.5px]" style={{ color: "var(--warn)" }}>
            Could not load from server — showing cached data.
          </div>
        )}
        <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_120px] px-5 py-3 hairline-b mono text-[10px] text-ink-4 uppercase tracking-widest">
          <div>Essay</div><div>Version</div><div>Words</div><div>AI score</div>
          <div className="text-right">Updated</div>
        </div>
        {essays.map((e, i) => (
          <EssayRow
            key={e.id}
            essay={e}
            isLast={i === essays.length - 1}
            onOpen={() => { setSelectedEssay(e.id); setPage("essay-editor"); }}
          />
        ))}
      </div>
    </div>
  );
};

export default Essays;