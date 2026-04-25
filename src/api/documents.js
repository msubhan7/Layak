/**
 * api/documents.js
 * ----------------
 * Document service — maps to:
 *   POST /documents/upload
 *   GET  /documents
 *   GET  /documents/checklist/{scholarship_id}
 *
 * Note: file uploads use FormData (not JSON), so we bypass the JSON client.
 */

import { get, del } from "./client";
const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:5000";

/** List all documents for the authenticated user. */
export const getDocuments = () => get("/documents");

/**
 * Upload a document file.
 * Sends as multipart/form-data so the backend receives the binary file.
 *
 * @param {File}   file         - the File object from an <input type="file">
 * @param {string} documentType - e.g. "IC", "transcript", "resume"
 */
export const uploadDocument = async (file, documentType) => {
  const token = localStorage.getItem("auth_token");

  const form = new FormData();
  form.append("file", file);
  form.append("document_type", documentType);

  const response = await fetch(`${BASE_URL}/documents/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    // Do NOT set Content-Type — the browser sets it with the correct boundary
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Upload failed");
  }

  return response.json();
};

/**
 * Get the document checklist for a specific scholarship.
 * Returns which required documents have been uploaded and which are missing.
 * @param {string} scholarshipId
 */
export const getDocumentChecklist = (scholarshipId) =>
  get(`/documents/checklist/${scholarshipId}`);

export const deleteDocument = (id) => del(`/documents/${id}`);