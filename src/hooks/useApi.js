/**
 * hooks/useApi.js
 * ---------------
 * Generic data-fetching hook.
 *
 * Wraps any async API function with loading, error, and data state so pages
 * don't need to repeat the same useState + useEffect pattern every time.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(getScholarships);
 *
 *   // With arguments:
 *   const { data } = useApi(() => getScholarship(scholarshipId), [scholarshipId]);
 *
 * When `enabled` is false the fetch is skipped (useful for conditional fetches).
 */

import { useState, useEffect, useCallback } from "react";

/**
 * @template T
 * @param {() => Promise<T>} fetchFn   - the API call to execute
 * @param {any[]}            deps      - dependency array (re-fetches when these change)
 * @param {{ enabled?: boolean, fallback?: T }} options
 */
const useApi = (fetchFn, deps = [], { enabled = true, fallback = null } = {}) => {
  const [data,    setData]    = useState(fallback);
  const [loading, setLoading] = useState(enabled);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export default useApi;
