// SkillsFlow.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axiosInstance from '../api/axiosInstance';
import SkillsSelection from './SkillsSelection';
import SkillsStrength from './SkillsStrength';

const SkillsFlow = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [learningSkills, setLearningSkills] = useState([]);
    const [learningRatings, setLearningRatings] = useState({});
    const [teachingSkills, setTeachingSkills] = useState([]);
    const [teachingRatings, setTeachingRatings] = useState({});
    const router = useRouter();

    const handleLearningSkillsSelected = (skills) => {
        setLearningSkills(skills);
        setCurrentStep(2);
    };

    const handleLearningRatingsSubmitted = async (ratings) => {
        setLearningRatings(ratings);
        setCurrentStep(3);
        try {
            await axiosInstance.post('/api/submit_learning_skills', { 
                user_id: user_id,
                skillRating: {
                    skills: learningSkills,
                    ratings: ratings
                }
            });
        } catch (error) {
            console.error('Failed to submit learning skills:', error);
        }
    };

    const handleTeachingSkillsSelected = (skills) => {
        setTeachingSkills(skills);
        setCurrentStep(4);
    };

    const handleTeachingRatingsSubmitted = async (ratings) => {
        setTeachingRatings(ratings);
        try {
            await axiosInstance.post('/api/submit_teaching_skills', { 
                user_id: user_id,
                skillRating: {
                    skills: teachingSkills, // of type int, going from 0-3. 0 is not a skill at all ignore. 
                    // 1 is beginner, 2 is intermediate, 3 is expert (to convert to Fluency Level)
                    ratings: ratings // of type int, 1-5 
                }
            });
            router.replace('/tabs/user');
        } catch (error) {
            console.error('Failed to submit teaching skills:', error);
        }
    };

    switch (currentStep) {
        case 1:
            return (
                <SkillsSelection
                    title="Skills You Want Help With"
                    onSubmit={handleLearningSkillsSelected}
                />
            );
        case 2:
            return (
                <SkillsStrength
                    title="Rate Your Current Level"
                    selectedSkills={learningSkills}
                    onSubmit={handleLearningRatingsSubmitted}
                />
            );
        case 3:
            return (
                <SkillsSelection
                    title="Skills You Can Help With"
                    onSubmit={handleTeachingSkillsSelected}
                />
            );
        case 4:
            return (
                <SkillsStrength
                    title="Rate Your Teaching Level"
                    selectedSkills={teachingSkills}
                    onSubmit={handleTeachingRatingsSubmitted}
                />
            );
        default:
            return null;
    }
};

export default SkillsFlow;