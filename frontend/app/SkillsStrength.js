// SkillsStrength.js
import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, ScrollView } from 'react-native';
import axiosInstance from '../api/axiosInstance';
import { useNavigation, useRoute } from '@react-navigation/native';
import SkillSlider from './slider';

const SkillsStrength = ({ title, selectedSkills, onSubmit }) => {
    const [skillRatings, setSkillRatings] = useState(
        selectedSkills.reduce((acc, skill) => {
            acc[skill] = 0;
            return acc;
        }, {})
    );

    const handleSliderChange = (skill, value) => {
        setSkillRatings(prevRatings => ({
            ...prevRatings,
            [skill]: value
        }));
    };

    const handleSubmit = () => {
        onSubmit(skillRatings);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                {selectedSkills.map(skill => (
                    <SkillSlider
                        key={skill}
                        skill={skill}
                        value={skillRatings[skill]}
                        onValueChange={value => handleSliderChange(skill, value)}
                    />
                ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <Button 
                    title="Submit" 
                    onPress={handleSubmit}
                    disabled={selectedSkills.length === 0}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        textAlign: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    buttonContainer: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    }
});

export default SkillsStrength;