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
        const response = await axiosInstance.get('/api/compatible_users');
        setUsers(response.data.users || []); // Ensure users is an array
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
          if (swiperRef.current) {
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
      {users.length > 0 ? (
        <Swiper
          ref={swiperRef}
          cards={users}
          renderCard={(user) => (
            <View style={styles.card}>
              <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
              <Text style={styles.userName}>{user.display_name}</Text>
              {/* Render additional user information as needed */}
            </View>
          )}
          onSwiped={(cardIndex) => {
            console.log('User swiped: ', users[cardIndex]);
          }}
          onSwipedAll={() => {
            console.log('All users swiped');
          }}
          cardIndex={0}
          backgroundColor="#f0f0f0"
        />
      ) : (
        <Text style={styles.noUsersText}>No compatible users found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  noUsersText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
  card: {
    // Your card styling here
  },
  profileImage: {
    // Your profile image styling here
  },
  userName: {
    // Your user name styling here
  },
  // Add other styles as needed
});

export default HomePage;
