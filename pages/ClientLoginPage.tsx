import React, { useState } from 'react';
// FIX: Import ClientUser from types.ts, as it's not exported from clientAuth.ts.
import { login } from '../auth/clientAuth';
import type { ClientUser } from '../types';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import type { Page } from '../App';

interface ClientLoginPageProps {
  onLoginSuccess: (client: ClientUser) => void;
  onNavigate: (page: 'clientSignup' | 'main') => void;
}

export const ClientLoginPage: React.FC<ClientLoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const result = login(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <main className="container mx-auto p-4 md:p-8 flex items-center justify-center h-full">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="text-center mb-6">
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-4">
                <SparklesIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
             </div>
            <h1 className="text-2xl font-bold text-gray-800">Client Login</h1>
            <p className="text-gray-500 mt-1">Access your dashboard to generate images.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>
             <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Login'}
              </button>
            </div>
          </form>
           <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button onClick={() => onNavigate('clientSignup')} className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up for free
              </button>
            </p>
        </div>
      </div>
    </main>
  );
};