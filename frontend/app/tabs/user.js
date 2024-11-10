import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import axiosInstance from '../../api/axiosInstance';
import { AuthContext } from '../../contexts/AuthContext';
import { Stack, useRouter } from 'expo-router';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/api/current_user');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  const CodingLanguage = {
    JAVASCRIPT: "JavaScript",
    PYTHON: "Python",
    JAVA: "Java",
    CSHARP: "C#",
    CCPP: "C/C++",
    PHP: "PHP",
    R: "R",
    TYPESCRIPT: "TypeScript",
    SWIFT: "Swift",
    GOLANG: "Go (Golang)",
    RUBY: "Ruby",
    MATLAB: "MATLAB",
    KOTLIN: "Kotlin",
    RUST: "Rust",
    PERL: "Perl",
    SCALA: "Scala",
    DART: "Dart",
    LUA: "Lua",
    OBJECTIVE_C: "Objective-C",
    SHELL: "Shell (Bash)"
  };

  // a function to change the router endpoint to the skills selection page
  const editSkills = () => {
    router.replace({
      pathname: '/tabs/SkillsSelection',
      params: { 
        languages: CodingLanguage
      }
    });
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
      <Text style={styles.userName}>{user.display_name}</Text>
      <Button title="Logout" onPress={logout} />
      <Button title="Edit Skills" onPress={editSkills} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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

export default UserPage;
