const BASE_URL = "http://localhost:5000";;

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export const request = async (path, opts = {}) => {
  const token = localStorage.getItem("auth_token");

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  // Only attach JSON header if not FormData
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error || data?.message || "Request failed",
      data
    );
  }

  return data;
};

export const get = (path) =>
  request(path, { method: "GET" });

export const post = (path, body) =>
  request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const put = (path, body) =>
  request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const del = (path) =>
  request(path, { method: "DELETE" });