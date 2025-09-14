
export interface UploadedImage {
  data: string; // base64 encoded image data
  type: string; // mime type e.g. 'image/png'
  name: string;
}

export interface ClientUser {
  id: string | number; // Support for both Mongo's string ID and local number ID
  email: string;
  passwordHash: string; 
  credits: number;
  createdAt: string;
  name: string;
  apiKey: string;
  status: 'active' | 'revoked';
  creditLimit: number;
  isAdmin?: boolean;
}