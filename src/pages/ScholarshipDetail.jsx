/**
 * ScholarshipDetail.jsx
 * ---------------------
 * Full detail view for a single scholarship.
 * Tabs: Overview · Eligibility · Requirements · Essay Prompt
 * Right panel: application snapshot + AI suggestion card.
 *
 * Data:
 *   GET  /scholarships/{id}         → scholarship details
 *   GET  /eligibility/{id}          → cached eligibility result
 *   GET  /documents/checklist/{id}  → which docs are uploaded/missing
 *   POST /ai/check-eligibility      → re-run eligibility check
 */

import React, { useState } from "react";
import {
  ArrowRight, Edit3, Sparkles, CheckCircle2, AlertCircle, FileCheck,
} from "lucide-react";
import { getScholarship, getEligibility, getDocumentChecklist, checkEligibility } from "../api";
import useApi from "../hooks/useApi";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { EligibilityBadge, Pill, StatusBadge, ScoreRing } from "../components/ui";

const TABS = ["overview", "eligibility", "requirements", "essay prompt"];

const AI_REVIEW_ITEMS = [
  { label: "Citizenship match",  ok: true  },
  { label: "CGPA threshold",     ok: true  },
  { label: "Leadership record",  ok: true  },
  { label: "Household income",   ok: true  },
  { label: "Essay alignment",    ok: false, note: "Under word target" },
  { label: "Required documents", ok: false, note: "1 missing"         },
];

