/**
 * api/essays.js
 * -------------
 * Essay service — maps to:
 *   POST /essays
 *   GET  /essays
 *   GET  /essays/{id}
 *   PUT  /essays/{id}
 *
 * Also handles evaluation retrieval:
 *   GET  /evaluations/{essay_id}
 */

import { get, post, put } from "./client";

/** List all essays for the authenticated user. */
export const getEssays = () => get("/essays");

/**
 * Get one essay by ID.
 * @param {string} id
 */
export const getEssay = (id) => get(`/essays/${id}`);

/**
 * Create a new essay draft.
 * @param {{ title: string, essay_text: string, scholarship_id?: string }} payload
 */
export const createEssay = (payload) => post("/essays", payload);

/**
 * Update (and version) an existing essay.
 * The backend should auto-increment the version number on each PUT.
 * @param {string} id
 * @param {{ title?: string, essay_text?: string }} payload
 */
export const updateEssay = (id, payload) => put(`/essays/${id}`, payload);

/**
 * Fetch stored AI evaluations for a given essay.
 * @param {string} essayId
 */
export const getEvaluations = (essayId) => get(`/evaluations/${essayId}`);
