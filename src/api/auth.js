import { post, get } from "./client";

/**
 * Register user
 */
export const register = async (credentials) => {
  return await post("/auth/register", credentials);
};

/**
 * Login user
 * Backend returns:
 * {
 *   token: "...",
 *   user: {...}
 * }
 */
export const login = async (credentials) => {
  const data = await post("/auth/login", credentials);

  if (data?.token) {
    localStorage.setItem("auth_token", data.token);
  }

  return data;
};

/**
 * Logout
 */
export const logout = () => {
  localStorage.removeItem("auth_token");
};

/**
 * Current user
 */
export const getMe = () => get("/auth/me");