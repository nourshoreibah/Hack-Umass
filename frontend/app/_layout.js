import { Stack } from 'expo-router';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

function Main() {
  const { authToken } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!authToken) {
      router.replace('/login');
    } else {
      router.replace('/tabs/home');
    }
  }, [authToken]);

  return (
    <Stack>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
