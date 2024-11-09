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
            {/* <Text style={styles.userName}>{user.display_name}</Text> */}
            {/* <Text style={styles.userAttribute}>Email: {user.email}</Text> */}
          </View>
        )}
        onSwipedRight={(cardIndex) => {
          // Add user to liked users
          console.log('User swiped: ', users[cardIndex]);
        }}
        onSwipedLeft={(cardIndex) => {
          // move to back of queue
          console.log('User not swiped: ', users[cardIndex]);
          users.push(users[cardIndex]);
        }}
        onSwipedAll={() => {
          // swipe!
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
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 200,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userAttribute: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default HomePage;
