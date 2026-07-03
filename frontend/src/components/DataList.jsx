import Notice from './Notice.jsx';

export default function DataList({ rows, empty }) {
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
