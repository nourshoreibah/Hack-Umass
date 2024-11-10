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
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/api/get_current_user');
        console.log(response);
        setUser(response.data);

        // Now that we have the user data, we can safely access has_logged_in
        if (response.data.has_logged_in === true) {
          router.replace('/tabs/home');
        } else {
          router.replace('/SkillsFlow');
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    if (authToken) {
      fetchUser();
    } else {
      router.replace('/login');
    }

  }, [authToken, router]);

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
