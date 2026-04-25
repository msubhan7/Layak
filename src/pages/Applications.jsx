import React, { useState, useEffect } from "react";
import {
  CircleDot, MoreHorizontal, Clock, Target,
  TrendingUp, AlertTriangle, Trash2,
  X, Sparkles, Loader2, Send,
} from "lucide-react";
import {
  getApplications, getDashboardApplications,
  deleteApplication, getReadiness, updateApplicationStatus,
} from "../api";
import useApi from "../hooks/useApi";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { SectionTitle, StatusBadge } from "../components/ui";

const COLUMNS = [
  { id: "draft", label: "Draft" },
  { id: "reviewed", label: "Reviewed" },
  { id: "needs-improvement", label: "Needs work" },
  { id: "ready", label: "Ready to submit" },
  { id: "submitted", label: "Submitted" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "rejected", label: "Rejected" },
  { id: "accepted", label: "Accepted" },
];

/* ─── Confirm dialog ─────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.3)" }}>
    <div className="card p-6 w-80 shadow-xl fade-up">
      <div className="flex items-start justify-between mb-3">
        <h3 className="serif text-[18px] font-medium">Are you sure?</h3>
        <button onClick={onCancel}><X size={15} className="text-ink-4" /></button>
      </div>
      <p className="text-[13px] text-ink-2 leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2">
        <button onClick={onConfirm} className="btn btn-sm flex-1 justify-center"
          style={{ background: "var(--danger)", color: "#fff", border: "none" }}>Delete</button>
        <button onClick={onCancel} className="btn btn-outline btn-sm flex-1 justify-center">Cancel</button>
      </div>
    </div>
  </div>
);

/* ─── Readiness bar ──────────────────────────────────────────── */
const ReadinessBar = ({ score }) => {
  if (score == null) return null;
  const color = score >= 80 ? "var(--accent)" : score >= 50 ? "var(--warn)" : "var(--danger)";
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        <span className="mono text-[9px] text-ink-4 uppercase tracking-widest">Readiness</span>
        <span className="mono text-[9px]" style={{ color }}>{score}%</span>
      </div>
      <div className="h-1 rounded-full w-full" style={{ background: "var(--surface-2)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
};

/* ─── Status explanation tooltip ─────────────────────────────── */
const STATUS_REASON = {
  "draft": "AI is waiting for an essay and eligibility check before assessing.",
  "reviewed": "AI has reviewed your essay and eligibility. Check scores.",
  "needs-improvement": "Essay score or eligibility needs attention before this is ready.",
  "ready": "AI has confirmed your essay, eligibility, and documents are complete.",
  "submitted": "You have marked this as submitted externally.",
};

/* ─── Kanban card ─────────────────────────────────────────────── */
const KanbanCard = ({ item, onDelete, onOpen, onMarkSubmitted }) => {
  const title = item.scholarship_title ?? item.title;
  const provider = item.scholarship_provider ?? item.provider;
  const daysLeft = item.days_left ?? item.daysLeft;
  const fitScore = item.fit_score ?? item.fitScore;
  const latestScore = item.latest_score;
  const readiness = item.readiness_score;
  const missingDocs = item.missing_docs;
  const blockers = item.readiness_blockers ?? [];
  const isReady = item.status === "ready";
  const isSubmitted = item.status === "submitted";

  return (
    <div className="card p-3.5 hover:shadow-sm transition group cursor-pointer"
      onClick={() => onOpen(item)}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="mono text-[9px] text-ink-4 uppercase tracking-widest truncate flex-1">{provider}</div>
        <button className="opacity-0 group-hover:opacity-100 transition shrink-0 ml-1"
          onClick={(e) => { e.stopPropagation(); onDelete(item.id, title); }}>
          <Trash2 size={11} className="text-ink-4 hover:text-red-500" />
        </button>
      </div>

      <div className="text-[12.5px] font-medium text-ink leading-snug mb-2">{title}</div>

      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="flex items-center gap-1"
          style={{ color: daysLeft <= 7 ? "var(--danger)" : "var(--ink-3)" }}>
          <Clock size={10} /> {daysLeft}d
        </span>
        <span className="flex items-center gap-1 mono text-accent">
          <Target size={10} /> {fitScore}
        </span>
        {latestScore != null && (
          <span className="flex items-center gap-1 mono text-ink-3">
            <TrendingUp size={10} /> {latestScore}
          </span>
        )}
      </div>

      {missingDocs > 0 && (
        <div className="flex items-center gap-1 text-[10.5px]" style={{ color: "var(--warn)" }}>
          <AlertTriangle size={10} /> {missingDocs} doc{missingDocs > 1 ? "s" : ""} missing
        </div>
      )}

      <ReadinessBar score={readiness} />
      {blockers.length > 0 && (
        <div className="mt-2 space-y-1">
          {blockers.map((b, i) => (
            <div key={i} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--warn)" }}>
              <AlertTriangle size={9} /> {b}
            </div>
          ))}
        </div>
      )}

      {/* AI set this status — show reason */}
      <div className="mt-2 text-[10px] text-ink-4 italic leading-relaxed">
        {STATUS_REASON[item.status]}
      </div>

      {/* Only manual action: mark as submitted */}
      {isReady && !isSubmitted && (
        <button
          className="btn btn-sm w-full justify-center mt-3"
          style={{ background: "var(--accent)", color: "#F4F2EA", border: "none" }}
          onClick={(e) => { e.stopPropagation(); onMarkSubmitted(item.id); }}
        >
          <Send size={11} /> Mark as submitted
        </button>
      )}

      {isSubmitted && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--accent)" }}>
          <Send size={10} /> Submitted externally
        </div>
      )}
    </div>
  );
};

