/**
 * api/client.js
 * -------------
 * Base HTTP client for all backend requests.
 *
 * - Reads the API base URL from the environment variable VITE_API_URL
 *   (set this in your .env file: VITE_API_URL=http://localhost:8000)
 * - Automatically attaches the JWT auth token from localStorage to every request
 * - Throws a structured ApiError on non-2xx responses so callers can handle them
 */

const BASE_URL = process.env.REACT_APP_API_URL ?? "http://localhost:5000";

/** Structured error thrown on non-2xx responses */
export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Core fetch wrapper.
 * @param {string} path      - e.g. "/scholarships"
 * @param {RequestInit} opts - standard fetch options (method, body, etc.)
 * @returns {Promise<any>}   - parsed JSON response
 */
export const request = async (path, opts = {}) => {
  const token = localStorage.getItem("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...opts, headers });

  // Handle empty responses (e.g. 204 No Content)
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.detail ?? data?.message ?? response.statusText;
    throw new ApiError(response.status, message, data);
  }

  return data;
};

/** Convenience helpers */
export const get  = (path, opts)  => request(path, { method: "GET",    ...opts });
export const post = (path, body)  => request(path, { method: "POST",   body: JSON.stringify(body) });
export const put  = (path, body)  => request(path, { method: "PUT",    body: JSON.stringify(body) });
export const del  = (path)        => request(path, { method: "DELETE" });
