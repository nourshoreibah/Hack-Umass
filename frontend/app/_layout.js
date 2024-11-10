import { Stack, useRouter } from 'expo-router';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import React, { useEffect, useContext } from 'react';
import Tile from './tile';
import SkillsSelection from './tabs/SkillsSelection';

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
    if (authToken) {
      router.replace('/tabs/home');
    } else {
      router.replace('/login');
    }
  }, [authToken]);

  return (
    <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="SkillsSelection" options={{ headerShown: false }} />
      </Stack>
  );
}

