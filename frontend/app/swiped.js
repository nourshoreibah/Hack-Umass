import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button } from 'react-native';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';



export const SwipedPage = () => {
  const [users, setUsers] = useState([]);

  const fetchSwipedUsers = async () => {
    try {
      const response = await axiosInstance.get('/protected/outgoing_requests');
      setUsers(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch swiped users', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSwipedUsers();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Outgoing Requests</Text>
      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.requested_display_name}</Text>
          </View>
        )}
      />
    </View>
  );
};

export const ReceivedInvitesPage = () => {
  const [invites, setInvites] = useState([]);

  const fetchReceivedInvites = async () => {
    try {
      const response = await axiosInstance.get('/protected/incoming_requests');
      setInvites(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch received invites', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReceivedInvites();
    }, [])
  );

  const handleAccept = async (requesterId) => {
    try {
      await axiosInstance.post('/protected/accept_invite', { requester_id: requesterId });
      setInvites(invites.filter(invite => invite.requester_id !== requesterId));
      fetchReceivedInvites();
    } catch (error) {
      console.error('Failed to accept invite', error);
    }
  };
  
  const handleReject = async (requesterId) => {
    try {
      await axiosInstance.post('/protected/decline_invite', { requester_id: requesterId });
      setInvites(invites.filter(invite => invite.requester_id !== requesterId));
      fetchReceivedInvites();
    } catch (error) {
      console.error('Failed to reject invite', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Requests</Text>
      <FlatList
        data={invites}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Image source={{ uri: item.profilePicture }} style={styles.profileImage} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.requester_display_name}</Text>
              <View style={styles.buttonContainer}>
                <Button title="Accept" onPress={() => handleAccept(item.requester_id)} />
                <Button title="Reject" onPress={() => handleReject(item.requester_id)} />
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

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