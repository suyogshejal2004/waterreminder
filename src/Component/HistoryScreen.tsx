// components/HistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  SafeAreaView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Individual History Card Component ---
const HistoryCard = ({ item, onExpand, isExpanded }) => {
  // item is now a grouped object for a single day
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const progress = item.goal > 0 ? item.totalIntake / item.goal : 0;
  const progressWidth = Math.min(progress * 100, 100);
  const goalMet = item.totalIntake >= item.goal;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onExpand(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formattedDate}</Text>
        {goalMet && <Text style={styles.goalMetIcon}>🏆</Text>}
      </View>
      <View style={styles.progressDetails}>
        <Text style={styles.cardIntake}>{item.totalIntake} ml</Text>
        <Text style={styles.cardGoal}>/ {item.goal} ml</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressWidth}%`,
              backgroundColor: goalMet ? '#34D399' : '#60A5FA',
            },
          ]}
        />
      </View>
      {isExpanded && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Log Details</Text>
          {/* Sort entries by time before mapping */}
          {item.entries
            .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
            .map(intake => (
              <View key={intake.id} style={styles.detailRow}>
                <Text style={styles.detailText}>
                  💧 Added {intake.amount} ml
                </Text>
                <Text style={styles.detailTimestamp}>
                  {intake.timestamp
                    .toDate()
                    .toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </Text>
              </View>
            ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- Main History Screen Component ---
const HistoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const subscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('waterHistory')
      .orderBy('timestamp', 'desc') // Fetch all history, newest first
      .onSnapshot(
        querySnapshot => {
          const dailyData = {};

          querySnapshot.forEach(doc => {
            const entry = { id: doc.id, ...doc.data() };
            const entryDate = entry.timestamp
              .toDate()
              .toLocaleDateString('en-CA'); // YYYY-MM-DD format for easy grouping

            if (!dailyData[entryDate]) {
              // If this is the first entry for this day, initialize the object
              dailyData[entryDate] = {
                id: entryDate,
                date: entryDate,
                totalIntake: 0,
                goal: 2000, // You might want to store the daily goal with each entry in the future
                entries: [],
              };
            }
            // Add the entry amount to the total and push the detailed entry to the list
            dailyData[entryDate].totalIntake += entry.amount;
            dailyData[entryDate].entries.push(entry);
          });

          // Convert the grouped object into an array for the FlatList
          const dataArray = Object.values(dailyData);
          setHistoryData(dataArray);
          setLoading(false);
        },
        error => {
          console.error('Error fetching history: ', error);
          setLoading(false);
        },
      );

    return () => subscriber();
  }, []);

  const handleExpandCard = id => {
    // Animate the expansion/collapse
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (historyData.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.placeholderText}>💧</Text>
        <Text style={styles.placeholderTitle}>No History Yet</Text>
        <Text style={styles.placeholderSubtitle}>
          Start logging your water intake to see your progress here!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Your Intake History</Text>
      <FlatList
        data={historyData}
        renderItem={({ item }) => (
          <HistoryCard
            item={item}
            onExpand={handleExpandCard}
            isExpanded={expandedCardId === item.id}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', paddingHorizontal: 20 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F0F4F8',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 20,
  },
  listContainer: { paddingBottom: 20 },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  goalMetIcon: { fontSize: 24 },
  progressDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  cardIntake: { fontSize: 24, fontWeight: 'bold', color: '#3B82F6' },
  cardGoal: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 4,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 6 },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailText: { fontSize: 15, color: '#475569' },
  detailTimestamp: { fontSize: 14, color: '#94A3B8' },
  placeholderText: { fontSize: 60, marginBottom: 16, color: '#94A3B8' },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  placeholderSubtitle: { fontSize: 16, color: '#64748B', textAlign: 'center' },
});
