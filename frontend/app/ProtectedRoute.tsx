// ProtectedRoute.tsx
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { View, ActivityIndicator } from 'react-native';
import LoginPage from './LoginPage';

const ProtectedRoute: React.FC = ({ children }) => {
  const { isLoading, isAuthenticated } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <>{children}</> : <LoginPage />;
};

export default ProtectedRoute;