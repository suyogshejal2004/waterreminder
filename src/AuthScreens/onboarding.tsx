// Onboarding.js

import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';

import LottieView from 'lottie-react-native';

import LinearGradient from 'react-native-linear-gradient';

import Icon from 'react-native-vector-icons/Ionicons';

import { navigate } from '../Navigation/navigationutils';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',

    title: 'Welcome to AquaBuddy 💧',

    text: 'Easily track your daily water intake and reach your hydration goals.',

    animation: require('../../assets/animation/Track & Calculator.json'),

    colors: ['#A8E6CF', '#56CCF2', '#2F80ED'],
  },

  {
    key: '2',

    title: 'Stay Hydrated',

    text: 'Get smart reminders to drink water throughout your busy day.',

    animation: require('../../assets/animation/waterglass.json'),

    colors: ['#DCEDC2', '#6EE7B7', '#3B82F6'],
  },

  {
    key: '3',

    title: 'Build Healthy Habits',

    text: 'Turn hydration into a daily habit and unlock a healthier you!',

    animation: require('../../assets/animation/Walkinganddrinking.json'),

    colors: ['#FFD3B6', '#FF9A8B', '#FF6A88'],
  },
];

const Onboarding = () => {
  /** --- Custom Button Components --- */

  const renderNextButton = () => (
    <LinearGradient colors={['#0D47A1', '#1976D2']} style={styles.buttonCircle}>
      <Icon name="arrow-forward-outline" color="#fff" size={24} />
    </LinearGradient>
  );

 const renderDoneButton = () => (
    <LinearGradient colors={['#2E7D32', '#66BB6A']} style={styles.buttonCircle}>
      <Icon name="checkmark-outline" color="#fff" size={24} />
    </LinearGradient>
  );   const renderSkipButton = () => (
    <LinearGradient colors={['#ff6a00', '#ee0979']} style={styles.buttonCircle}>
      <Icon name="play-skip-forward-outline" color="#fff" size={24} />
    </LinearGradient>
  );

  /** --- Slide Rendering --- */

  const renderItem = ({ item }) => (
    <LinearGradient colors={item.colors} style={styles.gradient}>
      <SafeAreaView style={styles.slide}>
        <LottieView
          source={item.animation}
          autoPlay
          loop
          style={styles.lottie}
        />

        {/* Glass Card */}

        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>

          <Text style={styles.text}>{item.text}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const onDone = () => navigate('Login');

  const onSkip = () => navigate('Login');

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={onDone}
      onSkip={onSkip}
      showSkipButton
      // Custom beautiful buttons

      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      renderSkipButton={renderSkipButton}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    />
  );
};

export default Onboarding;

/** --- Enhanced Modern Styles --- */

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  slide: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'flex-start',

    paddingTop: height * 0.08,
  },

  lottie: {
    width: width * 0.85,

    height: width * 0.85,

    marginBottom: 24,
  },

  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',

    borderRadius: 24,

    paddingVertical: 28,

    paddingHorizontal: 22,

    width: width * 0.9,

    alignItems: 'center',

    shadowColor: '#111',

    shadowOpacity: 0.15,

    shadowRadius: 6,

    shadowOffset: { width: 0, height: 3 },

    elevation: 6,
  },

  title: {
    fontSize: 26,

    fontWeight: 'bold',

    color: '#0D47A1',

    textAlign: 'center',

    marginBottom: 12,

    letterSpacing: 0.5,
  },

  text: {
    fontSize: 17,

    color: '#444',

    textAlign: 'center',

    lineHeight: 25,
  },

  /** --- Buttons --- */

  buttonGradient: {
    paddingHorizontal: 18,

    paddingVertical: 10,

    borderRadius: 25,

    minWidth: 95,

    justifyContent: 'center',

    alignItems: 'center',

    marginHorizontal: 6,

    elevation: 4,
  },

  buttonContent: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',

    fontWeight: '600',

    marginRight: 6,

    fontSize: 15,
  },

  dot: {
    backgroundColor: 'rgba(255,255,255,0.4)',

    width: 9,

    height: 9,

    borderRadius: 5,

    marginHorizontal: 4,
  },
  buttonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  activeDot: {
    backgroundColor: '#fff',

    width: 24,

    height: 9,

    borderRadius: 5,

    marginHorizontal: 4,
  },
});