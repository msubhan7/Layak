import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, Search, Plus, X, GraduationCap, FileText, FolderOpen } from "lucide-react";
import { MOCK_SCHOLARSHIPS, MOCK_ESSAYS, MOCK_DOCUMENTS } from "../../constants/mockData";

const buildSearchIndex = () => [
  ...MOCK_SCHOLARSHIPS.map((s) => ({
    id: s.id, type: "scholarship", title: s.title, subtitle: s.provider,
    icon: GraduationCap, page: "scholarship-detail", payload: s.id,
    keywords: `${s.title} ${s.provider} ${s.university} ${(s.tags ?? []).join(" ")}`.toLowerCase(),
  })),
  ...MOCK_ESSAYS.map((e) => ({
    id: e.id, type: "essay", title: e.title, subtitle: `${e.words} words · score ${e.score ?? "—"}`,
    icon: FileText, page: "essay-editor", payload: e.id,
    keywords: e.title.toLowerCase(),
  })),
  ...MOCK_DOCUMENTS.map((d) => ({
    id: d.id, type: "document", title: d.type, subtitle: d.filename ?? "Not uploaded",
    icon: FolderOpen, page: "documents", payload: null,
    keywords: `${d.type} ${d.filename ?? ""}`.toLowerCase(),
  })),
];

const SEARCH_INDEX = buildSearchIndex();
const TYPE_LABEL = { scholarship: "Scholarship", essay: "Essay", document: "Document" };

const TopBar = ({ crumbs = [], onBack, setPage, setSelectedScholarship, setSelectedEssay }) => {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);
  const newRef   = useRef(null);

  const results = query.trim().length >= 1
    ? SEARCH_INDEX.filter((item) => item.keywords.includes(query.toLowerCase())).slice(0, 8)
    : [];

  const showDropdown = open && query.trim().length >= 1;

  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target))
        setOpen(false);
      if (!newRef.current?.contains(e.target))
        setNewOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setFocused(0); }, [query]);

  const handleSelect = (result) => {
    setQuery(""); setOpen(false);
    if (!setPage) return;
    if (result.type === "scholarship" && setSelectedScholarship) setSelectedScholarship(result.payload);
    if (result.type === "essay" && setSelectedEssay) setSelectedEssay(result.payload);
    setPage(result.page);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); if (results[focused]) handleSelect(results[focused]); }
    if (e.key === "Escape")    { setOpen(false); setQuery(""); }
  };

  return (
    <div className="hairline-b px-8 py-3 flex items-center justify-between"
      style={{ background: "rgba(250,250,245,.85)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>

      <div className="flex items-center gap-2 text-[12.5px] text-ink-3">
        {onBack && (
          <button onClick={onBack} className="btn btn-ghost btn-sm mr-1">
            <ChevronLeft size={13} /> Back
          </button>
        )}
        {crumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <span className={index === crumbs.length - 1 ? "text-ink font-medium" : ""}>{crumb}</span>
            {index < crumbs.length - 1 && <ChevronRight size={11} className="text-ink-4" />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative" ref={dropRef}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none" style={{ zIndex: 1 }} />
          <input
            ref={inputRef}
            className="input w-64"
            style={{ padding: "7px 30px 7px 30px" }}
            placeholder="Search scholarships, essays…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
              <X size={12} />
            </button>
          )}
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-80 card py-1"
              style={{ top: "100%", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 50 }}>
              {results.length === 0 ? (
                <div className="px-4 py-3 text-[12.5px] text-ink-4 italic">No results for "{query}"</div>
              ) : (
                results.map((result, i) => {
                  const Icon = result.icon;
                  return (
                    <div key={result.id} onClick={() => handleSelect(result)}
                      className="px-3 py-2.5 flex items-center gap-3 cursor-pointer transition"
                      style={{ background: i === focused ? "var(--surface-2)" : "transparent" }}
                      onMouseEnter={() => setFocused(i)}>
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: "var(--accent-soft)" }}>
                        <Icon size={13} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-medium text-ink truncate">{result.title}</div>
                        <div className="text-[11px] text-ink-4 truncate">{result.subtitle}</div>
                      </div>
                      <span className="mono text-[9.5px] text-ink-4 uppercase tracking-widest shrink-0">
                        {TYPE_LABEL[result.type]}
                      </span>
                    </div>
                  );
                })
              )}
              <div className="px-4 py-2 hairline-t mt-1 flex items-center gap-3 text-[10.5px] text-ink-4 mono">
                <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={newRef}>
          <button className="btn btn-outline btn-sm" onClick={() => setNewOpen((o) => !o)}>
            <Plus size={13} /> New
          </button>
          {newOpen && (
            <div className="absolute right-0 mt-1 w-48 card py-1"
              style={{ top: "100%", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", zIndex: 50 }}>
              {[
                { label: "New essay",       icon: FileText,      action: () => { setPage("new-essay");       setNewOpen(false); } },
                { label: "New application", icon: GraduationCap, action: () => { setPage("new-application"); setNewOpen(false); } },
                { label: "Upload document", icon: FolderOpen,    action: () => { setPage("documents");       setNewOpen(false); } },
              ].map(({ label, icon: Icon, action }) => (
                <div key={label} onClick={action}
                  className="px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-surface-2 transition text-[13px] text-ink">
                  <Icon size={13} className="text-ink-3" />
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;