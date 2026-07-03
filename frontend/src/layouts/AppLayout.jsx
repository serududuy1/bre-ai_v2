import { LogOut, Shield } from 'lucide-react';

import { navItems } from '../config/navigation.jsx';

export default function AppLayout({ activePage, children, onChangePage, onLogout, user }) {
  const activeLabel = navItems.find((item) => item.id === activePage)?.label;

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
                onClick={() => onChangePage(item.id)}
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
            <h2>{activeLabel}</h2>
          </div>
          <div className="user-box">
            <span>{user?.email}</span>
            <button className="icon-button" onClick={onLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
