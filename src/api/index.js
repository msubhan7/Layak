/**
 * api/index.js
 * ------------
 * Barrel file — re-exports everything from the API layer so pages can do:
 *
 *   import { getScholarships, evaluateEssay, getDashboard } from "../api";
 *
 * instead of importing from multiple separate files.
 */

export * from "./auth";
export * from "./profile";
export * from "./scholarships";
export * from "./essays";
export * from "./documents";
export * from "./ai";
export * from "./applications";
export * from "./dashboard";
export { ApiError } from "./client";
