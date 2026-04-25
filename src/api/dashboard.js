/**
 * api/dashboard.js
 * ----------------
 * Dashboard / Tracking Layer — maps to:
 *   GET  /dashboard
 *   GET  /dashboard/summary
 *   GET  /deadlines
 *   GET  /readiness/{application_id}
 *   GET  /notifications
 *   POST /notifications/mark-read
 */

import { get, post } from "./client";

/** Full dashboard data (aggregated across all services by the backend). */
export const getDashboard = () => get("/dashboard");

/** Lightweight summary for stat cards (count of applications, scores, etc.). */
export const getDashboardSummary = () => get("/dashboard/summary");

/** All deadlines with days-remaining and readiness blockers. */
export const getDeadlines = () => get("/deadlines");

/**
 * Readiness report for a single application.
 * Returns checklist of blockers: missing docs, low score, eligibility unresolved, etc.
 * @param {string} applicationId
 */
export const getReadiness = (applicationId) => get(`/readiness/${applicationId}`);

/** All notifications for the authenticated user. */
export const getNotifications = () => get("/notifications");

/**
 * Mark one or more notifications as read.
 * @param {string[]} ids - notification IDs to mark read, or omit to mark all
 */
export const markNotificationsRead = (ids) =>
  post("/notifications/mark-read", ids ? { ids } : {});

/**
 * Full application list with aggregated dashboard fields
 * (score, eligibility, readiness, missing docs) in one call.
 */
export const getDashboardApplications = () => get("/dashboard/applications");
