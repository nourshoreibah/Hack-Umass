import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/api/current_user');
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


  const editSkills = () => {
    router.push({
        pathname: '/SkillsFlow'
    });
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
      <Text style={styles.userName}>{user.display_name}</Text>
      <Button title="Logout" onPress={logout} />
      <Button title="Edit Skills" onPress={editSkills} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    border: '2px solid #C0C0C0',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27496D',
  },
  buttonContainer: {
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default UserPage;
