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
});

export default SwipedPage;
