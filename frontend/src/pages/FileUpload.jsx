import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';

import DataList from '../components/DataList.jsx';
import PanelTitle from '../components/PanelTitle.jsx';

export default function FileUpload({ api }) {
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
        <PanelTitle icon={Upload}>Upload File</PanelTitle>
        <input type="file" onChange={(event) => setSelected(event.target.files?.[0] || null)} />
        <button className="primary-button" type="button" onClick={upload} disabled={!selected}>
          Upload
        </button>
        {message && <div className="success-box">{message}</div>}
      </section>
      <section className="panel">
        <PanelTitle>File Tersimpan</PanelTitle>
        <DataList rows={files} empty="Belum ada file." />
      </section>
    </section>
  );
}
