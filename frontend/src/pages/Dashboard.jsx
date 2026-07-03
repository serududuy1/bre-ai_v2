import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

import DataList from '../components/DataList.jsx';
import Notice from '../components/Notice.jsx';
import PanelTitle from '../components/PanelTitle.jsx';

export default function Dashboard({ api }) {
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
        <PanelTitle icon={BarChart3}>Aktivitas Terbaru</PanelTitle>
        <DataList rows={data.recent_history} empty="Belum ada aktivitas." />
      </section>
    </section>
  );
}
