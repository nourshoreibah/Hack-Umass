import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-web-linear-gradient';



const BlueGradientBackground = ({ children }) => (
  <LinearGradient
    colors={['#0061ff', '#60efff']} // Adjust the colors as needed
    style={StyleSheet.absoluteFillObject}
    >
    {children}
  </LinearGradient>
);

export default BlueGradientBackground;