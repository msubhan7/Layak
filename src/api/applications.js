/**
 * api/applications.js
 * -------------------
 * Application service — maps to:
 *   POST   /applications
 *   GET    /applications
 *   GET    /applications/{id}
 *   PUT    /applications/{id}/status
 *   DELETE /applications/{id}
 */

import { get, post, put, del } from "./client";

/** List all applications for the authenticated user. */
export const getApplications = () => get("/applications");

/**
 * Get details for a single application.
 * @param {string} id
 */
export const getApplication = (id) => get(`/applications/${id}`);

/**
 * Create a new application record.
 * @param {{ scholarship_id: string, essay_id?: string }} payload
 */
export const createApplication = (payload) => post("/applications", payload);

/**
 * Update the status of an application.
 * @param {string} id
 * @param {string} status - e.g. "draft" | "reviewed" | "ready to submit" | "submitted"
 */
export const updateApplicationStatus = (id, status) =>
  put(`/applications/${id}/status`, { status });

/**
 * Delete an application record.
 * @param {string} id
 */
export const deleteApplication = (id) => del(`/applications/${id}`);
