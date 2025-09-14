import React, { useState } from 'react';
// FIX: Import ClientUser from types.ts, as it's not exported from clientAuth.ts.
import { signup } from '../auth/clientAuth';
import type { ClientUser } from '../types';
import { SparklesIcon } from '../components/icons/SparklesIcon';

interface ClientSignupPageProps {
  onLoginSuccess: (client: ClientUser) => void;
  onNavigate: (page: 'clientLogin' | 'main') => void;
}

export const ClientSignupPage: React.FC<ClientSignupPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const result = signup(email, password);
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
            <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
            <p className="text-gray-500 mt-1">Get 10 free credits to start generating photos!</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
             <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="••••••"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="••••••"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>
           <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => onNavigate('clientLogin')} className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in
              </button>
            </p>
        </div>
      </div>
    </main>
  );
};