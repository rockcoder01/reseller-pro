export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  companyName?: string;
  createdAt?: Date;
  updatedAt?: Date;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
