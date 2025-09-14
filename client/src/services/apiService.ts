import { UploadedImage, ClientUser } from '../types';

const API_BASE_URL = '/api'; // Proxied by Nginx in production

const getAuthToken = () => localStorage.getItem('authToken');

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
};

export const generateImage = (
    imageData: string,
    mimeType: string,
    prompt: string,
    style: string
) => {
    return apiFetch('/generate', {
        method: 'POST',
        body: JSON.stringify({ imageData, mimeType, prompt, style }),
    });
};

export const fetchClients = (): Promise<ClientUser[]> => apiFetch('/admin/clients');
export const createClient = (clientData: Omit<ClientUser, 'id' | 'createdAt' | 'apiKey'>): Promise<ClientUser> => apiFetch('/admin/clients', { method: 'POST', body: JSON.stringify(clientData) });
export const updateClientAsAdmin = (client: ClientUser): Promise<ClientUser> => apiFetch(`/admin/clients/${client.id}`, { method: 'PUT', body: JSON.stringify(client) });

// Add other admin-related API calls here (e.g., fetch logs)
