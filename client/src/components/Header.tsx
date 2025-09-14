import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { ClientUser } from '../types';
import type { Page } from '../App';

interface HeaderProps {
  page: Page;
  isAdmin?: boolean;
  client: ClientUser | null;
  onNavigate: (page: Page) => void;
  onClientLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ page, isAdmin = false, client, onNavigate, onClientLogout }) => {
  
  const renderNavActions = () => {
    if (isAdmin) {
      return (
        <button onClick={() => onNavigate('main')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          &larr; Back to App
        </button>
      );
    }

    if (client) {
      return (
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-gray-700">
            Credits: <span className="text-indigo-600">{client.credits}</span>
          </div>
          <button onClick={onClientLogout} className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors">
            Logout
          </button>
        </div>
      );
    }
    
    // Guest view
    if (page === 'clientLogin' || page === 'clientSignup') {
      return (
         <button onClick={() => onNavigate('main')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            &larr; Back to Home
          </button>
      )
    }

    return (
      <div className="flex items-center gap-4">
         <button 
            onClick={() => onNavigate('clientLogin')} 
            className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => onNavigate('clientSignup')} 
            className="text-sm font-bold bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign Up
          </button>
      </div>
    );
  };
  
  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <button onClick={() => onNavigate('main')} className="flex items-center justify-center text-gray-800 hover:text-indigo-600 transition-colors">
          <SparklesIcon className="w-8 h-8 text-indigo-500 mr-3" />
          <div className="flex flex-col items-start">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              VirtuShot
            </h1>
            <p className="text-xs text-gray-500 -mt-1">AI Product Photography</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
            {renderNavActions()}
        </div>
      </div>
    </header>
  );
};
