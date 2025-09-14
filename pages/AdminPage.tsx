import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ApiClientManager } from '../components/admin/ApiClientManager';
import { ApiDocs } from '../components/admin/ApiDocs';
import { WordPressPluginPage } from '../components/admin/WordPressPluginPage';
import type { ClientUser } from '../types';

// --- Types ---
export interface ApiUsageLog {
  id: number;
  clientId: number;
  timestamp: string;
  promptSummary: string;
}

// --- LocalStorage Helpers ---
const CLIENTS_KEY = 'ai_photoshoot_clients';
const USAGE_LOGS_KEY = 'apiUsageLogs_credits';

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading '${key}' from localStorage`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving '${key}' to localStorage`, error);
  }
};

// --- Initial Data (for first-time use) ---
const initialClients: ClientUser[] = [
  { id: 1, name: 'E-commerce Store A', email: 'contact@ecommerca.com', passwordHash: 'hashed_admin_pass_salted', apiKey: 'prod_sk_abc123xyz789', status: 'active', credits: 750, creditLimit: 1000, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, name: 'Fashion Blogger Weekly', email: 'style@blogger.io', passwordHash: 'hashed_admin_pass_salted', apiKey: 'prod_sk_def456uvw456', status: 'active', credits: 180, creditLimit: 250, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, name: 'Old Partner Co.', email: 'info@oldpartner.com', passwordHash: 'hashed_admin_pass_salted', apiKey: 'prod_sk_ghi789jkl123', status: 'revoked', credits: 0, creditLimit: 100, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const initialUsageLogs: ApiUsageLog[] = [
    { id: 1, clientId: 1, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), promptSummary: "On a white marble surface..." },
    { id: 2, clientId: 2, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), promptSummary: "Hanging on a driftwood rack..." },
    { id: 3, clientId: 1, timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), promptSummary: "Against a seamless, neutral-colored..." },
    { id: 4, clientId: 3, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), promptSummary: "Folded neatly on a rustic wooden..." },
];


export type AdminView = 'overview' | 'clients' | 'wordpress' | 'docs';

interface AdminPageProps {
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [clients, setClients] = useState<ClientUser[]>(() => {
    const storedClients = loadFromLocalStorage<ClientUser[]>(CLIENTS_KEY, []);

    // Combine stored and initial clients, then deduplicate by email, prioritizing stored data.
    const combined = [...storedClients, ...initialClients];
    const clientMap = new Map<string, ClientUser>();
    for (const client of combined) {
      if (!clientMap.has(client.email)) {
        clientMap.set(client.email, client);
      }
    }
    return Array.from(clientMap.values());
  });
  const [usageLogs, setUsageLogs] = useState<ApiUsageLog[]>(() => loadFromLocalStorage(USAGE_LOGS_KEY, initialUsageLogs));

  useEffect(() => {
    saveToLocalStorage(CLIENTS_KEY, clients);
  }, [clients]);

  useEffect(() => {
    saveToLocalStorage(USAGE_LOGS_KEY, usageLogs);
  }, [usageLogs]);

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview clients={clients} usageLogs={usageLogs} />;
      case 'clients':
        return <ApiClientManager clients={clients} setClients={setClients} usageLogs={usageLogs} setUsageLogs={setUsageLogs} />;
      case 'wordpress':
        return <WordPressPluginPage />;
      case 'docs':
        return <ApiDocs />;
      default:
        return <DashboardOverview clients={clients} usageLogs={usageLogs} />;
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AdminSidebar activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          {renderContent()}
        </div>
      </div>
    </main>
  );
};