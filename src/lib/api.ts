import { Entry, User, MongoDBConfig } from './types';

// 1. MongoDB Atlas configuration
const MONGODB_CONFIG: MongoDBConfig = {
  uri: "mongodb+srv://kishore:COaTON6l3lYjJBR9@cluster0.mquam.mongodb.net/KishoreDB?retryWrites=true&w=majority&appName=Cluster0",
  database: "KishoreDB",
  collection: "entries" // Collection for password entries
};

//2. Handle API responses consistently
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || response.statusText || 'An error occurred';
    throw new Error(errorMessage);
  }
  return response.json();
};

// 3. Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    // This would call your MongoDB Realm/App Services authentication endpoint
    try {
      const response = await fetch(`${MONGODB_API_URL}/auth/login`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        }
      );
      const data = await handleResponse<{ user: User; token: string }>(response);
      // authToken = data.token; // Assuming authToken is managed elsewhere or not needed in this context
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/auth/register`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password })
        }
      );
      const data = await handleResponse<{ user: User; token: string }>(response);
      // authToken = data.token; // Assuming authToken is managed elsewhere or not needed in this context
      return data.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: (): void => {
    // authToken = null; // Assuming authToken is managed elsewhere or not needed in this context
  },

  checkAdmin: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/auth/check-admin`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await handleResponse<{ isAdmin: boolean }>(response);
      return data.isAdmin;
    } catch (error) {
      console.error('Check admin error:', error);
      return false;
    }
  }
};

