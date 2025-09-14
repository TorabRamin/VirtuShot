import React from 'react';
import { DashboardIcon } from '../icons/DashboardIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { CodeIcon } from '../icons/CodeIcon';
import { LogoutIcon } from '../icons/LogoutIcon';
import { PluginIcon } from '../icons/PluginIcon';
import type { AdminView } from '../../pages/AdminPage';

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView, onLogout }) => {
  return (
    <aside className="md:w-64 bg-white p-4 rounded-2xl shadow-lg border border-gray-200 flex flex-col flex-shrink-0">
      <nav className="space-y-2">
        <NavItem
          icon={<DashboardIcon className="w-5 h-5" />}
          label="Overview"
          isActive={activeView === 'overview'}
          onClick={() => setActiveView('overview')}
        />
        <NavItem
          icon={<UsersIcon className="w-5 h-5" />}
          label="API Clients"
          isActive={activeView === 'clients'}
          onClick={() => setActiveView('clients')}
        />
        <NavItem
          icon={<PluginIcon className="w-5 h-5" />}
          label="WordPress Plugin"
          isActive={activeView === 'wordpress'}
          onClick={() => setActiveView('wordpress')}
        />
        <NavItem
          icon={<CodeIcon className="w-5 h-5" />}
          label="Integration Docs"
          isActive={activeView === 'docs'}
          onClick={() => setActiveView('docs')}
        />
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-200">
         <NavItem
          icon={<LogoutIcon className="w-5 h-5" />}
          label="Logout"
          isActive={false}
          onClick={onLogout}
        />
      </div>
    </aside>
  );
};