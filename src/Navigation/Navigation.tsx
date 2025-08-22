// Navigation.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // ✅ IMPORT FIRESTORE

// Import all your screens
import SplashScreen from '../AuthScreens/Splashscreen';
import onboarding from '../AuthScreens/onboarding';
import LoginScreen from '../AuthScreens/LoginScreen';
import RegisterScreen from '../AuthScreens/RegisterScreen';
import UserDetails from '../AuthScreens/UserDetails';
import Forgotpass from '../AuthScreens/Forgotpass';
import HomeScreen from '../Home/HomeScreen';
import { navigationRef } from './navigationutils';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  // State to track if Firebase is checking the user's login status
  const [initializing, setInitializing] = useState(true);
  // State to hold the user object
  const [user, setUser] = useState(null);
  // ✅ NEW STATE: To track if user details exist in Firestore
  const [userDetailsExist, setUserDetailsExist] = useState(false);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async userState => {
      setUser(userState);

      // ✅ NEW LOGIC: If user is logged in, check for their details in Firestore
      if (userState) {
        try {
          const userDoc = await firestore().collection('users').doc(userState.uid).get();
          // We check for 'name' because the registration screen creates a doc without it.
          // A non-empty 'name' means the user has filled out their details.
          if (userDoc.exists && userDoc.data()?.name) {
            setUserDetailsExist(true);
          } else {
            setUserDetailsExist(false);
          }
        } catch (error) {
          console.error("Failed to fetch user details from Firestore:", error);
          setUserDetailsExist(false);
        }
      }

      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber; // Unsubscribe on cleanup
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }
  
  // ✅ REVISED LOGIC: Determine the correct starting screen
  let initialRouteName = 'splash';
  if (user) {
    // If user is logged in, decide between HomeScreen and UserDetails
    initialRouteName = userDetailsExist ? 'HomeScreen' : 'UserDetails';
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {/* We now define all screens at once and use `initialRouteName` to pick the starting point.
        This is a more robust approach than conditionally rendering screens.
      */}
      <Stack.Navigator 
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        {/* Screens available when the user is LOGGED OUT */}
        <Stack.Screen name="splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={onboarding} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Forgot" component={Forgotpass} />

        {/* Screens available when the user is LOGGED IN */}
        <Stack.Screen name="UserDetails" component={UserDetails} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
});

export default Navigation;