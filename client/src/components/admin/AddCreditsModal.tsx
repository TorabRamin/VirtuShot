import React, { useState } from 'react';
import { CloseIcon } from '../icons/CloseIcon';
import type { ClientUser } from '../../types';

interface AddCreditsModalProps {
  client: ClientUser;
  onClose: () => void;
  onAddCredits: (clientId: number, amount: number) => void;
}

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({ client, onClose, onAddCredits }) => {
  const [amount, setAmount] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      onAddCredits(client.id as number, amount);
    }
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
            <h2 className="text-xl font-semibold text-gray-800">Add Credits</h2>
            <p className="text-sm text-gray-500">{client.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex items-baseline gap-2">
                <span className="text-gray-500">Current Balance:</span>
                <span className="font-bold text-lg text-gray-800">{client.credits.toLocaleString()}</span>
            </div>
            <div>
              <label htmlFor="credit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Credits to Add
              </label>
              <input
                type="number"
                id="credit-amount"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                min="1"
                required
                autoFocus
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
              Add {amount.toLocaleString()} Credits
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};