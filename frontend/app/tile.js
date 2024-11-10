
// tile.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const Tile = ({ 
  imageUrl, 
  name, 
  size = 150, 
  onPress,
  testID = 'tile-button'
}) => {
  const [clickCount, setClickCount] = useState(0);

  const handlePress = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (onPress) {
      onPress(newCount);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={[styles.container, { width: size, height: size }]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${name} tile`}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.clickCount}>
        Clicks: {clickCount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '80%',
    height: '60%',
    borderRadius: 8,
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  clickCount: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  }
});

export default Tile;
