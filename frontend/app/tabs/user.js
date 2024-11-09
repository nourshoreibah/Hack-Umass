import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../contexts/AuthContext';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/user');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userAttribute}>Email: {user.email}</Text>
      <Text style={styles.userAttribute}>Phone: {user.phone}</Text>
      <Text style={styles.userAttribute}>Address: {user.address}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  // ...styles here
});

export default UserPage;
