import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../icons/CloseIcon';
import type { ClientUser } from '../../types';

interface EditClientModalProps {
  client: ClientUser;
  onClose: () => void;
  onUpdateClient: (client: ClientUser) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ client, onClose, onUpdateClient }) => {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [creditLimit, setCreditLimit] = useState(client.creditLimit);
  
  // Ensure state updates if a different client is selected while modal is open
  useEffect(() => {
    setName(client.name);
    setEmail(client.email);
    setCreditLimit(client.creditLimit);
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClient({
        ...client,
        name,
        email,
        creditLimit,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Edit Client</h2>
            <p className="text-sm text-gray-500">{client.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="edit-client-name" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                id="edit-client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-client-email" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="edit-client-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
             <div>
              <label htmlFor="edit-credit-limit" className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit
              </label>
              <input
                type="number"
                id="edit-credit-limit"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                min="0"
                required
              />
            </div>
          </div>

          <footer className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Save Changes
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};