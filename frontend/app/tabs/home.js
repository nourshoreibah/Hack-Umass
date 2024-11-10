import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Platform,
  Animated,
  TouchableOpacity 
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';

const { width, height } = Dimensions.get('window');

const HomePage = () => {
  const swiperRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [noMoreUsers, setNoMoreUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/compatible_users');
        setUsers(response.data.users || []);
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
        return () => window.removeEventListener('keydown', handleKeyDown);
      }
    }, [])
  );

  const renderCard = (user) => (
    user ? (
      <View style={styles.card}>
        <View style={[styles.headerContainer, styles.absoluteCenter]}>
          <View style={styles.nameContainer}>
            <Text style={styles.userName} numberOfLines={1}>{user.display_name}</Text>
            <Text style={styles.userTitle} numberOfLines={1}>{user.title || 'Professional'}</Text>
          </View>
  
          <View style={styles.contentContainer}>
            {user.matching_skills && user.matching_skills.length > 0 ? (
              <View style={styles.skillsContainer}>
                <Text style={styles.skillsTitle}>Matching Skills</Text>
                <View style={styles.skillsGrid}>
                  {user.matching_skills.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillName} numberOfLines={1}>{skill.skill_name}</Text>
                      <Text style={styles.skillLevel} numberOfLines={1}>{skill.fluency_level}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.noSkillsText}>No matching skills</Text>
            )}
          </View>
        </View>
  
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.skipButton]}
            onPress={() => swiperRef.current.swipeLeft()}
          >
            <Text style={styles.actionButtonText}>✕</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            style={[styles.actionButton, styles.connectButton]}
            onPress={() => swiperRef.current.swipeRight()}
          >
            <Text style={styles.actionButtonText}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : null
  );

  const onSwipedRight = async (cardIndex) => {
    const user = users[cardIndex];
    try {
      await axiosInstance.post('/api/make_request', {
        requested_id: user.user_id,
      });
      console.log(`Invite sent to user ID: ${user.user_id}`);
    } catch (error) {
      console.error('Failed to send invite', error);
    }
  };

  const onSwipedLeft = (cardIndex) => {
    if (users[cardIndex]) {
      users.push(users[cardIndex]);
    }
  };

  const onSwiped = (cardIndex) => {
    console.log('User swiped: ', users[cardIndex]);
  };

  const onSwipedAll = () => {
    console.log('All users swiped');
    setNoMoreUsers(true);
  };

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>No More Matches</Text>
      <Text style={styles.emptyStateText}>
        We're looking for more people with matching skills.
        Check back later!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {users.length > 0 ? (
        <Swiper
          ref={swiperRef}
          cards={users}
          renderCard={renderCard}
          onSwipedRight={onSwipedRight}
          onSwipedLeft={onSwipedLeft}
          onSwiped={onSwiped}
          onSwipedAll={onSwipedAll}
          cardIndex={0}
          backgroundColor="#f8fafc"
          stackSize={3}
          stackScale={6}
          stackSeparation={10}
          animateCardOpacity
          cardVerticalMargin={20}
          cardHorizontalMargin={8}
          overlayLabels={{
            left: {
              title: 'SKIP',
              style: {
                label: {
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontSize: 14,
                  borderRadius: 6,
                  padding: 6
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: -20
                }
              }
            },
            right: {
              title: 'CONNECT',
              style: {
                label: {
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontSize: 14,
                  borderRadius: 6,
                  padding: 6
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: 20
                }
              }
            }
          }}
        />
      ) : (
        <EmptyState />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    width: width * 0.75,
    height: height * 0.6,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  absoluteCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerContainer: {
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
  nameContainer: {
    marginBottom: 4,
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  userTitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  skillsContainer: {
    alignItems: 'center',
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 10,
    textAlign: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
  },
  skillBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  skillName: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  skillLevel: {
    color: '#3b82f6',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  noSkillsText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 16,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skipButton: {
    backgroundColor: '#dc2626',
  },
  connectButton: {
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomePage;