

// SkillsSelection.js
import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import Tile from '../tile';


// SkillsSelection.js
const SkillsSelection = () => {
    // Convert passed languages object to array
  
    // Rest of the component remains the same, just use languagesList instead of hardcoded data
    const screenWidth = Dimensions.get('window').width;
    const numColumns = 3;
    const spacing = 10;
    const itemWidth = (screenWidth - (spacing * (numColumns + 1))) / numColumns;
  
    const renderItem = ({ item }) => (
      <View style={[styles.tileContainer, { width: itemWidth }]}>
        <Tile
          imageUrl={`https://via.placeholder.com/150?text=${item.name}`}
          name={item.name}
          size={itemWidth - spacing}
          onPress={(clicks) => console.log(`${item.name} clicked ${clicks} times`)}
        />
      </View>
    );
  
    return (
      <View style={styles.container}>
        <FlatList
          // data={languagesList}
          data={null}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  grid: {
    padding: 10,
  },
  tileContainer: {
    padding: 5,
  }
});

export default SkillsSelection;


