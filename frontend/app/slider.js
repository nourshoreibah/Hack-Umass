// slider.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const SkillSlider = ({ skill, value, onValueChange }) => {
    return (
        <View style={styles.skillContainer}>
            <Text style={styles.skillName}>{skill}</Text>
            <View style={styles.sliderContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={3}
                    step={1}
                    value={value}
                    onValueChange={onValueChange}
                />
                <View style={styles.notchesContainer}>
                    {[0, 1, 2, 3].map((notch) => (
                        <View key={notch} style={styles.notch} />
                    ))}
                </View>
            </View>
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
    sliderContainer: {
        position: 'relative',
        width: '100%',
        height: 40,
        justifyContent: 'center',
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
    notchesContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        transform: [{ translateY: -10 }],
    },
    notch: {
        width: 2,
        height: 10,
        backgroundColor: '#000',
    },
});

export default SkillSlider;