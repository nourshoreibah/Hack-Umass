import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import axiosInstance from '../../api/axiosInstance';

const SwipedPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchSwipedUsers = async () => {
      try {
        const response = await axiosInstance.get('/swiped-users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch swiped users', error);
      }
    };

    fetchSwipedUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swiped Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Image source={{ uri: item.profilePicture }} style={styles.profileImage} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userAttribute}>Email: {item.email}</Text>
              <Text style={styles.userAttribute}>Phone: {item.phone}</Text>
              <Text style={styles.userAttribute}>Address: {item.address}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ...styles here
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userAttribute: {
    fontSize: 14,
  },
});

export default SwipedPage;
