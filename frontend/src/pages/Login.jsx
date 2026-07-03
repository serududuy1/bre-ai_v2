import { useState } from 'react';
import { Shield } from 'lucide-react';

import { loginWithEmail } from '../services/authApi.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@bre.ai');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginWithEmail(email, password);
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
