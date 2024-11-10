import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { Link, router } from 'expo-router';
import { axiosInstance } from '../api/axiosInstance';
import LinearGradient from 'react-native-web-linear-gradient';


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
    <LinearGradient colors={['rgba(0, 97, 255, 0.6)', 'rgba(96, 239, 255, 0.5)']} style={styles.container}>
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
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,

  },
  title: {
    fontSize: 100, 
    fontWeight: 'bold',
    color: '#1C77C3',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: '#A6D9F7',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 6,
    letterSpacing: 3,
    borderColor: '#A6D9F7',
    borderWidth: 2,
    padding: 20,
    backgroundColor: '#FFFFFF', 
    borderRadius: 10,
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
