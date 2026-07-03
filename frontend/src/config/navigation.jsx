import {
  Clock3,
  Database,
  FileUp,
  LayoutDashboard,
  PackageCheck,
  Settings,
} from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'upload', label: 'File Upload', icon: FileUp },
  { id: 'history', label: 'History', icon: Clock3 },
  { id: 'settings', label: 'User Settings', icon: Settings },
  { id: 'modules', label: 'Module Manager', icon: PackageCheck },
];
