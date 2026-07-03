import { useMemo, useState } from 'react';

import AppLayout from './layouts/AppLayout.jsx';
import { getPageById } from './routes/pages.jsx';
import Login from './pages/Login.jsx';
import { useApi } from './hooks/useApi.js';
import { clearSession, getStoredSession, saveSession } from './services/session.js';

export default function App() {
  const initialSession = useMemo(getStoredSession, []);
  const [token, setToken] = useState(initialSession.token);
  const [user, setUser] = useState(initialSession.user);
  const [activePage, setActivePage] = useState('dashboard');
  const api = useApi(token);

  function handleLogin(data) {
    saveSession(data);
    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    clearSession();
    setToken('');
    setUser(null);
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const Page = getPageById(activePage);

  return (
    <AppLayout
      activePage={activePage}
      onChangePage={setActivePage}
      onLogout={logout}
      user={user}
    >
      <Page api={api} />
    </AppLayout>
  );
}
