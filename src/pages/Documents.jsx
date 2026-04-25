import React, { useState, useRef } from "react";
import {
  Upload, FileText, Check, Trash2, Eye, X,
  AlertCircle, CheckCircle2, Clock, FolderOpen,
} from "lucide-react";
import { uploadDocument, deleteDocument } from "../api";
import { MOCK_SCHOLARSHIPS } from "../constants/mockData";
import { SectionTitle, Pill } from "../components/ui";

/* ─── Initial document state ─────────────────────────────────── */
const INITIAL_DOCS = [
  { id: "d1", type: "IC / Passport", filename: "ic_aisyah.pdf", uploaded: "2026-03-12", status: "verified", fileUrl: null },
  { id: "d2", type: "Academic Transcript", filename: "transcript_sem5.pdf", uploaded: "2026-04-01", status: "verified", fileUrl: null },
  { id: "d3", type: "Income Statement (EA)", filename: "ea_form_2025.pdf", uploaded: "2026-04-08", status: "pending", fileUrl: null },
  { id: "d4", type: "Resume / CV", filename: "resume_v4.pdf", uploaded: "2026-04-15", status: "verified", fileUrl: null },
  { id: "d5", type: "Recommendation Letter", filename: null, uploaded: null, status: "missing", fileUrl: null },
  { id: "d6", type: "Certificates", filename: "certs_bundle.pdf", uploaded: "2026-02-28", status: "verified", fileUrl: null },
];

const REQUIRED_DOCS = ["IC / Passport", "Academic Transcript", "Income Statement (EA)", "Recommendation Letter", "Resume / CV"];

const STATUS_STYLES = {
  verified: { bg: "var(--accent-soft)", iconColor: "var(--accent)", label: "Verified" },
  pending: { bg: "var(--warn-soft)", iconColor: "var(--warn)", label: "Pending" },
  missing: { bg: "var(--surface-2)", iconColor: "var(--ink-4)", label: "Missing" },
};

/* ─── Confirm dialog ─────────────────────────────────────────── */
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.3)" }}>
    <div className="card p-6 w-80 shadow-xl fade-up">
      <div className="flex items-start justify-between mb-3">
        <h3 className="serif text-[18px] font-medium">Are you sure?</h3>
        <button onClick={onCancel} className="text-ink-4 hover:text-ink"><X size={15} /></button>
      </div>
      <p className="text-[13px] text-ink-2 leading-relaxed mb-5">{message}</p>
      <div className="flex gap-2">
        <button onClick={onConfirm} className="btn btn-sm flex-1 justify-center"
          style={{ background: "var(--danger)", color: "#fff", border: "none" }}>
          Delete
        </button>
        <button onClick={onCancel} className="btn btn-outline btn-sm flex-1 justify-center">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

