import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Eye, TrendingUp, Zap, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, MessageSquare,
  History, Check,
} from "lucide-react";
import {
  getEssay, updateEssay, evaluateEssay, reEvaluateEssay, getEvaluations,
} from "../api";
import useApi from "../hooks/useApi";
import { MOCK_ESSAYS, MOCK_SCHOLARSHIPS } from "../constants/mockData";

const FALLBACK_TEXT = `The first time I watched the Form Five girls in my neighborhood crowd into the void deck of our PPR flat to study under a single flickering fluorescent bulb, I realized something that no textbook had ever taught me: opportunity is not distributed the way we pretend it is.

I had been tutoring them for six months by then — Mathematics on Mondays, Bahasa Inggeris on Thursdays — and I still remember Nurul, who wrote her SPM trial answers on the back of her brother's old exercise sheets because her family could not afford new ones that term. When she scored 7A in her trials, she cried and told me she thought the marker had made a mistake.

Our PPR community in Kepong is small. Eighty-four families, most of whom work shift hours at the nearby logistics depot, with children who translate government letters for their parents at the dinner table. For most of my secondary school years, I thought "community" was a word that belonged to other people — to prefects, to Rotary clubs, to the students whose parents signed them up for enrichment programs I only saw in university brochures.

It was my grandmother who reframed it for me. She had spent thirty years running a small warung nasi lemak on the ground floor of Blok C, and one evening, as I was complaining about the uneven tables we had set up for study sessions, she told me: komuniti bukan tempat. Komuniti ialah orang yang muncul.

That sentence sits at the center of what I want to carry into university.`;

const FALLBACK_EVALUATION = {
  overall_score: 82,
  previous_score: 78,
  criterion_scores_json: {
    "Clarity of goals": 85,
    "Specificity of achievements": 78,
    "Alignment with scholarship values": 91,
    "Emotional authenticity": 88,
    "Grammar & formality": 76,
    "Structure & flow": 80,
    "Word count efficiency": 74,
  },
  matched_requirements: [
    "Demonstrates community leadership",
    "Personal narrative grounded in Malaysian context",
    "Clear academic ambition stated",
  ],
  missing_requirements: [
    "Quantified outcomes not present",
    "Explicit link to scholarship mission missing",
  ],
  weaknesses: [
    { location: "Paragraph 2", excerpt: "she thought the marker had made a mistake", note: "Powerful moment but ends abruptly — reflect on what it revealed to you." },
    { location: "Final sentence", excerpt: "what I want to carry into university", note: "Abstract. Name a specific course, programme, or contribution." },
  ],
  revision_suggestions: [
    "Quantify your tutoring — hours per week, number of students, SPM outcomes.",
    "Close the grandmother scene with your own action that echoes her words.",
    "Tighten paragraph 3 — 30 words can go without losing meaning.",
  ],
  paragraph_feedback_json: {
    "Paragraph 1": "Strong hook. Sets stakes clearly.",
    "Paragraph 2": "Best moment in the essay — needs a reflective closer.",
    "Paragraph 3": "Over-explains background; tighten.",
    "Paragraph 4": "Grandmother anecdote works well. Extend the resolution.",
    "Paragraph 5": "Closing is too vague. Be specific about your university goals.",
  },
  tone_check: "Tone is appropriately formal with moments of warmth. Consistent throughout.",
  formality_check: "One colloquial phrase detected in paragraph 3. Consider revising.",
  contradiction_check: "No contradictions detected.",
};

const WordCountBar = ({ words, limit }) => {
  const over = words > limit;
  const pct  = Math.min(100, (words / limit) * 100);
  return (
    <div className="text-right">
      <div className="mono text-[11px]" style={{ color: over ? "var(--danger)" : "var(--ink-3)" }}>
        {words} / {limit} words {over && "— over limit"}
      </div>
      <div className="h-1 w-32 rounded-full mt-1" style={{ background: "var(--surface-2)" }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: over ? "var(--danger)" : "var(--accent)" }} />
      </div>
    </div>
  );
};

