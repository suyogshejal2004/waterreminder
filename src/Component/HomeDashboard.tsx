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
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
// Make sure you have this package installed: npm i react-native-linear-gradient
import LinearGradient from 'react-native-linear-gradient';

// --- Redesigned water intake options for better UI/UX ---
const waterOptions = [
  { icon: '💧', amount: 250, label: 'Small' },
  { icon: '🥤', amount: 500, label: 'Medium' },
  { icon: '🫙', amount: 750, label: 'Large' },
  { icon: '➕', amount: 'custom', label: 'Custom' },
];

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

  const translateY = animation.interpolate({ inputRange: [0, 1], outputRange: [0, -200] });
  const opacity = animation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      style={[
        styles.bubble,
        { width: size, height: size, left: x, opacity, transform: [{ translateY }] },
      ]}
    />
  );
};

const HomeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [dailyNeed, setDailyNeed] = useState(2000);
  const [consumed, setConsumed] = useState(0);
  const [intakeHistory, setIntakeHistory] = useState([]);
  const [bubbles, setBubbles] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [editingIntake, setEditingIntake] = useState(null);

  const fillAnimation = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;

  const calculateWaterNeed = (weight, gender) => {
    const numWeight = Number(weight);
    if (!numWeight || isNaN(numWeight)) return 2000;
    let base = numWeight * 35;
    if (gender?.toLowerCase() === 'male') base += 250;
    return Math.round(base);
  };

  const getWaterColor = () => {
    const progress = dailyNeed > 0 ? consumed / dailyNeed : 0;
    // --- NEW: Added a special color for 100% completion ---
    if (progress >= 1) return ['#3498DB', '#2980B9']; // Goal Achieved Blue
    if (progress >= 0.7) return ['#48BB78', '#38A169']; // Green gradient
    if (progress >= 0.35) return ['#F6E05E', '#ECC94B']; // Yellow gradient
    return ['#FC8181', '#E53E3E']; // Red gradient
  };

  const getInitials = name => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.split(' ');
    return `${parts[0][0] || ''}${parts.length > 1 ? parts[1]?.[0] || '' : ''}`.toUpperCase();
  };

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = firestore().collection('users').doc(user.uid);
    const userSubscriber = userRef.onSnapshot(
      docSnapshot => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          const safeData = { name: user.displayName || 'User', weight: 70, gender: 'male', ...data };
          setUserData(safeData);
          setDailyNeed(calculateWaterNeed(safeData.weight, safeData.gender));
        } else {
          userRef.set({ name: user.displayName || 'User', email: user.email, weight: 70, gender: 'male' });
        }
      },
      error => console.error('User data listener error:', error),
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const historySubscriber = userRef
      .collection('waterHistory')
      .where('timestamp', '>=', todayStart)
      .onSnapshot(
        querySnapshot => {
          let total = 0;
          const historyEntries = [];
          querySnapshot.forEach(doc => {
            const entry = { id: doc.id, ...doc.data() };
            if (entry.amount && !isNaN(Number(entry.amount))) {
              historyEntries.push(entry);
              total += entry.amount;
            }
          });
          setConsumed(total);
          setIntakeHistory(historyEntries);
          if (loading) setLoading(false);
        },
        error => {
          console.error('History listener error:', error);
          if (loading) setLoading(false);
        },
      );

    return () => {
      userSubscriber();
      historySubscriber();
    };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(headerSlideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    const hours = new Date().getHours();
    setGreeting(hours < 12 ? 'Good Morning ☀️' : hours < 18 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙');
  }, []);

  useEffect(() => {
    const progress = dailyNeed > 0 ? consumed / dailyNeed : 0;
    Animated.timing(fillAnimation, { toValue: progress > 1 ? 1 : progress, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [consumed, dailyNeed]);

  const addBubbleAnimation = () => {
    const id = Date.now() + Math.random();
    setBubbles(b => [...b, { id, size: Math.random() * 15 + 5, x: Math.random() * 160 + 20, duration: Math.random() * 2000 + 1500 }]);
    setTimeout(() => setBubbles(b => b.filter(bubble => bubble.id !== id)), 3500);
  };

  const handleWaterAction = async (action, ...args) => {
    const user = auth().currentUser;
    if (!user) return Alert.alert('Error', 'You must be logged in.');
    
    if (action === 'add') {
      for (let i = 0; i < 5; i++) setTimeout(addBubbleAnimation, i * 100);
    }

    try {
      const historyRef = firestore().collection('users').doc(user.uid).collection('waterHistory');
      switch (action) {
        case 'add':
          await historyRef.add({ amount: Number(args[0]), timestamp: new Date() });
          break;
        case 'edit':
          await historyRef.doc(args[0]).update({ amount: Number(args[1]) });
          break;
        case 'delete':
          await historyRef.doc(args[0]).delete();
          break;
        default:
          break;
      }
    } catch (e) {
      Alert.alert('Action Failed', 'Could not update your progress. Please check your connection.');
    }
  };

  const handleUndo = () => {
    if (intakeHistory.length > 0) {
      const sortedHistory = [...intakeHistory].sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0));
      const lastEntryId = sortedHistory[0]?.id;
      if (lastEntryId) handleWaterAction('delete', lastEntryId);
    }
  };
  
  const openAddModal = () => { setEditingIntake(null); setCustomAmount(''); setModalVisible(true); };
  const openEditModal = item => { setEditingIntake(item); setCustomAmount(String(item.amount)); setModalVisible(true); };
  
  const handleSaveCustomAmount = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      if (editingIntake) {
        handleWaterAction('edit', editingIntake.id, amount);
      } else {
        handleWaterAction('add', amount);
      }
      setModalVisible(false);
    } else {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
    }
  };

  const handleOptionPress = option => {
    if (option.amount === 'custom') {
      openAddModal();
    } else {
      handleWaterAction('add', option.amount);
    }
  };

  if (loading) return <View style={styles.centeredContainer}><ActivityIndicator size="large" color="#3498DB" /></View>;

  const fillHeight = fillAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const progress = dailyNeed > 0 ? consumed / dailyNeed : 0;
  
  // --- Define colors once for reuse across the component ---
  const waterGradient = getWaterColor();
  const primaryAccentColor = waterGradient[0]; // The main color (red, yellow, green, or blue)
  const progressTextColor = progress > 0.35 && progress < 0.7 ? '#1A202C' : '#FFFFFF';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
       
       

        {/* --- GLASS --- */}
        <View style={styles.glassContainer}>
          <View style={styles.glass}>
            <Animated.View style={[styles.water, { height: fillHeight }]}>
              <LinearGradient colors={waterGradient} style={styles.gradient} />
              {bubbles.map(b => <Bubble key={b.id} {...b} />)}
            </Animated.View>
            <View style={styles.glassReflection} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressTextLarge, {color: progressTextColor}]}>{consumed}</Text>
            <Text style={[styles.progressTextSmall, {color: progressTextColor}]}>/ {dailyNeed} ml</Text>
          </View>
        </View>
        
        {/* --- QUICK ADD --- */}
        <View style={{width: '100%', marginTop: 20}}>
            <Text style={styles.quickAddTitle}>Quick Add</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsContainer}>
                {waterOptions.map((option, index) => (
                    <TouchableOpacity key={index} style={styles.optionCard} onPress={() => handleOptionPress(option)}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {option.amount !== 'custom' && <Text style={styles.optionAmount}>{option.amount} ml</Text>}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
        
        {/* --- UNDO BUTTON & HISTORY --- */}
        {intakeHistory?.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Today's History</Text>
                <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
                    <Text style={styles.undoButtonIcon}>↩️</Text>
                    <Text style={styles.undoButtonText}>Undo</Text>
                </TouchableOpacity>
            </View>
            <FlatList
              data={[...intakeHistory].sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0))}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <Text style={[styles.historyIcon, { color: primaryAccentColor }]}>💧</Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyAmount}>{item.amount} ml</Text>
                    <Text style={styles.historyTime}>{item.timestamp?.toDate() ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Invalid time'}</Text>
                  </View>
                  <View style={styles.historyActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}><Text style={styles.actionButtonText}>✏️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleWaterAction('delete', item.id)} style={styles.actionButton}><Text style={styles.actionButtonText}>🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      {/* --- MODAL --- */}
      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editingIntake ? 'Edit Entry' : 'Custom Amount'}</Text>
            <Text style={styles.modalSubtitle}>Enter the amount of water in ml.</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" value={customAmount} onChangeText={setCustomAmount} placeholder="e.g., 400" placeholderTextColor="#A0AEC0" autoFocus={true} />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton, { backgroundColor: primaryAccentColor }]} onPress={handleSaveCustomAmount}>
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeDashboard;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  headerContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  greetingText: { fontSize: 16, color: '#6C757D' },
  nameText: { fontSize: 22, fontWeight: 'bold', color: '#212529' },
  glassContainer: { alignItems: 'center', marginVertical: 20, position: 'relative' },
  glass: { width: 220, height: 280, backgroundColor: 'rgba(233, 236, 239, 0.7)', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'flex-end', overflow: 'hidden', borderWidth: 10, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
  water: { width: '100%' },
  gradient: { flex: 1, borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
  glassReflection: { position: 'absolute', top: 15, left: 20, width: 35, height: 150, backgroundColor: 'white', opacity: 0.25, borderRadius: 20, transform: [{ rotate: '15deg' }] },
  progressInfo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  progressTextLarge: { fontSize: 48, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.25)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 6 },
  progressTextSmall: { fontSize: 20, fontWeight: '600', marginLeft: 8, textShadowColor: 'rgba(0, 0, 0, 0.25)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4, transform: [{translateY: -5}] },
  quickAddTitle: { fontSize: 20, fontWeight: 'bold', color: '#212529', marginBottom: 15, paddingLeft: 5 },
  optionsContainer: { paddingVertical: 5 },
  optionCard: { backgroundColor: '#FFFFFF', width: 100, height: 120, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 5, marginRight: 15 },
  optionIcon: { fontSize: 30, marginBottom: 8 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#212529' },
  optionAmount: { fontSize: 13, color: '#6C757D', marginTop: 2 },
  historySection: { width: '100%', marginTop: 30 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  historyTitle: { fontSize: 20, fontWeight: 'bold', color: '#212529' },
  undoButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#E9ECEF', borderRadius: 12 },
  undoButtonIcon: { fontSize: 14, marginRight: 5 },
  undoButtonText: { fontSize: 14, fontWeight: '600', color: '#495057' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
  historyIcon: { fontSize: 24, marginRight: 15 },
  historyInfo: { flex: 1 },
  historyAmount: { fontSize: 16, fontWeight: '600', color: '#212529' },
  historyTime: { fontSize: 13, color: '#6C757D', marginTop: 2 },
  historyActions: { flexDirection: 'row' },
  actionButton: { marginLeft: 10, padding: 5 },
  actionButtonText: { fontSize: 18, color: '#6C757D' },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '90%', maxWidth: 340, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#212529' },
  modalSubtitle: { fontSize: 14, color: '#6C757D', marginBottom: 20, textAlign: 'center' },
  modalInput: { width: '100%', height: 50, backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 16, fontSize: 18, color: '#212529', marginBottom: 20, textAlign: 'center', borderWidth: 1, borderColor: '#DEE2E6' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#E9ECEF' },
  saveButton: {},
  modalButtonText: { fontSize: 16, fontWeight: '600' },
  cancelButtonText: { color: '#495057' },
  saveButtonText: { color: '#FFFFFF' },
  bubble: { position: 'absolute', bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 50 },
});