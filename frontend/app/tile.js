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
  const [isToggled, setIsToggled] = useState(false);

  const handlePress = () => {
    const newToggleState = !isToggled;
    setIsToggled(newToggleState);
    if (onPress) {
      onPress(newToggleState);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          borderWidth: isToggled ? 3 : 1, 
          borderColor: isToggled ? 'green' : '#ccc' 
        }
      ]}
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
      <Text style={[styles.toggleState, { color: isToggled ? 'green' : '#666' }]}>
        {isToggled ? 'Selected' : 'Not Selected'}
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
  toggleState: {
    marginTop: 4,
    fontSize: 12,
  }
});

export default Tile;
