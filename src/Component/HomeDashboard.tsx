// components/HomeDashboard.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert, // Added Alert for consistency
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// --- Water intake options ---
const waterOptions = [
  { icon: '💧', amount: 250, label: 'Glass' },
  { icon: '🥤', amount: 350, label: 'Cup' },
  { icon: '🫙', amount: 500, label: 'Bottle' },
  { icon: '➕', amount: 'custom', label: 'Custom' },
];

// --- Bubble Animation Component ---
const Bubble = ({ size, x, duration }) => {
  const animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [animation, duration]);
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -200],
  });
  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 0],
  });
  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          left: x,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

// --- Main All-in-One Dashboard Component ---
const HomeDashboard = () => {
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [dailyNeed, setDailyNeed] = useState(2000);
  const [consumed, setConsumed] = useState(0);
  const [intakeHistory, setIntakeHistory] = useState([]);

  // UI State
  const [bubbles, setBubbles] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [editingIntake, setEditingIntake] = useState(null);

  // Animation Refs
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;

  // --- Helper Functions ---
  const calculateWaterNeed = (weight, gender) => {
    const numWeight = Number(weight);
    if (!numWeight || isNaN(numWeight)) return 2000;
    let base = numWeight * 35;
    if (gender?.toLowerCase() === 'male') base += 250;
    return Math.round(base);
  };

  const getInitials = name => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.split(' ');
    return `${parts[0][0] || ''}${
      parts.length > 1 ? parts[1]?.[0] || '' : ''
    }`.toUpperCase();
  };

  // --- Firebase Logic ---
  useEffect(() => {
    console.log('Setting up Firebase listeners...');
    const user = auth().currentUser;

    if (!user) {
      console.log('No user found. Stopping listeners.');
      setLoading(false);
      return;
    }

    console.log(`User detected: ${user.uid}`);
    const userRef = firestore().collection('users').doc(user.uid);

    // Listener for user profile data (name, weight, etc.)
    const userSubscriber = userRef.onSnapshot(
      docSnapshot => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          console.log('✅ User profile data received:', data);
          // ✅ NULL CHECK: Ensure data object exists and provide defaults
          const safeData = {
            name: user.displayName || 'User',
            weight: 70, // Default weight
            gender: 'male', // Default gender
            ...data,
          };
          setUserData(safeData);
          setDailyNeed(calculateWaterNeed(safeData.weight, safeData.gender));
        } else {
          console.warn(
            'User document does not exist. This should have been created on sign-up.',
          );
          userRef.set({
            name: user.displayName || 'User',
            email: user.email,
            weight: 70,
            gender: 'male',
          });
        }
      },
      error => {
        console.error('❌ Error fetching user profile:', error);
      },
    );

    // Listener for today's water history
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const historySubscriber = userRef
      .collection('waterHistory')
      .where('timestamp', '>=', todayStart)
      .onSnapshot(
        querySnapshot => {
          let totalConsumedToday = 0;
          const historyEntries = [];
          querySnapshot.forEach(doc => {
            const entry = { id: doc.id, ...doc.data() };
            // ✅ NULL CHECK: Ensure entry has a valid amount before adding
            if (entry.amount && !isNaN(Number(entry.amount))) {
              historyEntries.push(entry);
              totalConsumedToday += entry.amount;
            }
          });
          console.log(
            `✅ Water history updated. Found ${querySnapshot.size} entries. Total consumed: ${totalConsumedToday}ml`,
          );
          setConsumed(totalConsumedToday);
          setIntakeHistory(historyEntries);
          if (loading) setLoading(false); // Stop loading once we have data
        },
        error => {
          console.error('❌ Error fetching water history:', error);
          if (loading) setLoading(false);
        },
      );

    // Unsubscribe from listeners on cleanup
    return () => {
      console.log('Cleaning up Firebase listeners.');
      userSubscriber();
      historySubscriber();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Animation & UI Effects ---
  useEffect(() => {
    // Animate header and greeting
    Animated.parallel([
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning ☀️');
    else if (hours < 18) setGreeting('Good Afternoon 🌤️');
    else setGreeting('Good Evening 🌙');
  }, []);

  useEffect(() => {
    // Animate the glass filling up
    const progress = dailyNeed > 0 ? consumed / dailyNeed : 0;
    Animated.timing(fillAnimation, {
      toValue: progress > 1 ? 1 : progress,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [consumed, dailyNeed, fillAnimation]);

  // --- Data Manipulation Handlers ---
  const addBubbleAnimation = () => {
    const id = Date.now() + Math.random();
    setBubbles(b => [
      ...b,
      {
        id,
        size: Math.random() * 15 + 5,
        x: Math.random() * 160 + 20,
        duration: Math.random() * 2000 + 1500,
      },
    ]);
    setTimeout(
      () => setBubbles(b => b.filter(bubble => bubble.id !== id)),
      3500,
    );
  };

  const handleAddWater = async amount => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add water.');
      return;
    }
    for (let i = 0; i < 5; i++) {
      setTimeout(addBubbleAnimation, i * 100);
    }

    console.log(`Attempting to add ${amount}ml to Firestore...`);
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('waterHistory')
        .add({
          amount: Number(amount),
          timestamp: new Date(),
        });
      console.log('✅ Successfully added water entry.');
    } catch (e) {
      console.error('❌ Firestore Write Error:', e);
      Alert.alert(
        'Save Failed',
        'Could not save your progress. Please check your connection and Firestore rules.',
      );
    }
  };

  const handleEditIntake = async (intakeId, newAmount) => {
    const user = auth().currentUser;
    if (!user || !intakeId) return;
    console.log(`Attempting to edit entry ${intakeId} to ${newAmount}ml...`);
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('waterHistory')
        .doc(intakeId)
        .update({
          amount: Number(newAmount),
        });
      console.log('✅ Successfully edited entry.');
    } catch (e) {
      console.error('❌ Firestore Update Error:', e);
      Alert.alert('Update Failed', 'Could not update the entry.');
    }
  };

  const handleDeleteIntake = async intakeId => {
    const user = auth().currentUser;
    if (!user || !intakeId) return;
    console.log(`Attempting to delete entry ${intakeId}...`);
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('waterHistory')
        .doc(intakeId)
        .delete();
      console.log('✅ Successfully deleted entry.');
    } catch (e) {
      console.error('❌ Firestore Delete Error:', e);
      Alert.alert('Delete Failed', 'Could not delete the entry.');
    }
  };

  const handleUndo = () => {
    if (intakeHistory.length > 0) {
      // ✅ NULL CHECK: Safely sort array even if a timestamp is missing
      const sortedHistory = [...intakeHistory].sort((a, b) => {
        const timeA = a.timestamp?.toDate()?.getTime() || 0;
        const timeB = b.timestamp?.toDate()?.getTime() || 0;
        return timeB - timeA;
      });
      const lastEntryId = sortedHistory[0]?.id; // Use optional chaining
      if (lastEntryId) {
        handleDeleteIntake(lastEntryId);
      }
    }
  };

  // --- Modal Handlers ---
  const openAddModal = () => {
    setEditingIntake(null);
    setCustomAmount('');
    setModalVisible(true);
  };
  const openEditModal = item => {
    setEditingIntake(item);
    setCustomAmount(String(item.amount));
    setModalVisible(true);
  };
  const handleSaveCustomAmount = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      if (editingIntake) {
        handleEditIntake(editingIntake.id, amount);
      } else {
        handleAddWater(amount);
      }
      setModalVisible(false);
    } else {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
    }
  };
  const handleOptionPress = amount => {
    if (amount === 'custom') {
      openAddModal();
    } else {
      handleAddWater(amount);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3182CE" />
      </View>
    );
  }

  const fillHeight = fillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* --- HEADER --- */}
       

        {/* --- GLASS --- */}
        <View style={styles.glassContainer}>
          <View style={styles.glass}>
            <Animated.View style={[styles.water, { height: fillHeight }]}>
              {bubbles.map(b => (
                <Bubble key={b.id} {...b} />
              ))}
            </Animated.View>
            <View style={styles.glassReflection} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTextLarge}>{consumed}</Text>
            <Text style={styles.progressTextSmall}>/ {dailyNeed} ml</Text>
          </View>
        </View>

        {/* --- QUICK ADD --- */}
        <View style={styles.optionsContainer}>
          {waterOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option.amount)}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.amount !== 'custom' && (
                  <Text style={styles.optionAmount}>{option.amount} ml</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- UNDO BUTTON --- */}
        <TouchableOpacity
          style={[
            styles.undoButton,
            intakeHistory.length === 0 && styles.disabledButton,
          ]}
          onPress={handleUndo}
          disabled={intakeHistory.length === 0}
        >
          <Text style={styles.undoButtonIcon}>↩️</Text>
          <Text style={styles.undoButtonText}>Undo Last Entry</Text>
        </TouchableOpacity>

        {/* --- HISTORY LIST --- */}
        {intakeHistory && intakeHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Today's History</Text>
            <FlatList
              data={[...intakeHistory].sort((a, b) => {
                // ✅ NULL CHECK: Safely sort array to prevent crash
                const timeA = a.timestamp?.toDate()?.getTime() || 0;
                const timeB = b.timestamp?.toDate()?.getTime() || 0;
                return timeB - timeA;
              })}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text style={styles.historyIcon}>💧</Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyAmount}>{item.amount} ml</Text>
                    <Text style={styles.historyTime}>
                      {/* ✅ NULL CHECK: Safely access timestamp and show fallback */}
                      {item.timestamp?.toDate()
                        ? item.timestamp.toDate().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Invalid time'}
                    </Text>
                  </View>
                  <View style={styles.historyActions}>
                    <TouchableOpacity
                      onPress={() => openEditModal(item)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteIntake(item.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      {/* --- MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {editingIntake ? 'Edit Entry' : 'Custom Amount'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Enter the amount of water in ml.
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="e.g., 400"
              placeholderTextColor="#A0AEC0"
              autoFocus={true}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCustomAmount}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeDashboard;

// Styles remain unchanged
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20, // Add some top padding
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3182CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  greetingText: { fontSize: 16, color: '#718096' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    alignSelf: 'flex-start',
    marginTop: 4, // Align better with greeting
  },
  glassContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  glass: {
    width: 200,
    height: 250,
    backgroundColor: '#EBF8FF',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderWidth: 8,
    borderColor: '#FFFFFF',
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  water: {
    width: '100%',
    backgroundColor: '#63B3ED',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  glassReflection: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 30,
    height: 120,
    backgroundColor: 'white',
    opacity: 0.3,
    borderRadius: 15,
    transform: [{ rotate: '15deg' }],
  },
  progressInfo: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'transparent',
  },
  progressTextLarge: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  progressTextSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  optionsContainer: { width: '100%' },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#CBD5E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  optionIcon: { fontSize: 32, marginRight: 20 },
  optionLabel: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  optionAmount: { fontSize: 14, color: '#718096' },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#EDF2F7',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  disabledButton: { backgroundColor: '#F7FAFC', opacity: 0.6 },
  undoButtonIcon: { fontSize: 16, marginRight: 8 },
  undoButtonText: { color: '#4A5568', fontSize: 16, fontWeight: '600' },
  bubble: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 50,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2D3748',
  },
  modalSubtitle: { marginBottom: 15, textAlign: 'center', color: '#718096' },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: '#EDF2F7' },
  saveButton: { backgroundColor: '#3182CE' },
  modalButtonText: { fontWeight: 'bold', textAlign: 'center' },
  cancelButtonText: { color: '#4A5568' },
  saveButtonText: { color: 'white' },
  historyContainer: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  historyIcon: { fontSize: 24, marginRight: 15 },
  historyInfo: { flex: 1 },
  historyAmount: { fontSize: 16, fontWeight: '600', color: '#4A5568' },
  historyTime: { fontSize: 12, color: '#A0AEC0' },
  historyActions: { flexDirection: 'row' },
  actionButton: { padding: 8, marginLeft: 8 },
  actionButtonText: { fontSize: 18 },
});