const OverviewTab = ({ scholarship: s, eligibility }) => {
  const reviewItems = eligibility
    ? [
        ...eligibility.passed_criteria.map((c) => ({ label: c, ok: true  })),
        ...eligibility.failed_criteria.map((c) => ({ label: c, ok: false })),
      ]
    : AI_REVIEW_ITEMS;

  return (
    <div>
      <h3 className="serif text-[22px] font-medium mb-4">About this opportunity</h3>
      <p className="text-ink-2 leading-relaxed mb-5">
        The {s.title} is a competitive award administered by {s.provider}, targeting students
        with strong academic records and a demonstrated commitment to their field.
      </p>
      <p className="text-ink-2 leading-relaxed">
        This scholarship covers tuition, living allowance, and return airfare, and carries a bond
        obligation of up to 8 years depending on the programme.
      </p>
      <div className="rule my-8" />
      <h3 className="serif text-[22px] font-medium mb-4">What the AI reviewed</h3>
      <div className="grid grid-cols-2 gap-3">
        {reviewItems.map((item) => (
          <div key={item.label} className="card p-3.5 flex items-center gap-3">
            {item.ok
              ? <CheckCircle2 size={16} className="text-accent" />
              : <AlertCircle size={16} style={{ color: "var(--warn)" }} />}
            <div className="flex-1">
              <div className="text-[13px] font-medium text-ink">{item.label}</div>
              {item.note && <div className="text-[11.5px] text-ink-3">{item.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EligibilityTab = ({ scholarship: s }) => (
  <div>
    <h3 className="serif text-[22px] font-medium mb-4">Eligibility criteria</h3>
    <div className="space-y-2.5">
      {(s.requirements ?? []).map((req) => (
        <div key={req} className="card p-4 flex items-center gap-3">
          <CheckCircle2 size={16} className="text-accent shrink-0" />
          <span className="text-ink-2">{req}</span>
        </div>
      ))}
    </div>
  </div>
);

const RequirementsTab = ({ checklist }) => {
  const docs = checklist ?? [
    { type: "IC / Passport",         status: "on_file" },
    { type: "Academic Transcript",   status: "on_file" },
    { type: "Income Statement (EA)", status: "on_file" },
    { type: "Recommendation Letter", status: "missing" },
    { type: "Resume / CV",           status: "on_file" },
  ];
  return (
    <div>
      <h3 className="serif text-[22px] font-medium mb-4">Required documents</h3>
      <div className="card">
        {docs.map((doc, i) => (
          <div key={doc.type} className={`p-4 flex items-center gap-3 ${i < docs.length - 1 ? "hairline-b" : ""}`}>
            <FileCheck size={15} className="text-ink-3" />
            <span className="flex-1 text-[13px] text-ink">{doc.type}</span>
            <Pill variant={doc.status === "missing" ? "danger" : "accent"}>
              {doc.status === "missing" ? "Missing" : "On file"}
            </Pill>
          </div>
        ))}
      </div>
    </div>
  );
};

const EssayPromptTab = ({ scholarship: s, setPage }) => (
  <div>
    <h3 className="serif text-[22px] font-medium mb-4">The prompt</h3>
    <div className="card p-7" style={{ background: "var(--surface-2)" }}>
      <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">
        {s.word_limit ?? s.wordLimit} word limit
      </div>
      <p className="serif text-[22px] italic text-ink leading-snug">
        "{s.essay_prompt ?? s.prompt}"
      </p>
    </div>
    <button onClick={() => setPage("essay-editor")} className="btn btn-primary mt-5">
      <Edit3 size={13} /> Open in essay editor
    </button>
  </div>
);

const SidePanel = ({ scholarship: s, setPage, onRecheck, recheckLoading }) => {
  const SNAPSHOT_ROWS = [
    { label: "Status",     value: <StatusBadge status={s.status ?? "draft"} />                              },
    { label: "Essay score",value: <span className="serif text-[15px] font-medium">82 / 100</span>          },
    { label: "Readiness",  value: <span className="mono text-[12px]">64%</span>                             },
    { label: "Deadline",   value: <span className="text-[12.5px]">{s.deadline}</span>                       },
    { label: "Word limit", value: <span className="mono text-[12px]">{s.word_limit ?? s.wordLimit}</span>   },
  ];
  return (
    <>
      <div className="card p-5 mb-4">
        <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">Application snapshot</div>
        <div className="space-y-3">
          {SNAPSHOT_ROWS.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[12px] text-ink-3">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5" style={{ background: "var(--accent-soft)", borderColor: "#CBDBD2" }}>
        <Sparkles size={15} className="text-accent mb-2" />
        <div className="serif text-[16px] font-medium text-ink mb-1.5">One thing to fix</div>
        <p className="text-[12.5px] text-ink-2 leading-relaxed">
          Your opening paragraph tells rather than shows. Lead with a concrete scene — the AI
          suggests the story about your SPM tutoring circle.
        </p>
        <div className="flex gap-2 mt-3">
          <button className="btn btn-sm" style={{ background: "var(--accent)", color: "#F4F2EA" }}
            onClick={() => setPage("essay-editor")}>
            See full feedback <ArrowRight size={12} />
          </button>
          <button className="btn btn-outline btn-sm" onClick={onRecheck} disabled={recheckLoading}>
            {recheckLoading ? "Checking…" : <><Sparkles size={11} /> Re-check</>}
          </button>
        </div>
      </div>
    </>
  );
};

const ScholarshipDetail = ({ scholarshipId, setPage }) => {
  const [tab, setTab] = useState("overview");
  const [recheckLoading, setRecheckLoading] = useState(false);

  const { data: apiScholarship } = useApi(
    () => getScholarship(scholarshipId),
    [scholarshipId],
    { enabled: !!scholarshipId }
  );
  const s = apiScholarship
    ?? MOCK_SCHOLARSHIPS.find((x) => x.id === scholarshipId)
    ?? MOCK_SCHOLARSHIPS[0];

  const { data: eligibility } = useApi(
    () => getEligibility(scholarshipId),
    [scholarshipId],
    { enabled: !!scholarshipId }
  );

  const { data: checklist } = useApi(
    () => getDocumentChecklist(scholarshipId),
    [scholarshipId],
    { enabled: !!scholarshipId }
  );

  const handleRecheck = async () => {
    setRecheckLoading(true);
    try {
      await checkEligibility({ scholarship_id: scholarshipId });
    } catch (e) {
      console.error("Eligibility check failed:", e);
    } finally {
      setRecheckLoading(false);
    }
  };

  // Normalise snake_case (API) vs camelCase (mock)
  const eligibilityKey = s.eligibility_status ?? s.eligibility ?? "eligible";
  const fitScore       = s.fit_score ?? s.fitScore;
  const daysLeft       = s.days_left ?? s.daysLeft;

  return (
    <div className="fade-up">
      <div className="px-8 pt-8 pb-6 hairline-b">
        <div className="mono text-[10.5px] text-ink-4 tracking-widest uppercase mb-2">
          {s.provider} · {s.university}
        </div>
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="serif text-[38px] font-medium leading-[1.1] text-ink mb-4">{s.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <EligibilityBadge e={eligibilityKey} />
              {(s.tags ?? []).map((tag) => <Pill key={tag}>{tag}</Pill>)}
            </div>
            <div className="flex gap-2.5">
              <button className="btn btn-primary" onClick={() => setPage("new-application")}> Start application <ArrowRight size={13} /></button>
              <button onClick={() => setPage("essay-editor")} className="btn btn-outline">
                <Edit3 size={13} /> Draft essay
              </button>
              <button className="btn btn-ghost" onClick={handleRecheck} disabled={recheckLoading}>
                <Sparkles size={13} /> {recheckLoading ? "Checking…" : "Re-check eligibility"}
              </button>
            </div>
          </div>
          <div className="flex gap-5">
            <div className="text-center">
              <ScoreRing score={fitScore} size={92} />
              <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mt-3">Fit score</div>
            </div>
            <div className="text-center">
              <div className="w-[92px] h-[92px] rounded-full flex flex-col items-center justify-center hairline">
                <div className="serif text-[30px] font-medium leading-none"
                  style={{ color: daysLeft <= 7 ? "var(--danger)" : "var(--ink)" }}>
                  {daysLeft}
                </div>
                <div className="mono text-[9px] text-ink-4 uppercase tracking-widest mt-1">days left</div>
              </div>
              <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mt-3">{s.deadline}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pt-5 hairline-b flex gap-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="pb-3 text-[13px] capitalize transition"
            style={{
              borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              color:        tab === t ? "var(--ink)"   : "var(--ink-3)",
              fontWeight:   tab === t ? 500 : 400,
              marginBottom: -1,
            }}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-8 py-8 grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {tab === "overview"     && <OverviewTab scholarship={s} eligibility={eligibility} />}
          {tab === "eligibility"  && <EligibilityTab scholarship={s} />}
          {tab === "requirements" && <RequirementsTab checklist={checklist} />}
          {tab === "essay prompt" && <EssayPromptTab scholarship={s} setPage={setPage} />}
        </div>
        <div>
          <SidePanel scholarship={s} setPage={setPage} onRecheck={handleRecheck} recheckLoading={recheckLoading} />
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;
