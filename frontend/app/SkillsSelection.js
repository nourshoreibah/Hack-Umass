// SkillsSelection.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions, ActivityIndicator, Text, Button, Platform } from 'react-native';
import Tile from './tile';
import axiosInstance from '../api/axiosInstance';
import { useNavigation, useRoute } from '@react-navigation/native';

const SkillsSelection = ({ title, onSubmit }) => {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { nextScreen } = route.params || {};

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
    const numColumns = Platform.OS === 'web' ? 5 : 3;
    const spacing = 10;
    const itemWidth = (screenWidth - (spacing * (numColumns + 1))) / numColumns;

    const handleTilePress = (skillName, isSelected) => {
        setSelectedSkills(prevSelectedSkills => {
            if (isSelected) {
                return [...prevSelectedSkills, skillName];
            } else {
                return prevSelectedSkills.filter(skill => skill !== skillName);
            }
        });
    };

    const renderItem = ({ item }) => (
        <View style={[styles.tileContainer, { width: itemWidth }]}>
            <Tile
                imageUrl={`https://via.placeholder.com/150?text=${item.skill_name}`}
                name={item.skill_name}
                size={itemWidth - spacing}
                onPress={(isSelected) => handleTilePress(item.skill_name, isSelected)}
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

    const handleNextPress = () => {
        onSubmit(selectedSkills);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
                data={skills}
                renderItem={renderItem}
                keyExtractor={item => item.skill_id.toString()}
                numColumns={numColumns}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={true}
            />
            <Button
                title="Next"
                onPress={handleNextPress}
                disabled={selectedSkills.length === 0}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    grid: {
        padding: 10,
    },
    tileContainer: {
        padding: 5,
    }
});

export default SkillsSelection;