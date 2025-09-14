import React, { useState } from 'react';
import { CloseIcon } from '../icons/CloseIcon';
import { CreditCardIcon } from '../icons/CreditCardIcon';

interface PurchaseCreditsModalProps {
  onClose: () => void;
  onPurchase: (amount: number) => void;
  currentBalance: number;
}

const creditPackages = [
  { credits: 50, price: 4.99, bestValue: false },
  { credits: 120, price: 9.99, bestValue: true },
  { credits: 300, price: 19.99, bestValue: false },
];

export const PurchaseCreditsModal: React.FC<PurchaseCreditsModalProps> = ({ onClose, onPurchase, currentBalance }) => {
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPurchase(selectedPackage.credits);
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
            <h2 className="text-xl font-semibold text-gray-800">Buy More Credits</h2>
            <p className="text-sm text-gray-500">Current Balance: {currentBalance.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
             <p className="text-sm text-gray-600">Select a package to add credits to your account.</p>
             <div className="grid grid-cols-1 gap-3">
                 {creditPackages.map(pkg => (
                     <button
                        type="button"
                        key={pkg.credits}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative text-left p-4 border-2 rounded-lg transition-all ${
                            selectedPackage.credits === pkg.credits
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                            : 'border-gray-300 hover:border-indigo-400'
                        }`}
                     >
                        {pkg.bestValue && (
                            <div className="absolute top-0 right-4 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                BEST VALUE
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-gray-800">{pkg.credits.toLocaleString()} Credits</p>
                            <p className="text-lg font-bold text-indigo-600">${pkg.price}</p>
                        </div>
                     </button>
                 ))}
             </div>
          </div>

          <footer className="p-4 bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <CreditCardIcon className="w-5 h-5" />
              Purchase {selectedPackage.credits.toLocaleString()} Credits for ${selectedPackage.price}
            </button>
             <p className="text-center text-xs text-gray-400 mt-2">This is a simulation. No real payment will be processed.</p>
          </footer>
        </form>
      </div>
    </div>
  );
};