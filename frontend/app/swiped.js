import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button } from 'react-native';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../contexts/AuthContext';


export const SwipedPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchSwipedUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/outgoing_requests');
        setUsers(response.data.requests); // Access the 'requests' array from the response
      } catch (error) {
        console.error('Failed to fetch swiped users', error);
      }
    };

    fetchSwipedUsers();
  }, []);

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

  useEffect(() => {
    const fetchReceivedInvites = async () => {
      try {
        const response = await axiosInstance.get('/api/incoming_requests');
        setInvites(response.data.requests);
      } catch (error) {
        console.error('Failed to fetch received invites', error);
      }
    };

    fetchReceivedInvites();
  }, []);

  const handleAccept = async (inviteId) => {
    try {
      await axiosInstance.post(`/accept_invite/${inviteId}`);
      setInvites(invites.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error('Failed to accept invite', error);
    }
  };

  const handleReject = async (inviteId) => {
    try {
      await axiosInstance.post(`/reject_invite/${inviteId}`);
      setInvites(invites.filter(invite => invite.id !== inviteId));
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
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userAttribute}>Email: {item.email}</Text>
              <Text style={styles.userAttribute}>Phone: {item.phone}</Text>
              <Text style={styles.userAttribute}>Address: {item.address}</Text>
              <View style={styles.buttonContainer}>
                <Button title="Accept" onPress={() => handleAccept(item.id)} />
                <Button title="Reject" onPress={() => handleReject(item.id)} />
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