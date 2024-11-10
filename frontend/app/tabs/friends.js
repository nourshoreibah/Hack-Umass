import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button, TouchableOpacity } from 'react-native';
import axiosInstance from '../../api/axiosInstance';
import { useFocusEffect } from '@react-navigation/native';

// StarRating component
const StarRating = ({ rating, onChange }) => {
  const [currentRating, setCurrentRating] = useState(rating || 0);

  const handlePress = (newRating) => {
    setCurrentRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => handlePress(star)}>
          <Text style={{ color: star <= currentRating ? '#FFD700' : '#ccc', fontSize: 20 }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const FriendPage = () => {
  const [users, setUsers] = useState([]);

  const fetchFriends = async () => {
    try {
      const response = await axiosInstance.get('/api/connections');
      setUsers(response.data.connections);
    } catch (error) {
      console.error('Failed to fetch connections', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections</Text>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text style={styles.userName}>{item.display_name}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.userAttribute}>{item.email}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <StarRating
                rating={item.rating}
                onChange={(newRating) => {
                  // Update the user's rating
                  axiosInstance.post('/api/rate_user', {
                    rated_id: item.user_id,
                    rating: newRating,
                  });
                }}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FriendPage;

const styles = StyleSheet.create({
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});