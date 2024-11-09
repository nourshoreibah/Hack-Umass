import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePicture: string;
}

const UserPage: React.FC<{ user?: User }> = ({ user }) => {
  // Example user object; replace this with props or fetched data
  const exampleUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    address: '123 Main Street, Springfield, USA',
    profilePicture: 'https://via.placeholder.com/150', // Replace with a real image URL
  };

  const userInfo = user || exampleUser;

  return (
    <View style={styles.container}>
      <Image source={{ uri: userInfo.profilePicture }} style={styles.profileImage} />
      <Text style={styles.userName}>{userInfo.name}</Text>
      <Text style={styles.userAttribute}>Email: {userInfo.email}</Text>
      <Text style={styles.userAttribute}>Phone: {userInfo.phone}</Text>
      <Text style={styles.userAttribute}>Address: {userInfo.address}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userAttribute: {
    fontSize: 16,
    marginVertical: 5,
    color: '#333',
  },
});

export default UserPage;
