import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

// Define the UserPage component
const UserPage = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>User Page</Text>
  </View>
);

// Define the HomePage component
const HomePage = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Home Page</Text>
  </View>
);

// Define the SettingsPage component
const SettingsPage = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Settings Page</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Tab.Navigator initialRouteName="User">
      <Tab.Screen name="Home" component={HomePage} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="User" component={UserPage} options={{ tabBarLabel: 'User' }} />
      <Tab.Screen name="Settings" component={SettingsPage} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}