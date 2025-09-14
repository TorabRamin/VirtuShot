import type { ClientUser } from './types';

const AUTH_TOKEN_KEY = 'authToken';
const USER_SESSION_KEY = 'ai_photoshoot_session';
const API_BASE_URL = '/api/auth';

const apiPost = async (endpoint: string, body: object) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed');
  }
  return data;
};

export const signup = async (email: string, password: string): Promise<{ success: boolean; message: string; user: ClientUser | null }> => {
  try {
    const { token, user } = await apiPost('/register', { email, password });
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return { success: true, message: 'Signup successful!', user };
  } catch (error) {
    return { success: false, message: (error as Error).message, user: null };
  }
};

export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user: ClientUser | null }> => {
  try {
    const { token, user } = await apiPost('/login', { email, password });
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    return { success: true, message: 'Login successful!', user };
  } catch (error) {
    return { success: false, message: (error as Error).message, user: null };
  }
};

export const logoutClient = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(USER_SESSION_KEY);
};

export const getCurrentClient = (): ClientUser | null => {
  try {
    const sessionJson = sessionStorage.getItem(USER_SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (e) {
    return null;
  }
};

export const updateClient = (updatedClient: ClientUser): ClientUser => {
    // In the new architecture, the server is the source of truth.
    // We update the session for immediate UI feedback, but the server handles persistence.
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedClient));
    // A real implementation might also have an API call here to update user profile data
    return updatedClient;
};