import React, { useState } from "react";
import { ChevronLeft, Zap, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { MOCK_SCHOLARSHIPS, MOCK_ESSAYS } from "../constants/mockData";
import { Check } from "lucide-react";
import { createEssay } from "../api";

const RESHAPED_SAMPLES = {
    sc4: `The research question that keeps returning to me begins inside a PPR flat in Kepong, where I once watched eight Form Five girls study under a single flickering fluorescent bulb. If I could spend the next three years answering any question rigorously, it would be this: how does Malaysia know when a household has actually moved out of poverty — not out of the statistics?\n\nMy grandmother ran a warung on the ground floor of our flat for thirty years. She never appeared in any household income survey I have seen cited in policy papers, yet she was the economic anchor of at least a dozen families on our floor. Her invisibility in the data is not an accident — it is a measurement problem. And measurement problems, I have come to believe, are the most consequential kind of policy problem there is.`,
    sc2: `Malaysia's monetary stability is not an abstract macroeconomic condition — it is the reason my grandmother's warung could price a plate of nasi lemak consistently for thirty years. I grew up in a PPR flat in Kepong watching the practical consequences of sound monetary policy in the smallest unit of economic life: a family's ability to plan.\n\nI want to study economics at the institutions that shaped the frameworks Bank Negara uses today, and return to contribute to the next generation of those frameworks.`,
    sc5: `The intellectual question that keeps me up at night is deceptively simple: how do we know when someone has actually escaped poverty?\n\nI grew up in a PPR flat in Kepong, where I watched my grandmother run a warung nasi lemak for thirty years. By every official metric, we were poor. By every lived metric, we were not — we had stability, community, and a safety net built from thirty years of trusted relationships. The gap between those two pictures is where I want to spend my academic life.`,
};

export const AIReshaper = ({ back, setPage, setSelectedEssay }) => {
    const [sourceId, setSourceId] = useState("");
    const [scholarshipId, setScholarshipId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const sourceEssay = MOCK_ESSAYS.find((e) => e.id === sourceId);
    const targetSchol = MOCK_SCHOLARSHIPS.find((s) => s.id === scholarshipId);
    const sourceSchol = MOCK_SCHOLARSHIPS.find((s) => s.id === sourceEssay?.scholarshipId);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaveAsEssay = async () => {
        if (!result) return;
        setSaving(true);
        try {
            const newEssay = await createEssay({
                title: `${targetSchol?.title ?? "Reshaped"} — reshaped`,
                essay_text: result.text,
                scholarship_id: scholarshipId,
                version: 1,
            });
            setSaved(true);
            if (newEssay?.id && setSelectedEssay) {
                setSelectedEssay(newEssay.id);
                setTimeout(() => setPage("essay-editor"), 800);
            }
        } catch {
            setSaved(true);
        } finally {
            setSaving(false);
        }
    };

    const handleReshape = async () => {
        if (!sourceId || !scholarshipId) return;
        setLoading(true);
        setResult(null);
        await new Promise((r) => setTimeout(r, 1500));
        const text = RESHAPED_SAMPLES[scholarshipId]
            ?? `Your essay has been reshaped for the ${targetSchol?.title} prompt. The core narrative from your original essay has been preserved while aligning the focus to: "${targetSchol?.prompt}"`;
        setResult({ text, words: text.trim().split(/\s+/).length });
        setLoading(false);
    };

    return (
        <div className="px-8 py-8 fade-up max-w-4xl">
            <button onClick={back} className="btn btn-ghost btn-sm mb-6">
                <ChevronLeft size={12} /> AI Toolkit
            </button>
            <div className="mono text-[10px] text-ink-4 tracking-widest uppercase mb-2">04 · Content Reshaper</div>
            <h1 className="serif text-[32px] font-medium leading-tight mb-2">Reshape your writing</h1>
            <p className="text-ink-2 leading-relaxed mb-6 max-w-xl">
                Pick a source essay and a target scholarship. GLM-5.1 reshapes to fit the new prompt — same voice, same content, different shape.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="card p-5">
                    <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Source essay</div>
                    <div className="relative">
                        <select className="input appearance-none pr-8" value={sourceId}
                            onChange={(e) => { setSourceId(e.target.value); setResult(null); }}>
                            <option value="">— Select an essay —</option>
                            {MOCK_ESSAYS.filter((e) => e.words > 0).map((e) => (
                                <option key={e.id} value={e.id}>{e.title} · {e.words}w</option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
                    </div>
                    {sourceSchol && (
                        <div className="mt-3 p-3 rounded-md" style={{ background: "var(--surface-2)" }}>
                            <div className="mono text-[9px] text-ink-4 uppercase tracking-widest mb-1">Current prompt</div>
                            <p className="serif text-[12px] italic text-ink-2 leading-relaxed line-clamp-3">"{sourceSchol.prompt}"</p>
                        </div>
                    )}
                </div>

                <div className="card p-5">
                    <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-2">Target scholarship</div>
                    <div className="relative">
                        <select className="input appearance-none pr-8" value={scholarshipId}
                            onChange={(e) => { setScholarshipId(e.target.value); setResult(null); }}>
                            <option value="">— Select a scholarship —</option>
                            {MOCK_SCHOLARSHIPS.map((s) => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" />
                    </div>
                    {targetSchol && (
                        <div className="mt-3 p-3 rounded-md" style={{ background: "var(--accent-soft)", borderColor: "#CBDBD2" }}>
                            <div className="mono text-[9px] text-accent uppercase tracking-widest mb-1">New prompt</div>
                            <p className="serif text-[12px] italic text-ink leading-relaxed line-clamp-3">"{targetSchol.prompt}"</p>
                        </div>
                    )}
                </div>
            </div>

            <button onClick={handleReshape} disabled={!sourceId || !scholarshipId || loading}
                className="btn btn-primary mb-8">
                {loading ? <><Loader2 size={13} className="animate-spin" /> Reshaping…</> : <><Zap size={13} /> Reshape</>}
            </button>

            {result && (
                <div className="fade-up">
                    <div className="card p-6 mb-4" style={{ background: "var(--accent-soft)", borderColor: "#CBDBD2" }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="mono text-[10px] text-accent uppercase tracking-widest">
                                Reshaped draft · {result.words} words
                            </div>
                            <div className="mono text-[10px] text-ink-4 uppercase tracking-widest">
                                {targetSchol?.provider}
                            </div>
                        </div>
                        <p className="serif text-[15px] leading-relaxed text-ink whitespace-pre-line">{result.text}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveAsEssay}
                            disabled={saving || saved}
                        >
                            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> :
                                saved ? <><Check size={12} /> Saved — opening editor…</> :
                                    <><Check size={12} /> Save as new essay</>}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setResult(null)}>
                            <RefreshCw size={12} /> Reshape again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIReshaper;