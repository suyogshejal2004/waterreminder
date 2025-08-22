// HeaderComponent.js

import { StyleSheet, Text, View, SafeAreaView, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useRef, useState } from 'react';

const HeaderComponent = () => {
  const [userData, setUserData] = useState(null);
  const [greeting, setGreeting] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // --- Fade + Slide Animation ---
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // --- Wave Animation Loop ---
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Greeting logic
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning ☀️');
    else if (hours < 18) setGreeting('Good Afternoon 🌤️');
    else setGreeting('Good Evening 🌙');

    // Firebase user listener
    const user = auth().currentUser;
    if (!user) {
      setUserData(null);
      return;
    }

    const userRef = firestore().collection('users').doc(user.uid);
    const subscriber = userRef.onSnapshot(docSnapshot => {
      if (docSnapshot?.exists) {
        setUserData(docSnapshot.data());
      } else {
        setUserData({ name: user.displayName || 'User' });
      }
    });

    return () => subscriber();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return `${parts[0][0] || ''}${parts[1] ? parts[1][0] : ''}`.toUpperCase();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#3182CE', '#63B3ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.headerContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.leftContainer}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(userData?.name)}</Text>
            </View>

            {/* Greeting + Name */}
            <View>
              <Text style={styles.greetingText}>{greeting}</Text>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>
                  {userData?.name ? userData.name.split(' ')[0] : 'User'}
                </Text>
                <Animated.View
                  style={[
                    styles.wave,
                    { transform: [{ translateY: waveAnim }] },
                  ]}
                >
                  <Text style={styles.waveText}>~</Text>
                </Animated.View>
              </View>
            </View>
          </View>

          {/* Date badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HeaderComponent;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7F9FC',
  },
  gradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C5282',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  wave: {
    marginLeft: 6,
  },
  waveText: {
    fontSize: 22,
    color: '#90CDF4',
    fontWeight: 'bold',
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
