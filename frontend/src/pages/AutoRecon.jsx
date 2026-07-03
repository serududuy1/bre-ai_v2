import { useEffect, useState } from 'react';
import { GitCompareArrows, Play, RefreshCw } from 'lucide-react';

import Notice from '../components/Notice.jsx';
import PanelTitle from '../components/PanelTitle.jsx';

export default function AutoRecon({ api }) {
  const [files, setFiles] = useState([]);
  const [keyColumn, setKeyColumn] = useState('');
  const [jobName, setJobName] = useState('');
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadJobs() {
    const data = await api.request('/api/autorecon/jobs');
    setJobs(data.jobs);
  }

  useEffect(() => {
    loadJobs().catch((err) => setError(err.message));
  }, [api]);

  async function runRecon(event) {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const body = new FormData();
      files.forEach((file) => body.append('files', file));
      if (keyColumn.trim()) body.append('key_column', keyColumn.trim());
      if (jobName.trim()) body.append('job_name', jobName.trim());

      const data = await api.request('/api/autorecon/reconcile', { method: 'POST', body });
      setResult(data.result);
      await loadJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-grid">
      <section className="panel">
        <PanelTitle icon={GitCompareArrows}>Auto Recon</PanelTitle>
        <form className="recon-form" onSubmit={runRecon}>
          <label>
            Nama Job
            <input
              placeholder="Contoh: rekonsiliasi-bank-juli"
              value={jobName}
              onChange={(event) => setJobName(event.target.value)}
            />
          </label>
          <label>
            Key Column
            <input
              placeholder="Opsional, contoh: transaction_id"
              value={keyColumn}
              onChange={(event) => setKeyColumn(event.target.value)}
            />
          </label>
          <label className="file-drop">
            Multiple Files
            <input
              type="file"
              multiple
              accept=".csv,.tsv,.tab,.txt,.json"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />
          </label>
          <button className="primary-button" type="submit" disabled={loading || files.length < 2}>
            {loading ? <RefreshCw size={16} /> : <Play size={16} />}
            {loading ? 'Memproses...' : 'Jalankan Recon'}
          </button>
          {files.length > 0 && (
            <div className="chip-list">
              {files.map((file) => <span key={file.name}>{file.name}</span>)}
            </div>
          )}
          {error && <div className="error-box">{error}</div>}
        </form>
      </section>

      {result && <ReconResult result={result} />}

      <section className="panel">
        <PanelTitle>History Auto Recon</PanelTitle>
        {jobs.length ? (
          <div className="data-list">
            {jobs.map((job) => (
              <article key={job.id}>
                <strong>{job.job_name}</strong>
                <span>
                  Key: {job.key_column} | Matched: {job.summary?.matched_keys ?? 0} | Missing: {job.summary?.missing_total ?? 0}
                </span>
              </article>
            ))}
          </div>
        ) : <Notice message="Belum ada job Auto Recon." />}
      </section>
    </section>
  );
}

function ReconResult({ result }) {
  const summary = result.summary || {};
  const statRows = [
    ['Total Keys', summary.total_unique_keys],
    ['Matched', summary.matched_keys],
    ['Missing', summary.missing_total],
    ['Mismatch', summary.mismatch_total],
    ['Duplicate', summary.duplicate_total],
  ];

  return (
    <section className="page-grid">
      <div className="stats-row recon-stats">
        {statRows.map(([label, value]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value ?? 0}</strong>
          </article>
        ))}
      </div>

      <section className="two-column">
        <ReconMap title="Missing by File" data={result.missing_by_file} />
        <ReconMap title="Duplicate Keys" data={result.duplicate_keys} />
      </section>

      <section className="panel">
        <PanelTitle>Mismatch Preview</PanelTitle>
        {result.mismatches?.length ? (
          <div className="recon-table">
            <div className="recon-table-head">
              <span>Key</span>
              <span>Column</span>
              <span>Values</span>
            </div>
            {result.mismatches.slice(0, 20).map((item, index) => (
              <div key={`${item.key}-${item.column}-${index}`}>
                <span>{item.key}</span>
                <span>{item.column}</span>
                <span>{Object.entries(item.values).map(([file, value]) => `${file}: ${value}`).join(' | ')}</span>
              </div>
            ))}
          </div>
        ) : <Notice message="Tidak ada mismatch pada kolom yang sama." />}
      </section>
    </section>
  );
}

function ReconMap({ title, data }) {
  return (
    <section className="panel">
      <PanelTitle>{title}</PanelTitle>
      {Object.entries(data || {}).length ? (
        <div className="table-like">
          {Object.entries(data).map(([file, keys]) => (
            <div key={file}>
              <span>{file}</span>
              <strong>{keys.length}</strong>
            </div>
          ))}
        </div>
      ) : <Notice message="Tidak ada data." />}
    </section>
  );
}
