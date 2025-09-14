import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MainPage } from './MainPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage as AdminLoginPage } from './pages/LoginPage';
import { ClientDashboardPage } from './pages/ClientDashboardPage';
import { ClientLoginPage } from './pages/ClientLoginPage';
import { ClientSignupPage } from './pages/ClientSignupPage';
// FIX: Import ClientUser from types.ts, as it's not exported from clientAuth.ts.
import { getCurrentClient, logoutClient } from './auth/clientAuth';
import type { ClientUser } from './types';


export type Page = 'main' | 'adminLogin' | 'adminDashboard' | 'clientLogin' | 'clientSignup' | 'clientDashboard';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('main');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('isAdminAuthenticated') === 'true');
  const [currentClient, setCurrentClient] = useState<ClientUser | null>(null);

  useEffect(() => {
    // Check for an active client session on initial load
    const client = getCurrentClient();
    if (client) {
      setCurrentClient(client);
      setPage('clientDashboard');
    }
  }, []);

  const handleNavigate = (targetPage: Page) => {
    setPage(targetPage);
  };
  
  const handleAdminLoginSuccess = () => {
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    setIsAdminAuthenticated(true);
    setPage('adminDashboard');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAdminAuthenticated(false);
    setPage('main'); 
  };
  
  const handleClientLoginSuccess = (client: ClientUser) => {
    setCurrentClient(client);
    setPage('clientDashboard');
  };

  const handleClientLogout = () => {
    logoutClient();
    setCurrentClient(null);
    setPage('main');
  };

  const renderPage = () => {
    switch (page) {
      case 'adminLogin':
        return <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />;
      case 'adminDashboard':
        return isAdminAuthenticated ? <AdminPage onLogout={handleAdminLogout} /> : <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />;
      case 'clientLogin':
        return <ClientLoginPage onLoginSuccess={handleClientLoginSuccess} onNavigate={handleNavigate} />;
      case 'clientSignup':
        return <ClientSignupPage onLoginSuccess={handleClientLoginSuccess} onNavigate={handleNavigate} />;
      case 'clientDashboard':
        return currentClient ? <ClientDashboardPage client={currentClient} setClient={setCurrentClient} /> : <ClientLoginPage onLoginSuccess={handleClientLoginSuccess} onNavigate={handleNavigate} />;
      case 'main':
      default:
        return <MainPage onNavigate={handleNavigate} isAdmin={isAdminAuthenticated} />;
    }
  };

  const showFooter = page !== 'adminDashboard' && page !== 'adminLogin';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Header 
        page={page}
        isAdmin={page === 'adminDashboard' && isAdminAuthenticated} 
        client={currentClient}
        onNavigate={handleNavigate}
        onClientLogout={handleClientLogout}
      />
      <main className="flex-grow">
        {renderPage()}
      </main>
      {showFooter && (
         <footer className="text-center p-4 text-gray-500 text-sm bg-white border-t border-gray-200">
          <p>&copy; {new Date().getFullYear()} VirtuShot. All rights reserved.</p>
           {/* FIX: The comparison `page !== 'adminLogin'` is redundant because the `showFooter`
               check already ensures that `page` cannot be 'adminLogin'. This redundancy
               was causing a TypeScript error. The button is now always rendered when the footer is visible. */}
           <button onClick={() => handleNavigate('adminLogin')} className="hover:text-indigo-600 transition-colors mt-1">
              Admin Portal
            </button>
        </footer>
      )}
    </div>
  );
};

export default App;
