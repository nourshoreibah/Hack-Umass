import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs initialRouteName="home">
      <Tabs.Screen name="home" options={{ tabBarLabel: 'Home' }} />
      <Tabs.Screen name="invites" options={{ tabBarLabel: 'Invites', headerShown: false }} />
      <Tabs.Screen name="friends" options={{ tabBarLabel: 'Friends' }} />
      <Tabs.Screen name="user" options={{ tabBarLabel: 'User' }} />
    </Tabs>
  );
}
