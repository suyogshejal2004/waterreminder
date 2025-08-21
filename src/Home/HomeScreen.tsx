// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import HeaderComponent from './HeaderComponent';
import HomeDashboard from '../Component/HomeDashboard';

import SettingsScreen from '../Component/SettingsScreen';
import HistoryScreen from '../Component/HistoryScreen';

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HomeScreen = ({ navigation, route }) => {
  const initialDetails = route.params?.userDetails;
  const [userData, setUserData] = useState(initialDetails || null);
  const [loading, setLoading] = useState(!initialDetails);
  const [waterGoal, setWaterGoal] = useState(0);
  const [activeTab, setActiveTab] = useState('Home');

  // --- New State for Water Tracking ---
  const [currentIntake, setCurrentIntake] = useState(0);
  const [intakeHistory, setIntakeHistory] = useState([]); // To track each addition for the undo feature

  // This effect fetches user data and today's intake record
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    // Fetch user profile
    const userSubscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          const fetchedUserData = documentSnapshot.data();
          setUserData(fetchedUserData);
          calculateWaterIntake(fetchedUserData);
        } else {
          console.log('User document does not exist!');
        }
        if (loading) setLoading(false);
      });

    // Fetch today's intake record
    const today = getTodayDateString();
    const intakeSubscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('dailyIntake')
      .doc(today)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setCurrentIntake(data.totalIntake || 0);
          setIntakeHistory(data.history || []);
        } else {
          // No record for today, reset to 0
          setCurrentIntake(0);
          setIntakeHistory([]);
        }
      });

    return () => {
      userSubscriber();
      intakeSubscriber();
    };
  }, []);

  const calculateWaterIntake = (data) => {
    if (!data?.weight || !data?.age) {
      setWaterGoal(0);
      return;
    }
    let baseIntake = data.weight * 35;
    if (data.age > 60) baseIntake *= 0.9;
    if (data.age < 30) baseIntake *= 1.1;
    if (data.gender === 'male') baseIntake *= 1.05;
    setWaterGoal(Math.round(baseIntake / 10) * 10);
  };

  const updateIntakeInFirebase = async (newTotal, newHistory) => {
    const user = auth().currentUser;
    if (!user) return;
    const today = getTodayDateString();
    const intakeRef = firestore()
      .collection('users').doc(user.uid)
      .collection('dailyIntake').doc(today);

    try {
      await intakeRef.set({
        totalIntake: newTotal,
        history: newHistory,
        goal: waterGoal,
        date: firestore.Timestamp.fromDate(new Date(today))
      }, { merge: true });
    } catch (error) {
      console.error("Failed to update intake:", error);
      Alert.alert("Error", "Could not save your progress. Please check your connection.");
    }
  };

  const handleAddWater = (amount) => {
    const newTotal = currentIntake + amount;
    const newHistory = [...intakeHistory, amount];
    setCurrentIntake(newTotal);
    setIntakeHistory(newHistory);
    updateIntakeInFirebase(newTotal, newHistory);
  };

  const handleUndo = () => {
    if (intakeHistory.length === 0) return;
    const lastAmount = intakeHistory[intakeHistory.length - 1];
    const newTotal = currentIntake - lastAmount;
    const newHistory = intakeHistory.slice(0, -1);
    setCurrentIntake(newTotal);
    setIntakeHistory(newHistory);
    updateIntakeInFirebase(newTotal, newHistory);
  };

  const handleLogout = async () => { /* ... (no change) ... */ };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeDashboard 
                  userData={userData} 
                  waterGoal={waterGoal}
                  currentIntake={currentIntake}
                  intakeHistory={intakeHistory}
                  handleAddWater={handleAddWater}
                  handleUndo={handleUndo} 
                />;
      case 'History':
        return <HistoryScreen />;
      case 'Settings':
        return <SettingsScreen onLogout={handleLogout} />;
      default:
        return <HomeDashboard />;
    }
  };

  if (loading) { /* ... (no change) ... */ }

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent />
      <View style={styles.contentContainer}>{renderContent()}</View>
      <View style={styles.tabBarContainer}>
        {/* ... (Tab bar JSX remains the same) ... */}
         <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('History')}>
          <Text style={[styles.tabIcon, activeTab === 'History' && styles.tabIconActive]}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'History' && styles.tabLabelActive]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItemCenter} onPress={() => setActiveTab('Home')}>
           <View style={styles.centerTabButton}>
             <Text style={styles.centerTabIcon}>💧</Text>
           </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Settings')}>
          <Text style={[styles.tabIcon, activeTab === 'Settings' && styles.tabIconActive]}>⚙️</Text>
          <Text style={[styles.tabLabel, activeTab === 'Settings' && styles.tabLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  // ... (All styles remain the same as the previous version) ...
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9FC' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4A5568' },
  contentContainer: { flex: 1, paddingBottom: 80 }, // Added paddingBottom to avoid overlap with tab bar
  tabBarContainer: { flexDirection: 'row', height: 80, backgroundColor: '#FFFFFF', position: 'absolute', bottom: 25, left: 20, right: 20, borderRadius: 25, justifyContent: 'space-around', alignItems: 'center', shadowColor: '#1A202C', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10, },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabItemCenter: { alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 24, color: '#A0AEC0' },
  tabIconActive: { color: '#3182CE' },
  tabLabel: { fontSize: 12, color: '#718096', marginTop: 4 },
  tabLabelActive: { color: '#3182CE', fontWeight: '600' },
  centerTabButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3182CE', justifyContent: 'center', alignItems: 'center', bottom: 25, shadowColor: '#3182CE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 12, borderWidth: 4, borderColor: '#F7F9FC' },
  centerTabIcon: { fontSize: 30, color: '#FFFFFF' },
});