/**
 * api/auth.js
 * -----------
 * Auth service — maps to:
 *   POST /auth/register
 *   POST /auth/login
 *   GET  /auth/me
 */

import { post, get } from "./client";

/**
 * Register a new user.
 * @param {{ email: string, password: string }} credentials
 */
export const register = (credentials) => post("/auth/register", credentials);

/**
 * Log in and store the returned JWT token in localStorage.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ access_token: string, token_type: string }>}
 */
export const login = async (credentials) => {
  const data = await post("/auth/login", credentials);
  if (data?.access_token) {
    localStorage.setItem("auth_token", data.access_token);
  }
  return data;
};

/** Remove the stored token (client-side logout). */
export const logout = () => localStorage.removeItem("auth_token");

/** Fetch the currently authenticated user. */
export const getMe = () => get("/auth/me");
