// AuthContext.tsx
import React, { createContext, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  signIn: ({ email, password }: { email: string; password: string }) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: false,
  isAuthenticated: false,
  token: null,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC = ({ children }) => {
  const [isLoading, setLoading] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await axios.post('http://<backend-url>/login', {
        email,
        password,
      });
      const accessToken = response.data.access_token;
      await AsyncStorage.setItem('token', accessToken);
      setToken(accessToken);
      setAuthenticated(true);
    } catch (error) {
      console.error('Login failed', error);
      // Handle error (e.g., show a message)
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};