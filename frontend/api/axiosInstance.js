import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';
import React, { useContext } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000', // Ensure this matches your backend URL
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AxiosInterceptor = ({ children }) => {
  const { logout } = useContext(AuthContext);

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        await logout();
        Alert.alert('Session Expired', 'Please log in again.');
        router.replace('/login');
      }
      return Promise.reject(error);
    }
  );

  return children;
};

export default axiosInstance;
