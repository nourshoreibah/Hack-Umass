// slider.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const SkillSlider = ({ skill, value, onValueChange }) => {
    return (
        <View style={styles.skillContainer}>
            <Text style={styles.skillName}>{skill}</Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={3}
                step={1}
                value={value}
                onValueChange={onValueChange}
            />
            <View style={styles.sliderLabels}>
                <Text>None</Text>
                <Text>Advanced</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    skillContainer: {
        marginBottom: 20,
    },
    skillName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

export default SkillSlider;