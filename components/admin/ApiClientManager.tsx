import React, { useState } from 'react';
import { KeyIcon } from '../icons/KeyIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { UsageHistoryModal } from './UsageHistoryModal';
import { AddCreditsModal } from './AddCreditsModal';
import { EditClientModal } from './EditClientModal';
import type { ClientUser } from '../../types';
import type { ApiUsageLog } from '../../pages/AdminPage';

interface ApiClientManagerProps {
  clients: ClientUser[];
  setClients: React.Dispatch<React.SetStateAction<ClientUser[]>>;
  usageLogs: ApiUsageLog[];
  setUsageLogs: React.Dispatch<React.SetStateAction<ApiUsageLog[]>>;
}

const CreditProgressBar: React.FC<{ credits: number, limit: number }> = ({ credits, limit }) => {
    const percentage = limit > 0 ? (credits / limit) * 100 : 0;
    const displayPercentage = Math.min(percentage, 100);

    let barColor = 'bg-green-500';
    if (percentage <= 50 && percentage > 20) barColor = 'bg-yellow-500';
    if (percentage <= 20) barColor = 'bg-red-500';
    
    return (
        <div className="w-32">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-semibold text-gray-800">{credits.toLocaleString()}</span>
                <span className="text-xs text-gray-500">/ {limit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${barColor} h-2 rounded-full`} style={{ width: `${displayPercentage}%` }}></div>
            </div>
        </div>
    );
};

// --- Main Component ---
export const ApiClientManager: React.FC<ApiClientManagerProps> = ({ clients, setClients, usageLogs, setUsageLogs }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCredits, setNewClientCredits] = useState(100);
  const [newClientCreditLimit, setNewClientCreditLimit] = useState(500);
  
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<ClientUser | null>(null);
  const [clientToCredit, setClientToCredit] = useState<ClientUser | null>(null);
  const [clientToEdit, setClientToEdit] = useState<ClientUser | null>(null);


  const generateApiKey = () => `prod_sk_${[...Array(24)].map(() => Math.random().toString(36)[2]).join('')}`;

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;

    const newClient: ClientUser = {
      id: Date.now(),
      name: newClientName,
      email: newClientEmail,
      apiKey: generateApiKey(),
      status: 'active',
      credits: newClientCredits,
      creditLimit: newClientCreditLimit,
      createdAt: new Date().toISOString(),
      passwordHash: 'not_set_by_admin', // Add placeholder hash
    };

    setClients([newClient, ...clients]);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientCredits(100);
    setNewClientCreditLimit(500);
    setShowAddForm(false);
  };

  const handleUpdateClient = (updatedClient: ClientUser) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    setClientToEdit(null); // Close modal
  };

  const toggleClientStatus = (id: number) => {
    setClients(clients.map(c => 
        c.id === id ? { ...c, status: c.status === 'active' ? 'revoked' : 'active' } : c
    ));
  };

  const handleAddCredits = (clientId: number, amount: number) => {
    setClients(clients.map(c =>
      c.id === clientId ? { ...c, credits: c.credits + amount } : c
    ));
    setClientToCredit(null); // Close modal
  };
  
  const handleSimulateCall = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    if (client.credits <= 0) {
      alert(`${client.name} has no credits remaining.`);
      return;
    }

    // Deduct credit
    setClients(clients.map(c =>
      c.id === clientId ? { ...c, credits: c.credits - 1 } : c
    ));
    
    // Add usage log
    const newLog: ApiUsageLog = {
      id: Date.now(),
      clientId: clientId,
      timestamp: new Date().toISOString(),
      promptSummary: "Simulated API call via dashboard"
    };
    setUsageLogs([newLog, ...usageLogs]);
  };
  
  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div>
      {selectedClientForHistory && (
        <UsageHistoryModal 
            client={selectedClientForHistory}
            usageLogs={usageLogs.filter(log => log.clientId === selectedClientForHistory.id)}
            onClose={() => setSelectedClientForHistory(null)}
        />
      )}
      {clientToCredit && (
        <AddCreditsModal
          client={clientToCredit}
          onAddCredits={handleAddCredits}
          onClose={() => setClientToCredit(null)}
        />
      )}
      {clientToEdit && (
        <EditClientModal
          client={clientToEdit}
          onUpdateClient={handleUpdateClient}
          onClose={() => setClientToEdit(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">API Clients</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Client'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddClient} className="bg-gray-50 p-4 rounded-lg border mb-6 space-y-4">
            <h2 className="font-semibold text-gray-700">New API Client</h2>
            <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-600">Client Name</label>
                <input type="text" id="clientName" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
            </div>
            <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-600">Contact Email</label>
                <input type="email" id="clientEmail" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="clientCredits" className="block text-sm font-medium text-gray-600">Initial Credits</label>
                  <input type="number" id="clientCredits" value={newClientCredits} onChange={e => setNewClientCredits(parseInt(e.target.value, 10))} className="mt-1 w-full p-2 border rounded-md" required min="0" />
              </div>
               <div>
                <label htmlFor="clientCreditLimit" className="block text-sm font-medium text-gray-600">Credit Limit</label>
                <input type="number" id="clientCreditLimit" value={newClientCreditLimit} onChange={e => setNewClientCreditLimit(parseInt(e.target.value, 10))} className="mt-1 w-full p-2 border rounded-md" required min="0" />
            </div>
            </div>
            <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700">Save Client</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-separate" style={{ borderSpacing: '0 0.5rem' }}>
          <thead className="bg-gray-50 hidden md:table-header-group">
            <tr>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-l-lg">Client</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">API Key</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map(client => (
              <tr 
                key={client.id}
                onClick={() => setSelectedClientForHistory(client)}
                className="bg-white shadow-sm border border-gray-100 hover:bg-indigo-50 transition-colors block md:table-row rounded-lg md:rounded-none mb-4 md:mb-0 cursor-pointer"
              >
                <td className="p-3 whitespace-nowrap md:rounded-l-lg block md:table-cell">
                    <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">Client: </span>
                    <p className="font-bold text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                </td>
                <td className="p-3 whitespace-nowrap block md:table-cell">
                     <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">API Key: </span>
                    <div className="flex items-center gap-2">
                        <KeyIcon className="w-4 h-4 text-gray-400"/>
                        <span className="font-mono text-sm text-gray-600 truncate">{client.apiKey.substring(0, 15)}...</span>
                        <button onClick={(e) => { e.stopPropagation(); copyKey(client.apiKey); }} title="Copy API Key" className="text-gray-400 hover:text-indigo-600">
                           <CopyIcon className="w-4 h-4"/>
                        </button>
                        {copiedKey === client.apiKey && <span className="text-xs text-indigo-600">Copied!</span>}
                    </div>
                </td>
                <td className="p-3 whitespace-nowrap block md:table-cell">
                  <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">Status: </span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-sm font-semibold block md:table-cell">
                    <span className="md:hidden text-xs font-semibold text-gray-500 uppercase">Credits: </span>
                    <CreditProgressBar credits={client.credits} limit={client.creditLimit} />
                </td>
                <td className="p-3 whitespace-nowrap md:rounded-r-lg block md:table-cell">
                    <div className="flex items-center gap-4 text-sm font-medium flex-wrap">
                        <button onClick={(e) => { e.stopPropagation(); setClientToCredit(client); }} className="text-indigo-600 hover:text-indigo-800">Add Credits</button>
                        <button onClick={(e) => { e.stopPropagation(); setClientToEdit(client); }} className="text-gray-500 hover:text-gray-800">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleSimulateCall(client.id); }} className="text-gray-500 hover:text-gray-800">Simulate Call</button>
                        <button onClick={(e) => { e.stopPropagation(); toggleClientStatus(client.id); }} className={`${client.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
                            {client.status === 'active' ? 'Revoke' : 'Re-activate'}
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};