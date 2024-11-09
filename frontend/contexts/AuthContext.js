import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';
import { router } from 'expo-router';

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
    router.replace('/login');
  };

  const register = async (email, password, display_name) => {
    try {
      await axios.post('http://127.0.0.1:5000/register', {
        email,
        password,
        display_name,
      });
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

  useEffect(() => {
    // Set up Axios interceptors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          Alert.alert('Session Expired', 'Please log in again.');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ authToken, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
