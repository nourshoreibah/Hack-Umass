// SkillsSelection.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import Tile from './tile';
import axiosInstance from '../api/axiosInstance';

const SkillsSelection = () => {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axiosInstance.get('/api/skills');
                setSkills(response.data.skills);
            } catch (error) {
                console.error('Failed to fetch skills:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSkills();
    }, []);

    const screenWidth = Dimensions.get('window').width;
    const numColumns = 3;
    const spacing = 10;
    const itemWidth = (screenWidth - (spacing * (numColumns + 1))) / numColumns;

    const renderItem = ({ item }) => (
        <View style={[styles.tileContainer, { width: itemWidth }]}>
            <Tile
                imageUrl={`https://via.placeholder.com/150?text=${item.skill_name}`}
                name={item.skill_name}
                size={itemWidth - spacing}
                onPress={(clicks) => console.log(`${item.skill_name} clicked ${clicks} times`)}
            />
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={skills}
                renderItem={renderItem}
                keyExtractor={item => item.skill_id.toString()}
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
        justifyContent: 'center',
    },
    grid: {
        padding: 10,
    },
    tileContainer: {
        padding: 5,
    }
});

export default SkillsSelection;


