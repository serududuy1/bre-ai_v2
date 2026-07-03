import { useEffect, useState } from 'react';

export default function ModuleManager({ api }) {
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
