import Dashboard from '../pages/Dashboard.jsx';
import AutoRecon from '../pages/AutoRecon.jsx';
import DatabasePage from '../pages/DatabasePage.jsx';
import FileUpload from '../pages/FileUpload.jsx';
import History from '../pages/History.jsx';
import ModuleManager from '../pages/ModuleManager.jsx';
import UserSettings from '../pages/UserSettings.jsx';

const pages = {
  dashboard: Dashboard,
  autorecon: AutoRecon,
  database: DatabasePage,
  upload: FileUpload,
  history: History,
  settings: UserSettings,
  modules: ModuleManager,
};

export function getPageById(pageId) {
  return pages[pageId] || Dashboard;
}
