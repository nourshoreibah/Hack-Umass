import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useFocusEffect } from '@react-navigation/native';

//placeholder, will be fetched from an API
export var users = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    address: '123 Main Street, Springfield, USA',
    profilePicture: 'https://via.placeholder.com/150',
    userId: 1
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '8675309',
    address: '456 bozo Street, Metropolis, USA',
    profilePicture: 'https://via.placeholder.com/150',
    userId: 2
  },
  // Add more user objects as needed
];

const HomePage = () => {
  const swiperRef = useRef(null);

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
            <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userAttribute}>Email: {user.email}</Text>
            <Text style={styles.userAttribute}>Phone: {user.phone}</Text>
            <Text style={styles.userAttribute}>Address: {user.address}</Text>
          </View>
        )}
        onSwiped={(userId) => { console.log('User swiped: ', userId) }} //api call
        onSwipedAll={() => { users.push({
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 234 567 890',
          address: '123 Main Street, Springfield, USA',
          profilePicture: 'https://via.placeholder.com/150',
          userId: users.length + 1
        },) }} //you've reached end of users (won't happen when using actual data)
        cardIndex={0}
        backgroundColor={'#f0f0f0'}
        stackSize={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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