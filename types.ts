
export interface UploadedImage {
  data: string; // base64 encoded image data
  type: string; // mime type e.g. 'image/png'
  name: string;
}

export interface ClientUser {
  id: number;
  email: string;
  passwordHash: string; // In a real app, this would be a proper bcrypt hash
  credits: number;
  createdAt: string;
  // Fields from ApiClient
  name: string;
  apiKey: string;
  status: 'active' | 'revoked';
  creditLimit: number;
}