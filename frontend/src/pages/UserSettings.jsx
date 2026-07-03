import { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';

import PanelTitle from '../components/PanelTitle.jsx';

export default function UserSettings({ api }) {
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
      <PanelTitle icon={Settings}>User Settings</PanelTitle>
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
