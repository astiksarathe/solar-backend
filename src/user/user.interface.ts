import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  role: string;
  username: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