// 4. MongoDB specific API operations
export const mongoDBAPI = {
  // Get all entries
  getAll: async (): Promise<Entry[]> => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/action/find`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          filter: {}
        })
      );
      const result = await handleResponse<{ documents: Entry[] }>(response);
      return result.documents;
    } catch (error) {
      console.error('MongoDB getAll error:', error);
      throw error;
    }
  },

  // Get single entry
  getById: async (id: string): Promise<Entry> => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/action/findOne`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          filter: { _id: { $oid: id } }
        })
      );
      const result = await handleResponse<{ document: Entry }>(response);
      return result.document;
    } catch (error) {
      console.error(`MongoDB getById ${id} error:`, error);
      throw error;
    }
  },

  // Create new entry
  create: async (entry: Omit<Entry, '_id' | 'serialNumber' | 'createdAt' | 'updatedAt'>): Promise<Entry> => {
    try {
      // Get the next serial number
      const countResponse = await fetch(`${MONGODB_API_URL}/action/aggregate`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          pipeline: [
            { $group: { _id: null, maxSerial: { $max: "$serialNumber" } } }
          ]
        })
      );
      
      const countResult = await handleResponse<{ documents: Array<{ maxSerial: number | null }> }>(countResponse);
      const nextSerialNumber = (countResult.documents[0]?.maxSerial || 0) + 1;
      
      // Prepare the new entry with serial number and timestamps
      const newEntry = {
        ...entry,
        serialNumber: nextSerialNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert the document
      const response = await fetch(`${MONGODB_API_URL}/action/insertOne`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          document: newEntry
        })
      );
      
      const result = await handleResponse<{ insertedId: string }>(response);
      
      // Return the created entry with the new ID
      return {
        ...newEntry,
        _id: result.insertedId
      };
    } catch (error) {
      console.error('MongoDB create entry error:', error);
      throw error;
    }
  },

  // Update existing entry
  update: async (id: string, entry: Partial<Entry>): Promise<Entry> => {
    try {
      // Add the updated timestamp
      const updateData = {
        ...entry,
        updatedAt: new Date()
      };
      
      const response = await fetch(`${MONGODB_API_URL}/action/updateOne`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          filter: { _id: { $oid: id } },
          update: { $set: updateData }
        })
      );
      
      await handleResponse<{ modifiedCount: number }>(response);
      
      // Fetch the updated document
      const updatedResponse = await fetch(`${MONGODB_API_URL}/action/findOne`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          filter: { _id: { $oid: id } }
        })
      );
      
      const result = await handleResponse<{ document: Entry }>(updatedResponse);
      return result.document;
    } catch (error) {
      console.error(`MongoDB update entry ${id} error:`, error);
      throw error;
    }
  },

  // Delete entry
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/action/deleteOne`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          filter: { _id: { $oid: id } }
        })
      );
      
      await handleResponse<{ deletedCount: number }>(response);
    } catch (error) {
      console.error(`MongoDB delete entry ${id} error:`, error);
      throw error;
    }
  },

  // Check if username exists for a website
  checkUsername: async (username: string, website: string): Promise<boolean> => {
    try {
      const response = await fetch(`${MONGODB_API_URL}/action/findOne`, 
        mongoFetchOptions('POST', {
          database: MONGODB_CONFIG.database,
          collection: MONGODB_CONFIG.collection,
          filter: { 
            username: username.toLowerCase(),
            website: { $regex: website.toLowerCase(), $options: "i" }
          }
        })
      );
      
      const result = await handleResponse<{ document: Entry | null }>(response);
      return !!result.document;
    } catch (error) {
      console.error('MongoDB check username error:', error);
      throw error;
    }
  }
};

// 5. Mock entries data
let mockEntries: Entry[] = Array.from({ length: 5 }, (_, i) => ({
  _id: `mock-id-${i + 1}`,
  serialNumber: i + 1,
  name: `Sample Account ${i + 1}`,
  username: `user${i + 1}`,
  password: `password${i + 1}`,
  website: i % 2 === 0 ? 'github.com' : 'twitter.com',
  logo: i % 2 === 0 
    ? 'https://www.google.com/s2/favicons?domain=github.com&sz=128' 
    : 'https://www.google.com/s2/favicons?domain=twitter.com&sz=128',
  createdAt: new Date(Date.now() - 86400000 * i),
  updatedAt: new Date()
}));

// Mock user
const mockAdmin: User = {
  id: 'admin-id',
  email: 'admin@example.com',
  name: 'Admin User',
  isAdmin: true,
  createdAt: new Date()
};

// Mock auth implementation
export const mockAuthAPI = {
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    if (email === 'admin@example.com' && password === 'password') {
      return mockAdmin;
    }
    throw new Error('Invalid credentials');
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return {
      id: 'new-user-id',
      email,
      name,
      isAdmin: true, // First user is admin
      createdAt: new Date()
    };
  },

  logout: (): void => {
    // Does nothing in mock implementation
  },

  checkAdmin: async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAdmin !== null;
  }
};

// 6.Mock entries implementation
export const mockEntriesAPI = {
  getAll: async (): Promise<Entry[]> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return [...mockEntries];
  },

  getById: async (id: string): Promise<Entry> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const entry = mockEntries.find(e => e._id === id);
    if (!entry) throw new Error('Entry not found');
    return { ...entry };
  },

  create: async (entry: Omit<Entry, '_id' | 'serialNumber' | 'createdAt' | 'updatedAt'>): Promise<Entry> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newEntry: Entry = {
      _id: `mock-id-${mockEntries.length + 1}`,
      serialNumber: mockEntries.length + 1,
      ...entry,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockEntries.push(newEntry);
    return { ...newEntry };
  },

  update: async (id: string, updateData: Partial<Entry>): Promise<Entry> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEntries.findIndex(e => e._id === id);
    if (index === -1) throw new Error('Entry not found');
    
    const updatedEntry = {
      ...mockEntries[index],
      ...updateData,
      updatedAt: new Date()
    };
    mockEntries[index] = updatedEntry;
    return { ...updatedEntry };
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEntries.findIndex(e => e._id === id);
    if (index === -1) throw new Error('Entry not found');
    mockEntries.splice(index, 1);
  },

  checkUsername: async (username: string, website: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEntries.some(
      e => e.username.toLowerCase() === username.toLowerCase() && 
           e.website.toLowerCase().includes(website.toLowerCase())
    );
  }
};

// 7.Export real MongoDB API for production, mock API for development
export default {
  auth: mockAuthAPI, // Use mock auth for now until backend is ready
  entries: mockEntriesAPI // Use mock entries for now until backend is ready
  // Change to real implementations when ready
};

// 8.Define the MongoDB Data API URL - You'll need to replace this with your actual Data API URL
const MONGODB_API_URL = "https://eu-west-2.aws.data.mongodb-api.com/app/data-abcde/endpoint/data/v1"; 

// 9.Updated helper for consistent fetch options with MongoDB Data API headers
const mongoFetchOptions = (method: string, body?: any) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Request-Headers': '*',
    'Authorization': 'Bearer YOUR_MONGODB_DATA_API_TOKEN' // You need to implement authentication
  },
  ...(body ? { body: JSON.stringify(body) } : {}),
});
