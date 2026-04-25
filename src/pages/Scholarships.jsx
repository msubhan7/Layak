import React, { useState } from "react";
import { Filter, Sparkles, Calendar, Clock, X, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { getScholarships, getMatches } from "../api";
import useApi from "../hooks/useApi";
import { MOCK_SCHOLARSHIPS, MOCK_DOCUMENTS } from "../constants/mockData";
import { SectionTitle, Pill, EligibilityBadge, ScoreRing } from "../components/ui";

const FILTERS = [
  { key: "all", label: "All opportunities" },
  { key: "eligible", label: "Eligible only" },
  { key: "closing", label: "Closing soon" },
  { key: "overseas", label: "Overseas" },
];

const TAGS = ["Need-based", "Leadership", "Overseas", "STEM", "Engineering", "Finance", "Economics", "Local", "Bumiputera", "Research", "Energy"];
const PROVIDERS = ["Yayasan Khazanah", "Bank Negara Malaysia", "Petronas", "MARA", "Cambridge Trust", "Shell"];

/* ─── Ranking logic (mirrors backend spec) ───────────────────── */
// Computes a composite rank score from:
//   - fit score (primary)
//   - eligibility status (eligible > warnings > not-eligible)
//   - document readiness (how many required docs are uploaded)
//   - deadline urgency (closing soon ranks higher)
const computeRankScore = (s, docStatuses) => {
  const fit = s.fitScore ?? s.fit_score ?? 0;
  const eligBonus = s.eligibility === "eligible" ? 15 : s.eligibility === "warnings" ? 5 : -20;
  const daysLeft = s.daysLeft ?? s.days_left ?? 999;
  const urgency = daysLeft <= 7 ? 8 : daysLeft <= 30 ? 4 : 0;
  const docsReady = docStatuses.filter((d) => d === "verified" || d === "on_file").length;
  const docBonus = docsReady * 2;
  return fit + eligBonus + urgency + docBonus;
};

const rankScholarships = (list) => {
  const docStatuses = MOCK_DOCUMENTS.map((d) => d.status);
  return [...list].sort((a, b) => computeRankScore(b, docStatuses) - computeRankScore(a, docStatuses));
};

const applyFilters = (list, { tab, tags, providers, minScore, maxDays }) => {
  return list.filter((s) => {
    if (tab === "eligible" && s.eligibility !== "eligible") return false;
    if (tab === "closing" && (s.daysLeft ?? s.days_left) > 30) return false;
    if (tab === "overseas" && !(s.tags ?? []).includes("Overseas")) return false;
    if (tags.length > 0 && !tags.every((t) => (s.tags ?? []).includes(t))) return false;
    if (providers.length > 0 && !providers.includes(s.provider)) return false;
    if (minScore && (s.fitScore ?? s.fit_score ?? 0) < minScore) return false;
    if (maxDays && (s.daysLeft ?? s.days_left ?? 999) > maxDays) return false;
    return true;
  });
};

/* ─── Document checklist for a scholarship ───────────────────── */
const REQUIRED_DOCS = ["IC / Passport", "Academic Transcript", "Income Statement (EA)", "Recommendation Letter", "Resume / CV"];

const DocChecklist = ({ scholarship }) => {
  const uploaded = MOCK_DOCUMENTS.filter(
    (d) => d.status === "verified" || d.status === "on_file"
  ).map((d) => d.type ?? d.document_type);

  const ready = REQUIRED_DOCS.filter((r) => uploaded.includes(r));
  const missing = REQUIRED_DOCS.filter((r) => !uploaded.includes(r));

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      <div className="mono text-[9.5px] text-ink-4 uppercase tracking-widest mb-2">
        Documents — {ready.length}/{REQUIRED_DOCS.length} ready
      </div>
      <div className="space-y-1">
        {ready.map((doc) => (
          <div key={doc} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--accent)" }}>
            <CheckCircle2 size={10} /> {doc}
          </div>
        ))}
        {missing.map((doc) => (
          <div key={doc} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--danger)" }}>
            <AlertCircle size={10} /> {doc}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Scholarship card ───────────────────────────────────────── */
const ScholarshipCard = ({ scholarship: s, rank, onClick, showRank }) => (
  <div className="card card-hover p-6 cursor-pointer relative overflow-hidden" onClick={onClick}>
    {/* Rank badge */}
    {showRank && (
      <div className="absolute top-4 left-4 w-7 h-7 rounded-full flex items-center justify-center serif text-[13px] font-semibold"
        style={{
          background: rank === 1 ? "var(--accent)" : "var(--surface-2)",
          color: rank === 1 ? "#F4F2EA" : "var(--ink-3)"
        }}>
        {rank}
      </div>
    )}

    <div className="flex items-start justify-between mb-3" style={{ paddingLeft: showRank ? 36 : 0 }}>
      <div>
        <div className="mono text-[10px] text-ink-4 uppercase tracking-widest">{s.provider}</div>
        <h3 className="serif text-[20px] font-medium leading-tight mt-1 text-ink">{s.title}</h3>
      </div>
      <ScoreRing score={s.fitScore ?? s.fit_score} size={54} />
    </div>

    <p className="text-[13px] text-ink-2 italic leading-relaxed mb-3 line-clamp-2">
      "{s.prompt ?? s.essay_prompt}"
    </p>

    <div className="flex flex-wrap gap-1.5 mb-3">
      {(s.tags ?? []).map((tag) => <Pill key={tag}>{tag}</Pill>)}
    </div>

    <div className="rule mb-3" />

    <div className="flex items-center justify-between text-[12px] mb-1">
      <div className="flex items-center gap-3 text-ink-3">
        <span className="flex items-center gap-1.5"><Calendar size={11} /> {s.deadline}</span>
        <span className="flex items-center gap-1.5"
          style={{ color: (s.daysLeft ?? s.days_left) <= 7 ? "var(--danger)" : "var(--ink-3)" }}>
          <Clock size={11} /> {s.daysLeft ?? s.days_left}d left
        </span>
      </div>
      <EligibilityBadge e={s.eligibility ?? s.eligibility_status} />
    </div>

    <DocChecklist scholarship={s} />
  </div>
);

/* ─── Filter panel ───────────────────────────────────────────── */
const FilterPanel = ({ filters, setFilters, onClose }) => {
  const toggle = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const activeCount =
    filters.tags.length + filters.providers.length +
    (filters.minScore ? 1 : 0) + (filters.maxDays ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.25)", alignItems: "stretch" }}
      onClick={onClose}>
      <div className="ml-auto w-80 overflow-auto shadow-xl"
        style={{ height: "100vh", background: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}>

        <div className="px-6 py-5 hairline-b flex items-center justify-between">
          <div>
            <h3 className="serif text-[20px] font-medium">Filters</h3>
            {activeCount > 0 && <div className="text-[11.5px] text-ink-3 mt-0.5">{activeCount} active</div>}
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button className="btn btn-ghost btn-sm text-[12px]"
                onClick={() => setFilters({ tags: [], providers: [], minScore: "", maxDays: "" })}>
                Clear all
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={14} /></button>
          </div>
        </div>

        <div className="px-6 py-5 hairline-b">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <button key={tag} onClick={() => toggle("tags", tag)}
                className="pill cursor-pointer transition"
                style={{
                  background: filters.tags.includes(tag) ? "var(--accent)" : "var(--surface)",
                  color: filters.tags.includes(tag) ? "#F4F2EA" : "var(--ink-2)",
                  borderColor: filters.tags.includes(tag) ? "var(--accent)" : "var(--border)",
                }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 hairline-b">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Provider</div>
          <div className="space-y-2">
            {PROVIDERS.map((p) => (
              <label key={p} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={filters.providers.includes(p)}
                  onChange={() => toggle("providers", p)}
                  className="accent-[var(--accent)]" />
                <span className="text-[13px] text-ink-2">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 hairline-b">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Minimum fit score</div>
          <div className="flex items-center gap-3">
            <input type="range" min="0" max="100" step="5"
              value={filters.minScore || 0}
              onChange={(e) => setFilters((prev) => ({ ...prev, minScore: Number(e.target.value) || "" }))}
              className="flex-1 accent-[var(--accent)]" />
            <span className="mono text-[13px] text-ink w-8 text-right">{filters.minScore || 0}</span>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Deadline within</div>
          <div className="flex flex-wrap gap-2">
            {[7, 14, 30, 60, 90].map((days) => (
              <button key={days}
                onClick={() => setFilters((prev) => ({ ...prev, maxDays: prev.maxDays === days ? "" : days }))}
                className="btn btn-sm"
                style={{
                  background: filters.maxDays === days ? "var(--ink)" : "transparent",
                  color: filters.maxDays === days ? "var(--bg)" : "var(--ink-2)",
                  border: `1px solid ${filters.maxDays === days ? "var(--ink)" : "var(--border)"}`,
                }}>
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────── */
const Scholarships = ({ setPage, setSelectedScholarship }) => {
  const [tab, setTab] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [sortMode, setSortMode] = useState("ranked"); // "ranked" | "deadline" | "fit"
  const [filters, setFilters] = useState({ tags: [], providers: [], minScore: "", maxDays: "" });

  const { data: apiData, loading, error } = useApi(getScholarships);
  const { data: apiMatches } = useApi(getMatches);

  // Merge API match scores into scholarships if available
  const all = (apiData ?? MOCK_SCHOLARSHIPS).map((s) => {
    const match = (apiMatches ?? []).find((m) => m.scholarship_id === s.id);
    return match ? { ...s, fitScore: match.fit_score, fit_score: match.fit_score } : s;
  });

  const filtered = applyFilters(all, { tab, ...filters });

  // Sort based on selected mode
  const sorted = sortMode === "ranked"
    ? rankScholarships(filtered)
    : sortMode === "deadline"
      ? [...filtered].sort((a, b) => (a.daysLeft ?? a.days_left ?? 999) - (b.daysLeft ?? b.days_left ?? 999))
      : [...filtered].sort((a, b) => (b.fitScore ?? b.fit_score ?? 0) - (a.fitScore ?? a.fit_score ?? 0));

  const activeFilterCount =
    filters.tags.length + filters.providers.length +
    (filters.minScore ? 1 : 0) + (filters.maxDays ? 1 : 0);

  const handleCardClick = (id) => { setSelectedScholarship(id); setPage("scholarship-detail"); };

  return (
    <div className="px-8 py-8 fade-up">
      {showFilter && (
        <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilter(false)} />
      )}

      <SectionTitle kicker={`Discover · ${sorted.length} matches`} title="Scholarships & universities">
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => setPage("universities")}>
            🎓 Universities
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowFilter(true)}
            style={activeFilterCount > 0 ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } : {}}>
            <Filter size={12} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <button className="btn btn-primary btn-sm"><Sparkles size={12} /> Smart match</button>
        </div>
      </SectionTitle>

      {/* Quick filter tabs + sort controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1.5">
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} className="btn btn-sm"
              style={{
                background: tab === key ? "var(--ink)" : "transparent",
                color: tab === key ? "var(--bg)" : "var(--ink-2)",
                border: `1px solid ${tab === key ? "var(--ink)" : "var(--border)"}`,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Sort mode */}
        <div className="flex items-center gap-1.5">
          <TrendingUp size={12} className="text-ink-4" />
          <span className="mono text-[10px] text-ink-4 uppercase tracking-widest mr-1">Sort</span>
          {[
            { key: "ranked", label: "AI ranked" },
            { key: "fit", label: "Fit score" },
            { key: "deadline", label: "Deadline" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setSortMode(key)} className="btn btn-sm"
              style={{
                background: sortMode === key ? "var(--accent)" : "transparent",
                color: sortMode === key ? "#F4F2EA" : "var(--ink-3)",
                border: `1px solid ${sortMode === key ? "var(--accent)" : "var(--border)"}`,
                fontSize: 11,
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking explanation banner — only in ranked mode */}
      {sortMode === "ranked" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-md mb-5 text-[12px] text-ink-2"
          style={{ background: "var(--accent-soft)", border: "1px solid #CBDBD2" }}>
          <Sparkles size={13} className="text-accent shrink-0" />
          Ranked by AI using your fit score, eligibility status, document readiness, and deadline urgency.
          Switch to <strong>Fit score</strong> or <strong>Deadline</strong> to sort differently.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {loading && !apiData && (
          <div className="col-span-2 text-center py-16 text-ink-3 text-[13px] shimmer">
            Loading scholarships…
          </div>
        )}
        {error && (
          <div className="col-span-2 px-4 py-3 rounded-md text-[12.5px]"
            style={{ background: "var(--warn-soft)", color: "var(--warn)", border: "1px solid #EBD6AD" }}>
            Could not load from server — showing cached data.
          </div>
        )}
        {sorted.length === 0 && !loading && (
          <div className="col-span-2 text-center py-16 text-ink-3 text-[13px]">
            No scholarships match your filters.{" "}
            <button className="text-accent underline"
              onClick={() => setFilters({ tags: [], providers: [], minScore: "", maxDays: "" })}>
              Clear filters
            </button>
          </div>
        )}
        {sorted.map((s, i) => (
          <ScholarshipCard
            key={s.id}
            scholarship={s}
            rank={i + 1}
            showRank={sortMode === "ranked"}
            onClick={() => handleCardClick(s.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Scholarships;