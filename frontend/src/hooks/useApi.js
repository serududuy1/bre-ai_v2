import { useMemo } from 'react';

import { API_BASE_URL } from '../config/api.js';

export function useApi(token) {
  return useMemo(() => {
    async function request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Request gagal.');
      }
      return data;
    }

    return { request };
  }, [token]);
}