const VersionPanel = ({ versions, currentVersion, onRestore, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.3)" }}>
    <div className="card shadow-xl fade-up" style={{ width: 420 }}>
      <div className="px-6 py-4 hairline-b flex items-center justify-between">
        <h3 className="serif text-[18px] font-medium">Version history</h3>
        <button onClick={onClose} className="btn btn-ghost btn-sm">Close</button>
      </div>
      <div className="max-h-80 overflow-auto">
        {versions.map((v, i) => (
          <div key={i} className={`px-6 py-4 flex items-center justify-between ${i < versions.length - 1 ? "hairline-b" : ""}`}>
            <div>
              <div className="flex items-center gap-2">
                <div className="serif text-[15px] font-medium text-ink">v{v.version}</div>
                {v.version === currentVersion && (
                  <span className="mono text-[9px] text-accent uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{ background: "var(--accent-soft)" }}>Current</span>
                )}
              </div>
              <div className="text-[11.5px] text-ink-3 mt-0.5">{v.words} words · {v.saved}</div>
            </div>
            {v.version !== currentVersion && (
              <button className="btn btn-outline btn-sm" onClick={() => onRestore(v)}>Restore</button>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RequirementsList = ({ matched = [], missing = [] }) => (
  <div className="px-6 py-5 hairline-b">
    <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-3">Requirements coverage</div>
    {matched.map((r) => (
      <div key={r} className="flex items-start gap-2 py-1.5">
        <CheckCircle2 size={12} className="text-accent mt-0.5 shrink-0" />
        <span className="text-[12px] text-ink-2">{r}</span>
      </div>
    ))}
    {missing.map((r) => (
      <div key={r} className="flex items-start gap-2 py-1.5">
        <XCircle size={12} style={{ color: "var(--danger)" }} className="mt-0.5 shrink-0" />
        <span className="text-[12px] text-ink-2">{r}</span>
      </div>
    ))}
  </div>
);

const ParagraphFeedback = ({ feedback = {} }) => (
  <div className="px-6 py-5 hairline-b">
    <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-3">Paragraph feedback</div>
    {Object.entries(feedback).map(([para, note]) => (
      <div key={para} className="mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <MessageSquare size={11} className="text-ink-4" />
          <span className="mono text-[10px] text-ink-3 uppercase tracking-widest">{para}</span>
        </div>
        <p className="text-[12px] text-ink-2 leading-relaxed pl-4">{note}</p>
      </div>
    ))}
  </div>
);

const QualityChecks = ({ tone, formality, contradiction }) => (
  <div className="px-6 py-5 hairline-b">
    <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-3">Quality checks</div>
    {[
      { label: "Tone",          value: tone,         warn: false },
      { label: "Formality",     value: formality,    warn: formality?.toLowerCase().includes("colloquial") },
      { label: "Contradictions",value: contradiction, warn: contradiction?.toLowerCase().includes("detected") && !contradiction?.toLowerCase().includes("no contradiction") },
    ].map(({ label, value, warn }) => (
      <div key={label} className="flex items-start gap-2 py-1.5">
        {warn
          ? <AlertTriangle size={12} style={{ color: "var(--warn)" }} className="mt-0.5 shrink-0" />
          : <CheckCircle2 size={12} className="text-accent mt-0.5 shrink-0" />}
        <div>
          <span className="mono text-[10px] text-ink-4 uppercase tracking-widest mr-2">{label}</span>
          <span className="text-[12px] text-ink-2">{value ?? "—"}</span>
        </div>
      </div>
    ))}
  </div>
);

const AIPanel = ({ evaluation, onApplyAll }) => {
  const ev       = evaluation ?? FALLBACK_EVALUATION;
  const criteria = ev.criterion_scores_json ?? {};
  const [applied, setApplied] = useState(false);

  const handleApplyAll = () => {
    onApplyAll(ev.revision_suggestions ?? []);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="w-[420px] shrink-0 hairline-l overflow-auto" style={{ background: "var(--surface)" }}>
      <div className="px-6 py-5 hairline-b">
        <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">AI Evaluation · GLM-5.1</div>
        <div className="flex items-end gap-4">
          <div>
            <div className="serif text-[48px] font-medium leading-none text-ink">{ev.overall_score}</div>
            <div className="text-[11px] text-ink-3 mt-1">out of 100</div>
          </div>
          {ev.previous_score && (
            <div className="flex-1 pb-2 text-[12px] text-ink-3 flex items-center gap-1.5">
              <TrendingUp size={11} className="text-accent" /> Up from {ev.previous_score} last version
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5 hairline-b">
        <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-3">Criterion scores</div>
        {Object.entries(criteria).map(([label, score]) => (
          <div key={label} className="flex items-center gap-3 py-1.5">
            <div className="flex-1 text-[12px] text-ink-2">{label}</div>
            <div className="h-1 w-16 rounded-full" style={{ background: "var(--surface-2)" }}>
              <div className="h-full rounded-full"
                style={{ width: `${score}%`, background: score >= 85 ? "var(--accent)" : score >= 70 ? "var(--warn)" : "var(--danger)" }} />
            </div>
            <div className="mono text-[11px] w-6 text-right text-ink-2">{score}</div>
          </div>
        ))}
      </div>

      <RequirementsList matched={ev.matched_requirements ?? []} missing={ev.missing_requirements ?? []} />

      <div className="px-6 py-5 hairline-b">
        <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-3">Weak sections</div>
        {(ev.weaknesses ?? []).map(({ location, excerpt, note }) => (
          <div key={location} className="rounded-md p-3.5 mb-3"
            style={{ background: "var(--warn-soft)", border: "1px solid #EBD6AD" }}>
            <div className="mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--warn)" }}>{location}</div>
            <p className="text-[12px] serif italic leading-relaxed text-ink-2">"{excerpt}"</p>
            <p className="text-[11.5px] text-ink-3 mt-2">{note}</p>
          </div>
        ))}
      </div>

      <ParagraphFeedback feedback={ev.paragraph_feedback_json ?? {}} />
      <QualityChecks tone={ev.tone_check} formality={ev.formality_check} contradiction={ev.contradiction_check} />

      <div className="px-6 py-5">
        <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-3">Revision suggestions</div>
        <ol className="space-y-2.5 mb-4">
          {(ev.revision_suggestions ?? []).map((s, i) => (
            <li key={i} className="flex gap-2.5 text-[12px] text-ink-2">
              <span className="mono text-[10px] text-accent mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
        <button className="btn btn-primary btn-sm w-full justify-center" onClick={handleApplyAll}>
          {applied ? <><Check size={12} /> Applied!</> : <><Zap size={12} /> Apply all suggestions as footnotes</>}
        </button>
        <p className="text-[11px] text-ink-4 text-center mt-2">
          Appends suggestions as numbered notes at the end of your essay
        </p>
      </div>
    </div>
  );
};

const EssayEditor = ({ essayId }) => {
  const mockEssay       = MOCK_ESSAYS.find((e) => e.id === essayId) ?? null;
  const mockScholarship = MOCK_SCHOLARSHIPS.find(
    (s) => s.id === (mockEssay?.scholarshipId ?? mockEssay?.scholarship_id)
  ) ?? null;

  const wordLimit = mockScholarship?.wordLimit ?? mockScholarship?.word_limit ?? 800;
  const prompt    = mockScholarship?.prompt ?? mockScholarship?.essay_prompt ?? "Write your essay here.";
  const provider  = mockScholarship ? `${mockScholarship.provider} · Prompt` : essayId ? "Essay" : "New essay";
  const heading   = mockEssay?.title ?? prompt;

  const [text,           setText]           = useState(essayId ? FALLBACK_TEXT : "");
  const [showAI,         setShowAI]         = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [evaluating,     setEval]           = useState(false);
  const [saveStatus,     setSaveStatus]     = useState(null);
  const [showVersions,   setShowVersions]   = useState(false);
  const [currentVersion, setCurrentVersion] = useState(mockEssay?.version ?? 1);
  const [versions,       setVersions]       = useState([
    { version: mockEssay?.version ?? 1, words: mockEssay?.words ?? 0, saved: "Current", text: essayId ? FALLBACK_TEXT : "" },
  ]);
  const isFirstEval   = useRef(true);
  const autoSaveTimer = useRef(null);

  const { data: essayData } = useApi(() => getEssay(essayId), [essayId], { enabled: !!essayId });
  const { data: evalData, refetch: refetchEval } = useApi(() => getEvaluations(essayId), [essayId], { enabled: !!essayId });

  useEffect(() => { if (essayData?.essay_text) setText(essayData.essay_text); }, [essayData]);
  useEffect(() => {
    if (evalData && (Array.isArray(evalData) ? evalData.length > 0 : true)) isFirstEval.current = false;
  }, [evalData]);

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

  const performSave = useCallback(async (textToSave) => {
    if (!essayId) return;
    setSaveStatus("saving");
    try {
      await updateEssay(essayId, { essay_text: textToSave });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
      const wc = textToSave.trim().split(/\s+/).filter(Boolean).length;
      const newVersion = currentVersion + 1;
      setVersions((prev) => [
        { version: newVersion, words: wc, saved: "Just now", text: textToSave },
        ...prev.slice(0, 4),
      ]);
      setCurrentVersion(newVersion);
    } catch {
      setSaveStatus(null);
    }
  }, [essayId, currentVersion]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => performSave(newText), 3000);
  };

  useEffect(() => () => clearTimeout(autoSaveTimer.current), []);

  const handleManualSave = async () => {
    clearTimeout(autoSaveTimer.current);
    await performSave(text);
  };

  const handleEvaluate = async () => {
    if (!essayId) return;
    setEval(true);
    try {
      const payload = { essay_id: essayId, scholarship_id: essayData?.scholarship_id ?? mockEssay?.scholarshipId };
      if (isFirstEval.current) { await evaluateEssay(payload); isFirstEval.current = false; }
      else { await reEvaluateEssay(payload); }
      await refetchEval();
    } catch (e) { console.error("Evaluation failed:", e); } finally { setEval(false); }
  };

  const handleApplyAll = (suggestions) => {
    if (!suggestions?.length) return;
    const notes = suggestions.map((s, i) => `[${i + 1}] ${s}`).join("\n");
    setText((prev) => `${prev}\n\n---\nRevision notes from AI:\n${notes}`);
  };

  const handleRestoreVersion = (v) => {
    setText(v.text);
    setCurrentVersion(v.version);
    setShowVersions(false);
  };

  const latestEval = Array.isArray(evalData) ? evalData[0] : evalData;

  return (
    <div className="fade-up flex flex-col" style={{ height: "calc(100vh - 50px)" }}>
      {showVersions && (
        <VersionPanel
          versions={versions}
          currentVersion={currentVersion}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersions(false)}
        />
      )}

      <div className="px-8 py-4 hairline-b flex items-center justify-between shrink-0">
        <div className="flex-1 min-w-0 mr-6">
          <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-1">{provider}</div>
          <h1 className="serif text-[20px] font-medium leading-tight truncate">{heading}</h1>
          {mockScholarship && (
            <p className="text-[12px] text-ink-3 mt-0.5 truncate italic">"{prompt}"</p>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <WordCountBar words={wordCount} limit={wordLimit} />
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest min-w-[60px] text-center">
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved" : "Auto-save"}
          </div>
          <button onClick={() => setShowVersions(true)} className="btn btn-ghost btn-sm">
            <History size={13} /> v{currentVersion}
          </button>
          <button onClick={() => setShowAI(!showAI)} className="btn btn-outline btn-sm">
            <Eye size={12} /> {showAI ? "Hide" : "Show"} AI
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleManualSave} disabled={saving}>
            {saving ? "Saving…" : "Save now"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleEvaluate} disabled={evaluating}>
            <RefreshCw size={12} className={evaluating ? "animate-spin" : ""} />
            {evaluating ? "Evaluating…" : isFirstEval.current ? "Evaluate" : "Re-evaluate"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto px-8 py-8">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Start writing your essay here…"
            className="w-full bg-transparent border-0 outline-none"
            style={{ fontFamily: "'Fraunces', serif", fontSize: 16.5, lineHeight: 1.75, color: "var(--ink)", minHeight: "100%", resize: "none" }}
          />
        </div>
        {showAI && <AIPanel evaluation={latestEval} onApplyAll={handleApplyAll} />}
      </div>
    </div>
  );
};

export default EssayEditor;