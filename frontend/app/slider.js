// slider.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const SkillSlider = ({ skill, value, onValueChange }) => {
    const [sliderValue, setSliderValue] = useState(value);
    const translateX = useSharedValue(value * 100); // Adjust for each step

    useEffect(() => {
        translateX.value = withTiming(sliderValue * 100, { duration: 300 });
    }, [sliderValue]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${sliderValue * 33.33}%`,
        backgroundColor: '#007bff',
    }));

    const handleSliderChange = (val) => {
        const newVal = Math.round(val);
        setSliderValue(newVal);
        onValueChange(newVal);
    };

    return (
        <View style={styles.skillContainer}>
            <Text style={styles.skillName}>{skill}</Text>
            <View style={styles.sliderWrapper}>
                <Animated.View style={[styles.progress, animatedStyle]} />
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={3}
                    step={1}
                    value={sliderValue}
                    onValueChange={handleSliderChange}
                    thumbTintColor="#007bff"
                    minimumTrackTintColor="transparent"
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
    sliderWrapper: {
        position: 'relative',
        width: '100%',
        height: 40,
        justifyContent: 'center',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    progress: {
        position: 'absolute',
        height: 6,
        top: '50%',
        left: 0,
        borderRadius: 4,
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
