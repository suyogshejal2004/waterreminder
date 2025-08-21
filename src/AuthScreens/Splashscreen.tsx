// Splashscreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound';
import LinearGradient from 'react-native-linear-gradient';
import { replace } from '../Navigation/navigationutils'; // import replace function
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

Sound.setCategory('Playback');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // scale effect
  const lottieRef = useRef(null);

  const playSound = useCallback(() => {
    return new Promise((resolve) => {
      const whoosh = new Sound('whoosh.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error('Failed to load audio:', error);
          resolve();
          return;
        }
        whoosh.play((success) => {
          if (!success) console.error('Audio playback failed.');
          whoosh.release();
          resolve();
        });
      });
    });
  }, []);

  useEffect(() => {
    const runSplash = async () => {
      if (lottieRef.current) lottieRef.current.play();

      // Animate scale while splash is running
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();

      await playSound();

      let routeName = 'Onboarding';
      const user = auth().currentUser;

      if (user) {
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists && userDoc.data().height && userDoc.data().weight && userDoc.data().age) {
            routeName = 'HomeScreen';
          } else {
            routeName = 'UserDetails';
          }
        } catch (error) {
          console.error('Error checking user details:', error);
          routeName = 'UserDetails';
        }
      }

      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        // Navigate to appropriate screen
        replace(routeName);
      });
    };

    runSplash();
  }, [fadeAnim, scaleAnim, playSound]);

  const { width } = Dimensions.get('window');

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#A8E6CF', '#DCEDC2']}
        style={styles.gradientBackground}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
          <LottieView
            ref={lottieRef}
            source={require('../../assets/animation/waterglass.json')}
            autoPlay
            loop={false}
            speed={0.3}
            style={{ width: Math.min(width * 0.6, 300), height: Math.min(width * 0.6, 300) }}
          />
          <Text style={styles.appName}>AquaBuddy 💧</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '700',
    color: '#0277BD',
    letterSpacing: 1,
  },
});

export default SplashScreen;