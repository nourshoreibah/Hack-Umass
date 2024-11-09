import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomePage from './HomePage';
import SwipedPage from './SwipedPage';
import UserPage from './UserPage';
import { users } from './HomePage';

// Define the UserPage component
// const UserPage = () => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>User Page</Text>
//   </View>
// );

// Define the HomePage component
// const HomePage = () => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>Home Page</Text>
//   </View>
// );

// Define the SettingsPage component
// const SwipedPage = () => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//     <Text>Settings Page</Text>
//   </View>
// );

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Home" component={HomePage} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Sent Invites" component={
        <Tab.Navigator initialRouteName="sentInvites">
        <Tab.Screen name="sentInvites" component={() => <SwipedPage users={users} />} options={{ tabBarLabel: 'Sent Invites' }}} options={{ tabBarLabel: 'Invites' }} />
        
      <Tab.Screen name="User" component={UserPage} options={{ tabBarLabel: 'User' }} />
    </Tab.Navigator>
  );
}