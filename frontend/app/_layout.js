import { Stack, useRouter } from 'expo-router';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import React, { useEffect, useContext } from 'react';

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
