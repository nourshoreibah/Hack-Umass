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

  const renderCard = (user) => (
    <View style={styles.card}>
      {/* Display user's profile picture */}
      <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />

      {/* Display user's display name */}
      <Text style={styles.userName}>{user.display_name}</Text>

      {/* Display user's skills and fluency levels */}
      {user.matching_skills && user.matching_skills.length > 0 ? (
        <View style={styles.skillsContainer}>
          {user.matching_skills.map((skill, index) => (
            <Text key={index} style={styles.skillText}>
              {skill.skill_name} - {skill.fluency_level}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noSkillsText}>No matching skills</Text>
      )}
    </View>
  );

  const onSwipedRight = async (cardIndex) => {
    const user = users[cardIndex];
    try {
      await axiosInstance.post('/api/make-request', {
        requested_id: user.user_id,
      });
      console.log(`Invite sent to user ID: ${user.user_id}`);
    } catch (error) {
      console.error('Failed to send invite', error);
    }
  };

  return (
    <View style={styles.container}>
      {users.length > 0 ? (
        <Swiper
          ref={swiperRef}
          cards={users}
          renderCard={renderCard}
          onSwipedRight={onSwipedRight}
          onSwiped={(cardIndex) => {
            console.log('User swiped: ', users[cardIndex]);
          }}
          onSwipedAll={() => {
            console.log('All users swiped');
          }}
          cardIndex={0}
          backgroundColor="#f0f0f0"
          stackSize={3}
          cardVerticalMargin={20}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 300,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  skillsContainer: {
    marginTop: 10,
  },
  skillText: {
    fontSize: 18,
    marginBottom: 5,
  },
  noSkillsText: {
    fontSize: 16,
    color: '#888',
  },
  noUsersText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
});

export default HomePage;
