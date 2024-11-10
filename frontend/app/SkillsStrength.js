// SkillsStrength.js
import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
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
            {selectedSkills.map(skill => (
                <SkillSlider
                    key={skill}
                    skill={skill}
                    value={skillRatings[skill]}
                    onValueChange={value => handleSliderChange(skill, value)}
                />
            ))}
            <Button 
                title="Submit" 
                onPress={handleSubmit}
                disabled={selectedSkills.length === 0}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default SkillsStrength;