/* ─── Kanban column ──────────────────────────────────────────── */
const KanbanColumn = ({ column, items, onDelete, onOpen, onMarkSubmitted }) => (
  <div className="kanban-col">
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        <CircleDot size={10} className="text-ink-3" />
        <span className="text-[12.5px] font-medium text-ink">{column.label}</span>
        <span className="mono text-[11px] text-ink-4">{items.length}</span>
      </div>
      <MoreHorizontal size={13} className="text-ink-4" />
    </div>
    <div className="space-y-2">
      {items.map((item) => (
        <KanbanCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          onOpen={onOpen}
          onMarkSubmitted={onMarkSubmitted}
        />
      ))}
      {items.length === 0 && (
        <div className="text-center py-8 text-ink-4 text-[11.5px] italic">Empty</div>
      )}
    </div>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────── */
const Applications = ({ setPage, setSelectedScholarship, newApplication }) => {
  const [view, setView] = useState("board");
  const [confirm, setConfirm] = useState(null);
  const [localApps, setLocalApps] = useState(null);
  const [reassessing, setReassessing] = useState(false);

  const { data: dashboardApps } = useApi(getDashboardApplications);
  const { data: standardApps, refetch } = useApi(getApplications);

  const baseApplications = dashboardApps ?? standardApps ?? MOCK_SCHOLARSHIPS.map((s) => ({
    id: s.id,
    status: s.status,
    scholarship_title: s.title,
    scholarship_provider: s.provider,
    days_left: s.daysLeft,
    fit_score: s.fitScore,
    deadline: s.deadline,
    latest_score: null,
    readiness_score: null,
    missing_docs: null,
  }));

  const applications = localApps ?? baseApplications;

  // Fetch readiness per application from GET /readiness/{id}
  useEffect(() => {
    const fetchReadiness = async () => {
      const updated = await Promise.all(
        baseApplications.map(async (a) => {
          try {
            const r = await getReadiness(a.id);
            return { ...a, readiness_score: r?.readiness_score ?? null, readiness_blockers: r?.blockers ?? [] };
          } catch { return a; }
        })
      );
      setLocalApps(updated);
    };
    if (baseApplications.length > 0) fetchReadiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add newly created application
  useEffect(() => {
    if (newApplication) {
      const scholarship = MOCK_SCHOLARSHIPS.find((s) => s.id === newApplication.scholarship_id);
      const newItem = {
        id: `local-${Date.now()}`,
        status: "draft",
        scholarship_title: scholarship?.title ?? "New application",
        scholarship_provider: scholarship?.provider ?? "—",
        days_left: scholarship?.daysLeft ?? 0,
        fit_score: scholarship?.fitScore ?? 0,
        deadline: scholarship?.deadline ?? "—",
        latest_score: null,
        readiness_score: null,
        missing_docs: null,
      };
      setLocalApps((prev) => [...(prev ?? baseApplications), newItem]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newApplication]);

  /* ── Re-assess all — backend recalculates statuses via AI ── */
  const handleReassessAll = async () => {
    setReassessing(true);
    try {
      await refetch();
      // Simulate AI re-assessment when backend is offline
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error("Re-assess failed:", e);
    } finally {
      setReassessing(false);
    }
  };

  /* ── Mark as submitted — only manual status action ── */
  const handleMarkSubmitted = async (id) => {
    setLocalApps((prev) => (prev ?? baseApplications).map((a) =>
      a.id === id ? { ...a, status: "submitted" } : a
    ));
    try { await updateApplicationStatus(id, "submitted"); refetch(); }
    catch (e) { console.error("Submit failed:", e); }
  };

  /* ── Open scholarship detail ── */
  const handleOpen = (item) => {
    const match = MOCK_SCHOLARSHIPS.find((s) => s.title === (item.scholarship_title ?? item.title));
    if (match && setSelectedScholarship) {
      setSelectedScholarship(match.id);
      setPage("scholarship-detail");
    }
  };

  /* ── Delete ── */
  const handleDeleteRequest = (id, title) => setConfirm({ id, title });
  const handleDeleteConfirm = async () => {
    const id = confirm.id;
    setConfirm(null);
    setLocalApps((prev) => (prev ?? baseApplications).filter((a) => a.id !== id));
    try { await deleteApplication(id); refetch(); }
    catch (e) { console.error("Delete failed:", e); }
  };

  const totalReadiness = applications.reduce((s, a) => s + (a.readiness_score ?? 0), 0);
  const avgReadiness = applications.length ? Math.round(totalReadiness / applications.length) : 0;
  const totalMissing = applications.reduce((s, a) => s + (a.missing_docs ?? 0), 0);

  return (
    <div className="px-8 py-8 fade-up">
      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.title}"? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <SectionTitle kicker={`Pipeline · ${applications.length} applications`} title="Applications">
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={handleReassessAll}
            disabled={reassessing}
          >
            {reassessing
              ? <><Loader2 size={12} className="animate-spin" /> Re-assessing…</>
              : <><Sparkles size={12} /> Re-assess all</>}
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setView("list")}
            style={view === "list" ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } : {}}>
            List
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setView("board")}
            style={view === "board" ? { background: "var(--ink)", color: "var(--bg)", borderColor: "var(--ink)" } : {}}>
            Board
          </button>
        </div>
      </SectionTitle>

      {/* AI status explanation banner */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-md mb-6 text-[12px] text-ink-2 leading-relaxed"
        style={{ background: "var(--accent-soft)", border: "1px solid #CBDBD2" }}
      >
        <Sparkles size={13} className="text-accent shrink-0 mt-[2px]" />

        <p className="flex-1 leading-relaxed">
          Application statuses are set automatically by the AI based on your essay score,
          eligibility result, document readiness, and profile completeness.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Avg readiness", value: `${avgReadiness}%` },
          { label: "Missing docs", value: totalMissing },
          { label: "Ready to submit", value: applications.filter((a) => a.status === "ready").length },
        ].map(({ label, value }) => (
          <div key={label} className="card px-4 py-3 flex items-center justify-between">
            <span className="mono text-[10.5px] text-ink-4 uppercase tracking-widest">{label}</span>
            <span className="serif text-[22px] font-medium text-ink">{value}</span>
          </div>
        ))}
      </div>

      {/* Board view */}
      {view === "board" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3" style={{ minWidth: "max-content" }}>
            {COLUMNS.map((col) => (
              <div key={col.id} style={{ width: 210, flexShrink: 0 }}>
                <KanbanColumn
                  column={col}
                  items={applications.filter((a) => a.status === col.id)}
                  onDelete={handleDeleteRequest}
                  onOpen={handleOpen}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="card">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_120px_80px] px-5 py-3 hairline-b mono text-[10px] text-ink-4 uppercase tracking-widest">
            <div>Scholarship</div>
            <div>AI Status</div>
            <div>Fit</div>
            <div>Readiness</div>
            <div>Deadline</div>
            <div></div>
          </div>
          {applications.map((a, i) => (
            <div key={a.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_120px_80px] px-5 py-3.5 items-center ${i < applications.length - 1 ? "hairline-b" : ""}`}>
              <div>
                <div className="font-medium text-ink text-[13px]">{a.scholarship_title ?? a.title}</div>
                <div className="text-[11.5px] text-ink-3">{a.scholarship_provider ?? a.provider}</div>
              </div>
              {/* Read-only status badge */}
              <div className="flex flex-col gap-1">
                <StatusBadge status={a.status} />
                {a.status === "ready" && (
                  <button className="btn btn-sm text-[10px] px-2 py-1"
                    style={{ background: "var(--accent)", color: "#F4F2EA", border: "none" }}
                    onClick={() => handleMarkSubmitted(a.id)}>
                    <Send size={9} /> Submit
                  </button>
                )}
              </div>
              <div className="mono text-[13px] text-accent">{a.fit_score ?? a.fitScore}</div>
              <div className="mono text-[13px] text-ink-2">
                {a.readiness_score != null ? `${a.readiness_score}%` : "—"}
              </div>
              <div className="text-[12px] text-ink-3">
                {a.deadline ?? MOCK_SCHOLARSHIPS.find((s) => s.title === (a.scholarship_title ?? a.title))?.deadline ?? "—"}
              </div>
              <button className="btn btn-ghost btn-sm"
                onClick={() => handleDeleteRequest(a.id, a.scholarship_title)}>
                <Trash2 size={13} className="text-ink-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;