/* ─── Preview modal ──────────────────────────────────────────── */
const PreviewModal = ({ doc, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="card shadow-xl fade-up" style={{ width: 560, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
      <div className="px-6 py-4 hairline-b flex items-center justify-between shrink-0">
        <div>
          <div className="mono text-[10px] text-ink-4 uppercase tracking-widest">{doc.type}</div>
          <div className="font-medium text-ink mt-0.5">{doc.filename}</div>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={14} /></button>
      </div>
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center"
        style={{ background: "var(--surface-2)", minHeight: 300 }}>
        {doc.fileUrl ? (
          <iframe src={doc.fileUrl} title={doc.filename}
            className="w-full rounded" style={{ height: 400, border: "none" }} />
        ) : (
          <div className="text-center">
            <FolderOpen size={48} className="text-ink-4 mx-auto mb-3" />
            <div className="text-ink-3 text-[13px]">Preview not available for demo files.</div>
            <div className="text-ink-4 text-[11.5px] mt-1">Upload a real file to preview it here.</div>
          </div>
        )}
      </div>
      <div className="px-6 py-4 hairline-t shrink-0 flex justify-between items-center">
        <div className="text-[12px] text-ink-3">Uploaded {doc.uploaded ?? "—"}</div>
        {doc.fileUrl && (
          <a href={doc.fileUrl} download={doc.filename} className="btn btn-outline btn-sm">
            Download
          </a>
        )}
      </div>
    </div>
  </div>
);

/* ─── Upload area modal ──────────────────────────────────────── */
const UploadModal = ({ docType, onUpload, onClose }) => {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (file) => {
    if (file) setSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setUploading(true);
    try {
      await uploadDocument(selected, docType);
    } catch (e) {
      // Backend offline — continue anyway
    } finally {
      onUpload(selected, docType);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="card p-6 w-96 shadow-xl fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-1">Upload</div>
            <h3 className="serif text-[18px] font-medium">{docType}</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={14} /></button>
        </div>

        {/* Drop zone */}
        <div
          className="rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition mb-4"
          style={{
            borderColor: dragging ? "var(--accent)" : "var(--border-strong)",
            background: dragging ? "var(--accent-soft)" : "var(--surface-2)",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => handleFile(e.target.files[0])} />
          <Upload size={28} className="mx-auto mb-3 text-ink-4" />
          {selected ? (
            <div>
              <div className="font-medium text-ink text-[13px]">{selected.name}</div>
              <div className="text-ink-4 text-[11.5px] mt-1">
                {(selected.size / 1024).toFixed(1)} KB
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[13px] text-ink-2 font-medium">Drop file here or click to browse</div>
              <div className="text-[11.5px] text-ink-4 mt-1">PDF, JPG, PNG, DOC up to 10MB</div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={!selected || uploading}
            className="btn btn-primary flex-1 justify-center">
            {uploading ? "Uploading…" : <><Upload size={13} /> Upload</>}
          </button>
          <button onClick={onClose} className="btn btn-outline btn-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Document card ──────────────────────────────────────────── */
const DocumentCard = ({ doc, onUpload, onDelete, onPreview, onMarkVerified }) => {
  const { bg, iconColor, label } = STATUS_STYLES[doc.status] ?? STATUS_STYLES.missing;

  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-md flex items-center justify-center"
          style={{ background: bg }}>
          <FileText size={17} style={{ color: iconColor }} />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          {doc.status !== "missing" && (
            <>
              <button onClick={() => onPreview(doc)}
                className="btn btn-ghost btn-sm" title="Preview">
                <Eye size={13} />
              </button>
              <button onClick={() => onDelete(doc)}
                className="btn btn-ghost btn-sm" title="Delete">
                <Trash2 size={13} className="text-ink-4 hover:text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="serif text-[16px] font-medium text-ink mb-1">{doc.type}</div>
      <div className="text-[11.5px] text-ink-3 mono truncate">
        {doc.filename ?? "— no file uploaded —"}
      </div>
      {doc.uploaded && (
        <div className="text-[11px] text-ink-4 mt-1">Uploaded {doc.uploaded}</div>
      )}

      <div className="mt-3 flex items-center justify-between">
        {doc.status === "verified" && <Pill variant="accent"><Check size={10} /> Verified</Pill>}
        {doc.status === "pending" && (
          <button
            className="pill cursor-pointer"
            style={{ background: "var(--warn-soft)", borderColor: "#EBD6AD", color: "var(--warn)" }}
            onClick={() => onMarkVerified(doc.id)}
          >
            <Clock size={10} /> Pending — mark verified
          </button>
        )}
        {doc.status === "missing" && <Pill variant="danger"><AlertCircle size={10} /> Missing</Pill>}

        {doc.status === "missing" ? (
          <button className="btn btn-outline btn-sm" onClick={() => onUpload(doc.type)}>
            <Upload size={11} /> Upload
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm text-[11.5px]" onClick={() => onUpload(doc.type)}>
            Replace
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Per-application checklist ──────────────────────────────── */
const AppChecklist = ({ documents }) => {
  const uploaded = documents
    .filter((d) => d.status === "verified" || d.status === "pending")
    .map((d) => d.type);

  return (
    <div className="card p-6">
      <div className="mono text-[10px] text-ink-4 uppercase tracking-widest mb-3">
        Document readiness per application
      </div>
      <h3 className="serif text-[20px] font-medium mb-5">Checklist</h3>
      <div className="space-y-5">
        {MOCK_SCHOLARSHIPS.slice(0, 4).map((s) => {
          const ready = REQUIRED_DOCS.filter((r) => uploaded.includes(r));
          const missing = REQUIRED_DOCS.filter((r) => !uploaded.includes(r));
          const pct = Math.round((ready.length / REQUIRED_DOCS.length) * 100);

          return (
            <div key={s.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-medium text-ink truncate max-w-xs">{s.title}</div>
                <div className="mono text-[11px] text-ink-3">{ready.length}/{REQUIRED_DOCS.length} docs</div>
              </div>
              <div className="h-1.5 rounded-full mb-2" style={{ background: "var(--surface-2)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: pct === 100 ? "var(--accent)" : pct >= 60 ? "var(--warn)" : "var(--danger)" }} />
              </div>
              <div className="grid grid-cols-2 gap-1">
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
        })}
      </div>
    </div>
  );
};

/* ─── Page ───────────────────────────────────────────────────── */
const Documents = () => {
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [uploadModal, setUploadModal] = useState(null); // docType string
  const [previewDoc, setPreviewDoc] = useState(null);
  const [confirmDoc, setConfirmDoc] = useState(null);
  const globalUploadRef = useRef(null);

  const handleMarkVerified = (docId) => {
    setDocuments((prev) => prev.map((d) =>
      d.id === docId ? { ...d, status: "verified" } : d
    ));
  };

  const handleUploadComplete = (file, docType) => {
    const today = new Date().toISOString().split("T")[0];
    setDocuments((prev) => prev.map((d) =>
      d.type === docType
        ? {
          ...d, filename: file.name, uploaded: today, status: "pending",
          fileUrl: URL.createObjectURL(file)
        }
        : d
    ));
    setUploadModal(null);
  };

  const handleDelete = (doc) => setConfirmDoc(doc);

  const handleDeleteConfirm = async () => {
    const doc = confirmDoc;
    setConfirmDoc(null);
    setDocuments((prev) => prev.map((d) =>
      d.id === doc.id
        ? { ...d, filename: null, uploaded: null, status: "missing", fileUrl: null }
        : d
    ));
    try { await deleteDocument?.(doc.id); } catch (e) { console.error(e); }
  };

  const handleGlobalUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Try to guess doc type from filename
    const name = file.name.toLowerCase();
    const guessedType =
      name.includes("ic") || name.includes("passport") ? "IC / Passport" :
        name.includes("transcript") ? "Academic Transcript" :
          name.includes("ea") || name.includes("income") ? "Income Statement (EA)" :
            name.includes("resume") || name.includes("cv") ? "Resume / CV" :
              name.includes("cert") ? "Certificates" :
                name.includes("recommend") || name.includes("ref") ? "Recommendation Letter" :
                  null;

    const today = new Date().toISOString().split("T")[0];
    if (guessedType) {
      setDocuments((prev) => prev.map((d) =>
        d.type === guessedType
          ? {
            ...d, filename: file.name, uploaded: today, status: "pending",
            fileUrl: URL.createObjectURL(file)
          }
          : d
      ));
    } else {
      // Can't guess — open upload modal for first missing doc
      const firstMissing = documents.find((d) => d.status === "missing");
      if (firstMissing) setUploadModal(firstMissing.type);
    }
  };

  const verifiedCount = documents.filter((d) => d.status === "verified").length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const missingCount = documents.filter((d) => d.status === "missing").length;

  return (
    <div className="px-8 py-8 fade-up">
      {uploadModal && (
        <UploadModal
          docType={uploadModal}
          onUpload={handleUploadComplete}
          onClose={() => setUploadModal(null)}
        />
      )}
      {previewDoc && (
        <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
      {confirmDoc && (
        <ConfirmDialog
          message={`Delete "${confirmDoc.filename}"? This will mark the document as missing.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDoc(null)}
        />
      )}

      <SectionTitle kicker={`Vault · ${verifiedCount} verified · ${pendingCount} pending · ${missingCount} missing`} title="Documents">
        <div className="flex gap-2">
          <input ref={globalUploadRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleGlobalUpload} />
          <button className="btn btn-primary btn-sm" onClick={() => globalUploadRef.current?.click()}>
            <Upload size={13} /> Upload
          </button>
        </div>
      </SectionTitle>

      {/* Status summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Verified", value: verifiedCount, color: "var(--accent)" },
          { label: "Pending", value: pendingCount, color: "var(--warn)" },
          { label: "Missing", value: missingCount, color: "var(--danger)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card px-4 py-3 flex items-center justify-between">
            <span className="mono text-[10.5px] text-ink-4 uppercase tracking-widest">{label}</span>
            <span className="serif text-[22px] font-medium" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            onUpload={(type) => setUploadModal(type)}
            onDelete={handleDelete}
            onPreview={setPreviewDoc}
            onMarkVerified={handleMarkVerified}
          />
        ))}
      </div>

      {/* Per-application checklist */}
      <AppChecklist documents={documents} />
    </div>
  );
};

export default Documents;