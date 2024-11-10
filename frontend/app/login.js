import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { Link, router } from 'expo-router';
import { axiosInstance } from '../api/axiosInstance';
import { skillImages } from './skillImages';


const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      // Check current user data
      const response = await axiosInstance.get('/api/current_user');
      const userData = response.data;
      
      if (!userData.has_logged_in) {
        await axiosInstance.post('/api/has_logged_in');
        router.replace('/SkillsSelection');
      } else {
        router.replace('/tabs');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };
  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>DevTrade</Text>
      
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={[styles.input, error && styles.inputError]}
        keyboardType="email-address"
        editable={!isLoading}
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, error && styles.inputError]}
        editable={!isLoading}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <TouchableOpacity 
          style={[styles.button, (!email || !password) && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!email || !password}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.footerText}>
        Don't have an account? <Link href="/register" style={styles.link}>Register</Link>
      </Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 100, // Extra-large font size for strong visual impact
    fontWeight: 'bold',
    color: '#1C77C3', // Bright, vibrant blue for the main color
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: '#A6D9F7', // Lighter blue shadow color for a softer contrast
    textShadowOffset: { width: 4, height: 4 }, // Slightly smaller shadow for a subtle depth effect
    textShadowRadius: 6,
    letterSpacing: 3, // Wider spacing for added grandeur
    borderColor: '#A6D9F7', // Light blue outline to complement the main color
    borderWidth: 2, // Outline width for emphasis without overpowering
    padding: 20, // Extra padding to balance the large font size
    backgroundColor: '#FFFFFF', // Light background to make colors pop
    borderRadius: 10, // Rounded edges for a polished look
},


  input: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

