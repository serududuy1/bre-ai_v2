import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

import DataList from '../components/DataList.jsx';
import PanelTitle from '../components/PanelTitle.jsx';

export default function History({ api }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.request('/api/history').then((data) => setHistory(data.history));
  }, [api]);

  return (
    <section className="panel">
      <PanelTitle icon={Clock3}>Riwayat Aktivitas</PanelTitle>
      <DataList rows={history} empty="Belum ada history." />
    </section>
  );
}
