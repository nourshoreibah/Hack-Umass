import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        email,
        password,
      });

      const { access_token } = response.data;
      await AsyncStorage.setItem('authToken', access_token);
      setAuthToken(access_token);
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setAuthToken(null);
  };

  const register = async (email, password, display_name) => {
    try {
      await axios.post('http://127.0.0.1:5000/register', {
        email,
        password,
        display_name,
      });
      await login(email, password);
    } catch (error) {
      console.error('Register error', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
      }
    };
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
