import { API_BASE_URL } from '../config/api.js';

export async function loginWithEmail(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || data.detail || 'Login gagal.');
  }
  return data;
}
