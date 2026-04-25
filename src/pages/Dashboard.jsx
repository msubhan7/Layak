/**
 * Dashboard.jsx
 * Data: GET /dashboard/summary, GET /deadlines
 * Falls back to mock data if backend not yet available.
 */

import React from "react";
import {
  Sparkles, ArrowRight, Briefcase, TrendingUp,
  CheckCircle2, AlertCircle, Calendar, Building2,
  ChevronRight, Target, Zap, AlertTriangle,
} from "lucide-react";
import useApi from "../hooks/useApi";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { SectionTitle, EligibilityBadge } from "../components/ui";
import { getDashboard, getDashboardSummary, getDeadlines, getDashboardApplications } from "../api";

const FALLBACK_STATS = [
  { label: "Active applications", value: "—", delta: "loading…", icon: Briefcase },
  { label: "AI fit score — avg", value: "—", delta: "loading…", icon: TrendingUp },
  { label: "Ready to submit", value: "—", delta: "loading…", icon: CheckCircle2 },
  { label: "Missing documents", value: "—", delta: "loading…", icon: AlertCircle },
];

const summaryToStats = (s) => [
  { label: "Active applications", value: s.active_applications ?? "—", delta: `+${s.new_this_month ?? 0} this month`, icon: Briefcase },
  { label: "AI fit score — avg", value: s.avg_fit_score ?? "—", delta: `across ${s.eligible_count ?? 0} eligible`, icon: TrendingUp },
  { label: "Ready to submit", value: s.ready_to_submit ?? "—", delta: `${s.awaiting_review ?? 0} awaiting review`, icon: CheckCircle2 },
  { label: "Missing documents", value: s.missing_documents ?? "—", delta: s.missing_doc_label ?? "—", icon: AlertCircle },
];

const AI_ACTIVITY = [
  { icon: Sparkles, title: "Bank Negara essay rescored", desc: "81 → 89 after revision", time: "yesterday" },
  { icon: Target, title: "Eligibility verified", desc: "Cambridge Trust — ASEAN Bursary", time: "2d ago" },
  { icon: Zap, title: "Content reshaped", desc: "Khazanah → MARA (750w)", time: "3d ago" },
  { icon: AlertTriangle, title: "Shell eligibility failed", desc: "Leadership criterion", time: "5d ago" },
];

const StatCard = ({ label, value, delta, icon: Icon }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-6">
      <div className="mono text-[10.5px] text-ink-4 tracking-widest uppercase">{label}</div>
      <Icon size={15} className="text-ink-4" />
    </div>
    <div className="serif text-[38px] font-medium leading-none text-ink">{value}</div>
    <div className="text-[11.5px] text-ink-3 mt-3">{delta}</div>
  </div>
);

const AIActivityItem = ({ icon: Icon, title, desc, time, isLast }) => (
  <div className={`p-4 flex gap-3 ${!isLast ? "hairline-b" : ""}`}>
    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--accent-soft)" }}>
      <Icon size={13} className="text-accent" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[12.5px] font-medium text-ink">{title}</div>
      <div className="text-[11.5px] text-ink-3 mt-0.5">{desc}</div>
      <div className="mono text-[10px] text-ink-4 mt-1 uppercase tracking-widest">{time}</div>
    </div>
  </div>
);

const Dashboard = ({ setPage, setSelectedScholarship }) => {
  const { data: summary, loading: summaryLoading, error: summaryError } = useApi(getDashboardSummary);
  const { data: deadlinesRaw, loading: deadlinesLoading, error: deadlinesError } = useApi(getDeadlines);
  // Enriched application list from GET /dashboard/applications
  const { data: dashboardApps } = useApi(getDashboardApplications);
  const { data: dashboardData } = useApi(getDashboard);
  const stats = dashboardData ? summaryToStats(dashboardData) : summary ? summaryToStats(summary) : FALLBACK_STATS;

  const loading = summaryLoading || deadlinesLoading;
  const error = summaryError || deadlinesError;
  const upcoming = (deadlinesRaw ?? MOCK_SCHOLARSHIPS.map((s) => ({
    ...s, days_left: s.daysLeft, fit_score: s.fitScore,
  }))).slice(0, 4);

  return (
    <div className="fade-up">
      <div className="px-8 pt-10 pb-8 hairline-b" style={{ background: "linear-gradient(180deg, rgba(15,58,46,0.03), transparent)" }}>
        <div className="mono text-[10.5px] text-ink-4 tracking-widest uppercase mb-3">Week 17 · April 2026</div>
        <h1 className="serif text-[44px] font-medium leading-[1.05] text-ink max-w-2xl">
          Good afternoon, Aisyah.<br />
          <span className="text-ink-3 italic font-normal">Five deadlines, one story.</span>
        </h1>
        <p className="text-ink-2 mt-4 max-w-xl leading-relaxed">
          Your Cambridge bursary closes in five days. Two essays are still below target,
          and a recommendation letter is outstanding across three applications.
        </p>
        <div className="flex gap-2.5 mt-6">
          <button onClick={() => setPage("ai")} className="btn btn-primary"><Sparkles size={13} /> Run AI triage</button>
          <button onClick={() => setPage("applications")} className="btn btn-outline">Review applications <ArrowRight size={13} /></button>
        </div>
      </div>

      <div className="px-8 py-8">
        {error && (
          <div className="mb-5 px-4 py-3 rounded-md text-[12.5px]"
            style={{ background: "var(--warn-soft)", color: "var(--warn)", border: "1px solid #EBD6AD" }}>
            Could not reach the server — showing cached data. Check that the backend is running.
          </div>
        )}
        {loading && !error && (
          <div className="mb-5 px-4 py-3 rounded-md text-[12.5px] text-ink-3 hairline shimmer">
            Loading dashboard data…
          </div>
        )}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <SectionTitle kicker="Readiness — Next 90 days" title="Upcoming deadlines">
              <button className="btn btn-ghost btn-sm" onClick={() => setPage("scholarships")}>View all <ArrowRight size={12} /></button>
            </SectionTitle>
            <div className="card">
              {upcoming.map((s, i) => (
                <div key={s.id} onClick={() => { setSelectedScholarship(s.id); setPage("scholarship-detail"); }}
                  className={`px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-surface-2 transition ${i < upcoming.length - 1 ? "hairline-b" : ""}`}>
                  <div className="w-11 text-center">
                    <div className="serif text-[22px] font-semibold leading-none" style={{ color: (s.days_left ?? s.daysLeft) <= 7 ? "var(--danger)" : "var(--ink)" }}>
                      {s.days_left ?? s.daysLeft}
                    </div>
                    <div className="mono text-[9px] text-ink-4 tracking-widest uppercase mt-1">days</div>
                  </div>
                  <div className="w-px h-10" style={{ background: "var(--border)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink truncate">{s.title}</div>
                    <div className="text-[12px] text-ink-3 flex items-center gap-2 mt-0.5">
                      <Building2 size={11} /> {s.provider} · <Calendar size={11} /> {s.deadline}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <EligibilityBadge e={s.eligibility} />
                    <div className="text-right">
                      <div className="mono text-[10px] text-ink-4 uppercase tracking-widest">Fit</div>
                      <div className="serif text-[18px] font-medium text-accent">{s.fit_score ?? s.fitScore}</div>
                    </div>
                    <ChevronRight size={14} className="text-ink-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle kicker="Intelligence" title="Recent AI" />
            <div className="card">
              {AI_ACTIVITY.map((item, i) => (
                <AIActivityItem key={item.title} {...item} isLast={i === AI_ACTIVITY.length - 1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
