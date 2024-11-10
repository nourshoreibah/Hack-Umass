// tile.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const Tile = ({ imageSource, ...props }) => {
  const { 
    name, 
    size = 150, 
    onPress,
    testID = 'tile-button'
  } = props;
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
        source={imageSource || require('../assets/skillicons/placeholder.png')}
        style={{ width: size * 0.7, height: size * 0.7 }}
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
