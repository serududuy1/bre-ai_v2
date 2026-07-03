import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';

import Notice from '../components/Notice.jsx';
import PanelTitle from '../components/PanelTitle.jsx';

export default function DatabasePage({ api }) {
  const [summary, setSummary] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    api.request('/api/database/summary').then((data) => setSummary(data.summary));
    api.request('/api/database/tables').then((data) => setTables(data.tables));
  }, [api]);

  return (
    <section className="two-column">
      <section className="panel">
        <PanelTitle icon={Database}>Ringkasan Tabel</PanelTitle>
        <div className="table-like">
          {summary ? Object.entries(summary).map(([name, total]) => (
            <div key={name}><span>{name}</span><strong>{total}</strong></div>
          )) : <Notice message="Memuat database..." />}
        </div>
      </section>
      <section className="panel">
        <PanelTitle>Daftar Tabel</PanelTitle>
        <div className="chip-list">
          {tables.map((table) => <span key={table}>{table}</span>)}
        </div>
      </section>
    </section>
  );
}
