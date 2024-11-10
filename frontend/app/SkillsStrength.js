// SkillsStrength.js
import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import axiosInstance from '../api/axiosInstance';
import { useNavigation, useRoute } from '@react-navigation/native';
import SkillSlider from './slider';

const SkillsStrength = () => {
    const route = useRoute();
    const { selectedSkills } = route.params;
    const [skillRatings, setSkillRatings] = useState(
        selectedSkills.reduce((acc, skill) => {
            acc[skill] = 0;
            return acc;
        }, {})
    );
    const navigation = useNavigation();

    const handleSliderChange = (skill, value) => {
        setSkillRatings(prevRatings => ({
            ...prevRatings,
            [skill]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            await axiosInstance.post('/api/submit_skill_ratings', { skillRatings });
            navigation.navigate('NextComponent');
        } catch (error) {
            console.error('Failed to submit skill ratings:', error);
        }
    };

    return (
        <View style={styles.container}>
            {selectedSkills.map(skill => (
                <SkillSlider
                    key={skill}
                    skill={skill}
                    value={skillRatings[skill]}
                    onValueChange={value => handleSliderChange(skill, value)}
                />
            ))}
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
});

export default SkillsStrength;