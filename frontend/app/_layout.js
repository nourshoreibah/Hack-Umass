import { Stack, useRouter } from 'expo-router';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import React, { useEffect, useContext, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import BlueGradientBackground from './BlueGradientBackground';

export default function RootLayout() {
  return (
    <BlueGradientBackground>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </BlueGradientBackground>
  );
}

function Main() {
  const { authToken } = useContext(AuthContext);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authToken) {
      const fetchUser = async () => {
        try {
          const response = await axiosInstance.get('/api/current_user');
          setUser(response.data);
  
          if (response.data.has_logged_in) {
            router.replace('/tabs/home');
          } else {
            router.replace('/SkillsFlow');
          }
        } catch (error) {
          console.error('Failed to fetch user data', error);
        }
      };
      fetchUser();
    } else {
      router.replace('/login');
    }
  }, [authToken]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="SkillsSelection" options={{ title: "Skills You Want Help With" }} />
      <Stack.Screen name="SkillsStrength" options={{ title: "Rate Your Current Level" }} />
      <Stack.Screen name="HelpSkillsSelection" options={{ title: "Skills You Can Help With" }} />
      <Stack.Screen name="HelpSkillsStrength" options={{ title: "Rate Your Teaching Level" }} />
      <Stack.Screen 
        name="SkillsFlow" 
        options={{ 
            headerShown: true,
            title: "Edit Skills",
            presentation: 'modal'
        }} 
      />
    </Stack>
  );
}
