// HeaderComponent.js

import { StyleSheet, Text, View, SafeAreaView, Animated, Easing } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useRef, useState } from 'react';

const HeaderComponent = () => {
  const [userData, setUserData] = useState(null);
  const [greeting, setGreeting] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  // Main useEffect for animations and fetching data
  useEffect(() => {
    // --- Animations and Greeting Logic ---
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning ☀️');
    else if (hours < 18) setGreeting('Good Afternoon 🌤️');
    else setGreeting('Good Evening 🌙');

    // --- Firebase Listener for User Data ---
    const user = auth().currentUser;
    if (!user) {
        setUserData(null); // No user, set data to null
        return;
    }

    const userRef = firestore().collection('users').doc(user.uid);

    // This listener will handle real-time updates for the user's profile
    const subscriber = userRef.onSnapshot(docSnapshot => {
      if (docSnapshot.exists) {
        console.log('User data fetched:', docSnapshot.data());
        setUserData(docSnapshot.data());
      } else {
        console.log('User document does not exist yet.');
        // The document will be created by another screen (e.g., UserDetails)
        // We can set some temporary data here if needed
        setUserData({ name: user.displayName || 'User' });
      }
    });

    // Unsubscribe from the listener on cleanup
    return () => subscriber();
  }, []); // This effect runs once on mount

  const getInitials = (name) => {
    if (!name) return '?';
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0] : '';
    const lastInitial = nameParts.length > 1 ? nameParts[1][0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.headerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.leftContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userData?.name)}</Text>
          </View>
          <View>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.nameText}>
              {userData?.name ? userData.name.split(' ')[0] : 'User'}
            </Text>
          </View>
        </View>
        <Text style={styles.dateText}>{currentDate}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HeaderComponent;

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7F9FC' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#CBD5E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  leftContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3182CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  greetingText: { fontSize: 16, fontWeight: '600', color: '#718096' },
  nameText: { fontSize: 22, fontWeight: '800', color: '#1A202C', marginTop: 2 },
  // Removed the waterText style as it's no longer used
  dateText: { fontSize: 14, fontWeight: '600', color: '#4A5568', alignSelf: 'flex-start' },
});
