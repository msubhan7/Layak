/**
 * api/profile.js
 * --------------
 * Profile service — maps to:
 *   GET  /profile
 *   POST /profile
 *   PUT  /profile
 */

import { get, post, put } from "./client";

/** Fetch the authenticated student's profile. */
export const getProfile = () => get("/profile");

/**
 * Create the profile (first-time setup).
 * @param {Object} profileData - matches the `profiles` table schema
 */
export const createProfile = (profileData) => post("/profile", profileData);

/**
 * Update profile fields.
 * @param {Object} profileData - partial or full profile object
 */
export const updateProfile = (profileData) => put("/profile", profileData);
