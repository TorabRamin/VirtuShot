import type { ClientUser } from '../types';

const CLIENTS_STORAGE_KEY = 'ai_photoshoot_clients';
const SESSION_STORAGE_KEY = 'ai_photoshoot_session';

// Simple "hashing" for demonstration. DO NOT use this in production.
const hashPassword = (password: string): string => {
  // A real implementation would use a library like bcrypt.
  // This is just to avoid storing plain text passwords in local storage.
  return `hashed_${password}_salted`;
};

const generateApiKey = () => `prod_sk_${[...Array(24)].map(() => Math.random().toString(36)[2]).join('')}`;

const getClients = (): ClientUser[] => {
  try {
    const clientsJson = localStorage.getItem(CLIENTS_STORAGE_KEY);
    return clientsJson ? JSON.parse(clientsJson) : [];
  } catch (e) {
    return [];
  }
};

const saveClients = (clients: ClientUser[]) => {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
};

export const signup = (email: string, password: string): { success: boolean; message: string; user: ClientUser | null } => {
  const clients = getClients();
  if (clients.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.', user: null };
  }

  const newUser: ClientUser = {
    id: Date.now(),
    email: email,
    passwordHash: hashPassword(password),
    credits: 10, // 10 free credits on signup
    createdAt: new Date().toISOString(),
    name: email.split('@')[0],
    apiKey: generateApiKey(),
    status: 'active',
    creditLimit: 50, // Default credit limit for new signups
  };

  const updatedClients = [...clients, newUser];
  saveClients(updatedClients);
  
  // Automatically log in the user after signup
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

  return { success: true, message: 'Signup successful!', user: newUser };
};


export const login = (email: string, password: string): { success: boolean; message: string; user: ClientUser | null } => {
  const clients = getClients();
  const user = clients.find(c => c.email.toLowerCase() === email.toLowerCase());

  if (user && user.passwordHash === hashPassword(password)) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return { success: true, message: 'Login successful!', user: user };
  }

  return { success: false, message: 'Invalid email or password.', user: null };
};

export const logoutClient = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getCurrentClient = (): ClientUser | null => {
  try {
    const sessionJson = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (e) {
    return null;
  }
};

export const updateClient = (updatedClient: ClientUser): ClientUser | null => {
    const clients = getClients();
    const clientIndex = clients.findIndex(c => c.id === updatedClient.id);

    if (clientIndex === -1) {
        return null;
    }

    clients[clientIndex] = updatedClient;
    saveClients(clients);

    // Also update the active session
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedClient));

    return updatedClient;
};