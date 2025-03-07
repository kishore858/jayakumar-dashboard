
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface Entry {
  _id?: string;
  serialNumber: number;
  name: string;
  username: string;
  password: string;
  website: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

// MongoDB connection configuration
export interface MongoDBConfig {
  uri: string;
  database: string;
  collection: string;
}
