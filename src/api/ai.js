/**
 * api/ai.js
 * ---------
 * AI Intelligence Layer — maps to every /ai/* route:
 *
 *   POST /ai/evaluate-essay
 *   POST /ai/re-evaluate-essay
 *   POST /ai/check-eligibility
 *   POST /ai/match-scholarships
 *   POST /ai/reshape-content
 *
 * Also:
 *   GET  /eligibility/{scholarship_id}
 *   GET  /matches
 *
 * These are the most important routes — they trigger Z.ai (GLM-5.1) on the backend.
 * The frontend never sees the API key; the backend holds it securely in .env.
 */

import { post, get } from "./client";

/**
 * Run an AI essay evaluation.
 * Backend will: fetch essay + scholarship criteria + profile → send to Z.ai → save result.
 *
 * @param {{ essay_id: string, scholarship_id: string }} payload
 * @returns {Promise<EssayEvaluation>}
 */
export const evaluateEssay = (payload) => post("/ai/evaluate-essay", payload);

/**
 * Re-run evaluation on an updated essay.
 * Same shape as evaluateEssay — the backend handles versioning.
 * @param {{ essay_id: string, scholarship_id: string }} payload
 */
export const reEvaluateEssay = (payload) => post("/ai/re-evaluate-essay", payload);

/**
 * Check eligibility for a single scholarship against the student's profile.
 * Backend will: fetch profile + scholarship rules → send to Z.ai → store result.
 *
 * @param {{ scholarship_id: string }} payload
 * @returns {Promise<EligibilityResult>}
 */
export const checkEligibility = (payload) => post("/ai/check-eligibility", payload);

/**
 * Get a previously stored eligibility result (avoids re-calling Z.ai).
 * @param {string} scholarshipId
 */
export const getEligibility = (scholarshipId) => get(`/eligibility/${scholarshipId}`);

/**
 * Rank all scholarships by how well the student fits them.
 * Backend will: fetch profile + all scholarships → send to Z.ai → return ranked list.
 *
 * @returns {Promise<ScholarshipMatch[]>}
 */
export const matchScholarships = () => post("/ai/match-scholarships", {});

/** Get stored match results (if the backend caches them). */
export const getMatches = () => get("/matches");

/**
 * Reshape an existing essay for a different question / word limit.
 * Backend will: fetch source essay → send reshape prompt to Z.ai → save new draft.
 *
 * @param {{
 *   source_essay_id: string,
 *   scholarship_id:  string,
 *   target_question: string,
 *   word_limit:      number
 * }} payload
 * @returns {Promise<{ reshaped_text: string, word_count: number }>}
 */
export const reshapeContent = (payload) => post("/ai/reshape-content", payload);

/* ─── JSDoc type hints (for editor autocomplete) ─────────────── */

/**
 * @typedef {Object} EssayEvaluation
 * @property {number}   overall_score
 * @property {Object}   criterion_scores_json
 * @property {string[]} matched_requirements
 * @property {string[]} missing_requirements
 * @property {Object[]} weaknesses
 * @property {string[]} revision_suggestions
 * @property {Object}   paragraph_feedback_json
 */

/**
 * @typedef {Object} EligibilityResult
 * @property {boolean}  eligible
 * @property {string[]} passed_criteria
 * @property {string[]} failed_criteria
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} ScholarshipMatch
 * @property {string} scholarship_id
 * @property {number} fit_score
 * @property {string} match_reason
 * @property {string} risk_note
 */
