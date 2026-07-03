const TOKEN_KEY = 'bre_ai_token';
const USER_KEY = 'bre_ai_user';

export function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY) || '';
  const rawUser = localStorage.getItem(USER_KEY);
  return {
    token,
    user: rawUser ? JSON.parse(rawUser) : null,
  };
}

export function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
