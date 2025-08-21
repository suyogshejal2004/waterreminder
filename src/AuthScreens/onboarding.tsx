// onboarding.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import LottieView from 'lottie-react-native';
import { replace } from '../Navigation/navigationutils';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to AquaBuddy 💧',
    text: 'Track your daily water intake easily!',
    animation: require('../../assets/animation/Track & Calculator.json'),
    backgroundColor: '#A8E6CF',
  },
  {
    key: '2',
    title: 'Stay Hydrated',
    text: 'We remind you to drink water throughout the day.',
    animation: require('../../assets/animation/waterglass.json'),
    backgroundColor: '#DCEDC2',
  },
  {
    key: '3',
    title: 'Healthy Habit',
    text: 'Build a daily water drinking habit and stay healthy!',
    animation: require('../../assets/animation/Walkinganddrinking.json'),
    backgroundColor: '#FFD3B6',
  },
];

const Onboarding = () => {

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <LottieView
        source={item.animation}
        autoPlay
        loop
        
        style={{ width: width * 0.7, height: width * 0.7 ,}}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  const onDone = () => {
   replace('Login'); // Navigate to Login screen
  };

  const onSkip = () => {
 replace('Login');  // Navigate to Login on skip
  };

  return (
    <AppIntroSlider
      renderItem={renderItem}
      data={slides}
      onDone={onDone}
      showSkipButton
      onSkip={onSkip}
      activeDotStyle={{ backgroundColor: '#0277BD', width: 25 }}
    />
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0277BD',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
});