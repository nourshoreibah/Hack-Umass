import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';

const HomePage = () => {
  const swiperRef = useRef(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    fetchUsers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') {
        const handleKeyDown = (event) => {
          if (swiperRef != null && swiperRef.current != null) {
            if (event.key === 'ArrowLeft') {
              swiperRef.current.swipeLeft();
            } else if (event.key === 'ArrowRight') {
              swiperRef.current.swipeRight();
            }
          }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      }
    }, [])
  );

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={users}
        renderCard={(user) => (
          <View style={styles.card}>
            <Image source={{ uri: "https://i.imgur.com/6cOCsb0.png" }} style={styles.profileImage} />
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userAttribute}>Email: {user.email}</Text>
            <Text style={styles.userAttribute}>Phone: {user.phone}</Text>
            <Text style={styles.userAttribute}>Address: {user.address}</Text>
          </View>
        )}
        onSwiped={(cardIndex) => {
          console.log('User swiped: ', users[cardIndex]);
        }}
        onSwipedAll={() => {
          console.log('All users swiped');
        }}
        cardIndex={0}
        backgroundColor={'#f0f0f0'}
        stackSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ...styles here
});

export default HomePage;
