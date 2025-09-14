import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ApiClientManager } from '../components/admin/ApiClientManager';
import { ApiDocs } from '../components/admin/ApiDocs';
import { WordPressPluginPage } from '../components/admin/WordPressPluginPage';
import { fetchClients } from '../services/apiService';
import type { ClientUser } from '../types';

export interface ApiUsageLog {
  id: number;
  clientId: number;
  timestamp: string;
  promptSummary: string;
}

export type AdminView = 'overview' | 'clients' | 'wordpress' | 'docs';

interface AdminPageProps {
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [usageLogs, setUsageLogs] = useState<ApiUsageLog[]>([]); // In a real app, this would be fetched too
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const fetchedClients = await fetchClients();
        setClients(fetchedClients);
        // In a full implementation, you would also fetch usage logs:
        // const fetchedLogs = await fetchUsageLogs();
        // setUsageLogs(fetchedLogs);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);


  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading admin data...</div>;
    }
    if (error) {
        return <div className="text-center p-8 text-red-600">Error: {error}</div>;
    }

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
