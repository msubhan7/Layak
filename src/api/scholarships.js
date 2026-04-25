/**
 * api/scholarships.js
 * -------------------
 * Scholarship & University service — maps to:
 *   GET /scholarships
 *   GET /scholarships/{id}
 *   GET /universities
 *   GET /universities/{id}
 */

import { get } from "./client";

/** List all scholarships. */
export const getScholarships = () => get("/scholarships");

/**
 * Get full details for one scholarship.
 * @param {string} id
 */
export const getScholarship = (id) => get(`/scholarships/${id}`);

/** List all universities. */
export const getUniversities = () => get("/universities");

/**
 * Get full details for one university.
 * @param {string} id
 */
export const getUniversity = (id) => get(`/universities/${id}`);
