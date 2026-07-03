import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  Clock3,
  Database,
  FileUp,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Save,
  Settings,
  Shield,
  Upload,
} from 'lucide-react';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'upload', label: 'File Upload', icon: FileUp },
  { id: 'history', label: 'History', icon: Clock3 },
  { id: 'settings', label: 'User Settings', icon: Settings },
  { id: 'modules', label: 'Module Manager', icon: PackageCheck },
];

function useApi(token) {
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

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@bre.ai');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Login gagal.');
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-mark"><Shield size={28} /></div>
        <h1>Bre-AI</h1>
        <p>Masuk untuk mengelola modul AI, database, file, dan riwayat aktivitas.</p>
        <form onSubmit={submit} className="form-stack">
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('bre_ai_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('bre_ai_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [activePage, setActivePage] = useState('dashboard');
  const api = useApi(token);

  function handleLogin(data) {
    localStorage.setItem('bre_ai_token', data.access_token);
    localStorage.setItem('bre_ai_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('bre_ai_token');
    localStorage.removeItem('bre_ai_user');
    setToken('');
    setUser(null);
  }

  if (!token) return <Login onLogin={handleLogin} />;

  const Page = {
    dashboard: Dashboard,
    database: DatabasePage,
    upload: FileUpload,
    history: History,
    settings: UserSettings,
    modules: ModuleManager,
  }[activePage];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><Shield size={22} /></div>
          <div>
            <strong>Bre-AI</strong>
            <span>AI Workspace</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activePage === item.id ? 'nav-item active' : 'nav-item'}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Workspace</span>
            <h2>{navItems.find((item) => item.id === activePage)?.label}</h2>
          </div>
          <div className="user-box">
            <span>{user?.email}</span>
            <button className="icon-button" onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <Page api={api} />
      </main>
    </div>
  );
}

function Dashboard({ api }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.request('/api/dashboard').then(setData).catch((err) => setError(err.message));
  }, [api]);

  if (error) return <Notice message={error} />;
  if (!data) return <Notice message="Memuat dashboard..." />;

  const stats = [
    ['Files', data.stats.files],
    ['Modules', data.stats.modules],
    ['Active Modules', data.stats.active_modules],
    ['History', data.stats.history],
  ];

  return (
    <section className="page-grid">
      <div className="stats-row">
        {stats.map(([label, value]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="panel-title">
          <BarChart3 size={18} />
          Aktivitas Terbaru
        </div>
        <DataList rows={data.recent_history} empty="Belum ada aktivitas." />
      </section>
    </section>
  );
}

function DatabasePage({ api }) {
  const [summary, setSummary] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    api.request('/api/database/summary').then((data) => setSummary(data.summary));
    api.request('/api/database/tables').then((data) => setTables(data.tables));
  }, [api]);

  return (
    <section className="two-column">
      <section className="panel">
        <div className="panel-title"><Database size={18} /> Ringkasan Tabel</div>
        <div className="table-like">
          {summary ? Object.entries(summary).map(([name, total]) => (
            <div key={name}><span>{name}</span><strong>{total}</strong></div>
          )) : <Notice message="Memuat database..." />}
        </div>
      </section>
      <section className="panel">
        <div className="panel-title">Daftar Tabel</div>
        <div className="chip-list">
          {tables.map((table) => <span key={table}>{table}</span>)}
        </div>
      </section>
    </section>
  );
}

function FileUpload({ api }) {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  async function loadFiles() {
    const data = await api.request('/api/files');
    setFiles(data.files);
  }

  useEffect(() => { loadFiles(); }, [api]);

  async function upload() {
    if (!selected) return;
    const body = new FormData();
    body.append('file', selected);
    await api.request('/api/files/upload', { method: 'POST', body });
    setSelected(null);
    setMessage('File berhasil diupload.');
    loadFiles();
  }

  return (
    <section className="page-grid">
      <section className="panel upload-panel">
        <div className="panel-title"><Upload size={18} /> Upload File</div>
        <input type="file" onChange={(event) => setSelected(event.target.files?.[0] || null)} />
        <button className="primary-button" type="button" onClick={upload} disabled={!selected}>
          Upload
        </button>
        {message && <div className="success-box">{message}</div>}
      </section>
      <section className="panel">
        <div className="panel-title">File Tersimpan</div>
        <DataList rows={files} empty="Belum ada file." />
      </section>
    </section>
  );
}

function History({ api }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    api.request('/api/history').then((data) => setHistory(data.history));
  }, [api]);
  return (
    <section className="panel">
      <div className="panel-title"><Clock3 size={18} /> Riwayat Aktivitas</div>
      <DataList rows={history} empty="Belum ada history." />
    </section>
  );
}

function UserSettings({ api }) {
  const [settings, setSettings] = useState({
    display_name: '',
    theme: 'system',
    notifications_enabled: true,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.request('/api/users/settings').then((data) => {
      if (data.settings) setSettings(data.settings);
    });
  }, [api]);

  async function save(event) {
    event.preventDefault();
    const data = await api.request('/api/users/settings', {
      method: 'PUT',
      body: JSON.stringify({
        display_name: settings.display_name,
        theme: settings.theme,
        notifications_enabled: settings.notifications_enabled,
      }),
    });
    setSettings(data.settings);
    setMessage('Settings berhasil disimpan.');
  }

  return (
    <section className="panel narrow-panel">
      <div className="panel-title"><Settings size={18} /> User Settings</div>
      <form className="form-stack" onSubmit={save}>
        <label>
          Nama Tampilan
          <input
            value={settings.display_name}
            onChange={(event) => setSettings({ ...settings, display_name: event.target.value })}
          />
        </label>
        <label>
          Tema
          <select
            value={settings.theme}
            onChange={(event) => setSettings({ ...settings, theme: event.target.value })}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={settings.notifications_enabled}
            onChange={(event) => setSettings({ ...settings, notifications_enabled: event.target.checked })}
          />
          Notifikasi aktif
        </label>
        <button className="primary-button" type="submit"><Save size={16} /> Simpan</button>
        {message && <div className="success-box">{message}</div>}
      </form>
    </section>
  );
}

function ModuleManager({ api }) {
  const [modules, setModules] = useState([]);

  async function loadModules() {
    const data = await api.request('/api/modules');
    setModules(data.modules);
  }

  useEffect(() => { loadModules(); }, [api]);

  async function toggleModule(module) {
    await api.request(`/api/modules/${module.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled: !module.enabled }),
    });
    loadModules();
  }

  return (
    <section className="module-grid">
      {modules.map((module) => (
        <article className="module-card" key={module.id}>
          <div>
            <strong>{module.name}</strong>
            <p>{module.description}</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={module.enabled} onChange={() => toggleModule(module)} />
            <span />
          </label>
        </article>
      ))}
    </section>
  );
}

function DataList({ rows, empty }) {
  if (!rows?.length) return <Notice message={empty} />;
  return (
    <div className="data-list">
      {rows.map((row) => (
        <article key={row.id}>
          <strong>{row.filename || row.action || row.name}</strong>
          <span>{row.description || row.content_type || row.created_at}</span>
        </article>
      ))}
    </div>
  );
}

function Notice({ message }) {
  return <div className="notice">{message}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
