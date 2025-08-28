// components/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
  Linking,
  PermissionsAndroid, // --- 1. IMPORT PERMISSIONSANDROID ---
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import DateTimePicker from '@react-native-community/datetimepicker';
import { navigate, replace } from '../Navigation/navigationutils';

// --- Reusable row components ---
const SettingsRow = ({
  label,
  value,
  icon,
  isEditable,
  onChangeText,
  keyboardType,
}) => (
  <View style={styles.row}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={styles.rowLabel}>{label}</Text>
    {isEditable ? (
      <TextInput
        style={[styles.rowValue, styles.editableInput]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    ) : (
      <Text style={styles.rowValue} numberOfLines={1} ellipsizeMode="tail">
        {value}
      </Text>
    )}
  </View>
);

const TimeSettingsRow = ({ label, value, icon, isEditable, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={isEditable ? onPress : null}
    disabled={!isEditable}
  >
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, isEditable && styles.editableText]}>
      {value instanceof Date && !isNaN(value)
        ? value.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : 'Not set'}
    </Text>
  </TouchableOpacity>
);

const ToggleRow = ({ label, value, onValueChange, icon, disabled = false }) => (
  <View style={styles.row}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch
      trackColor={{ false: '#E2E8F0', true: '#60A5FA' }}
      thumbColor={value ? '#3B82F6' : '#f4f3f4'}
      ios_backgroundColor="#E2E8F0"
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
    />
  </View>
);

const LinkRow = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>›</Text>
  </TouchableOpacity>
);

const defaultUserData = {
  name: 'User',
  email: '',
  age: '0',
  height: '0',
  weight: '0',
  wakeUpTime: new Date(),
  sleepTime: new Date(),
  hourlyNotifications: false,
};

const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(defaultUserData);
  const [originalData, setOriginalData] = useState(defaultUserData);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('wakeUpTime');

  const handleError = (error, contextTitle = 'An Error Occurred') => {
    console.error(`[${contextTitle}]`, error);
    let message = 'Please check your connection and try again.';
    if (error.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          message =
            'A network error occurred. Please check your internet connection.';
          break;
        case 'firestore/permission-denied':
          message = 'You do not have permission to perform this action.';
          break;
        default:
          message = error.message;
          break;
      }
    } else if (error.message) {
      message = error.message;
    }
    Alert.alert(contextTitle, message);
  };

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      navigate('Login');
      return;
    }
    const subscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(
        doc => {
          if (doc.exists) {
            const data = doc.data();
            const formattedData = {
              ...defaultUserData,
              ...data,
              wakeUpTime: data.wakeUpTime?.toDate
                ? data.wakeUpTime.toDate()
                : new Date(),
              sleepTime: data.sleepTime?.toDate
                ? data.sleepTime.toDate()
                : new Date(),
              height: String(data.height || '0'),
              weight: String(data.weight || '0'),
              age: String(data.age || '0'),
              hourlyNotifications: data.hourlyNotifications || false,
            };
            setUserData(formattedData);
            setOriginalData(formattedData);
          }
          setLoading(false);
        },
        error => {
          handleError(error, 'Data Fetch Error');
          setLoading(false);
        },
      );
    return () => subscriber();
  }, []);

  // --- 2. NEW: CROSS-PLATFORM PERMISSION REQUEST ---
  const requestUserPermission = async () => {
    try {
      // For Android 13 (API 33) and higher, you must request POST_NOTIFICATIONS
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Android 13+ notification permission denied.');
          return false;
        }
      }

      // For iOS and older Android, use the messaging permission request
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('Authorization status:', authStatus);
      return enabled;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  // --- 3. UPDATED: HANDLE NOTIFICATION TOGGLE WITH TOPIC SUBSCRIPTION ---
  const handleToggleHourlyNotifications = async value => {
    const user = auth().currentUser;
    if (!user) return;

    setIsUpdatingNotifications(true);
    const previousValue = userData.hourlyNotifications;
    // Optimistically update the UI
    setUserData(prev => ({ ...prev, hourlyNotifications: value }));

    try {
      if (value) {
        // --- User is turning notifications ON ---
        const enabled = await requestUserPermission();

        if (enabled) {
          // Subscribe the user to the 'water-reminders' topic
          await messaging().subscribeToTopic('water-reminders');
          console.log('Subscribed to water-reminders topic!');

          // Save the preference to Firestore
          await firestore()
            .collection('users')
            .doc(user.uid)
            .set({ hourlyNotifications: true }, { merge: true });
          Alert.alert(
            'Reminders On',
            'You will now receive hourly water reminders!',
          );
        } else {
          // If permission is denied, revert the toggle and throw an error
          throw new Error('Notification permission denied.');
        }
      } else {
        // --- User is turning notifications OFF ---
        // Unsubscribe from the topic
        await messaging().unsubscribeFromTopic('water-reminders');
        console.log('Unsubscribed from water-reminders topic.');

        // Save the preference to Firestore
        await firestore()
          .collection('users')
          .doc(user.uid)
          .set({ hourlyNotifications: false }, { merge: true });
        Alert.alert('Reminders Off', 'Hourly reminders have been turned off.');
      }
    } catch (error) {
      // If anything fails, revert the toggle to its previous state
      setUserData(prev => ({ ...prev, hourlyNotifications: previousValue }));
      handleError(error, 'Reminder Update Failed');
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'Not logged in.');
      setIsSaving(false);
      return;
    }

    const heightNum = parseFloat(userData.height);
    const weightNum = parseFloat(userData.weight);
    const ageNum = parseInt(userData.age, 10);

    if (isNaN(heightNum) || isNaN(weightNum) || isNaN(ageNum)) {
      Alert.alert(
        'Invalid Input',
        'Please ensure age, height, and weight are valid numbers.',
      );
      setIsSaving(false);
      return;
    }

    try {
      const updatedData = {
        name: userData.name.trim(),
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        wakeUpTime: userData.wakeUpTime,
        sleepTime: userData.sleepTime,
      };
      await firestore().collection('users').doc(user.uid).update(updatedData);
      await user.updateProfile({ displayName: userData.name.trim() });
      Alert.alert('Success', 'Your profile has been updated!');
      setIsEditMode(false);
    } catch (error) {
      handleError(error, 'Profile Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUserData(originalData);
    setIsEditMode(false);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await messaging().deleteToken(); // Good practice to clear token on logout
            await auth().signOut();
            replace('Login');
          } catch (error) {
            handleError(error, 'Logout Failed');
          }
        },
      },
    ]);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setUserData(prev => ({ ...prev, [pickerMode]: selectedTime }));
    }
  };

  const showTimePicker = mode => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const getInitials = name => {
    if (!name || typeof name !== 'string') return '?';
    const nameParts = name.split(' ');
    return `${nameParts[0]?.[0] || ''}${nameParts[1]?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(userData.name)}</Text>
        </View>
        <Text style={styles.headerName}>{userData.name}</Text>
        <Text style={styles.headerEmail}>{auth().currentUser?.email}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profile Details</Text>
          {!isEditMode && (
            <TouchableOpacity onPress={() => setIsEditMode(true)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        <SettingsRow
          label="Age"
          value={userData.age}
          icon="🎂"
          isEditable={isEditMode}
          onChangeText={val =>
            setUserData(prev => ({ ...prev, age: val.replace(/[^0-9]/g, '') }))
          }
          keyboardType="numeric"
        />
        <SettingsRow
          label="Height (cm)"
          value={userData.height}
          icon="📏"
          isEditable={isEditMode}
          onChangeText={val =>
            setUserData(prev => ({
              ...prev,
              height: val.replace(/[^0-9.]/g, ''),
            }))
          }
          keyboardType="numeric"
        />
        <SettingsRow
          label="Weight (kg)"
          value={userData.weight}
          icon="⚖️"
          isEditable={isEditMode}
          onChangeText={val =>
            setUserData(prev => ({
              ...prev,
              weight: val.replace(/[^0-9.]/g, ''),
            }))
          }
          keyboardType="numeric"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Daily Routine</Text>
        </View>
        <TimeSettingsRow
          label="Wake-up Time"
          value={userData.wakeUpTime}
          icon="☀️"
          isEditable={isEditMode}
          onPress={() => showTimePicker('wakeUpTime')}
        />
        <TimeSettingsRow
          label="Sleep Time"
          value={userData.sleepTime}
          icon="🌙"
          isEditable={isEditMode}
          onPress={() => showTimePicker('sleepTime')}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Preferences</Text>
        </View>
        <ToggleRow
          label="Dark Mode (Coming Soon)"
          value={false}
          onValueChange={() => {
            Alert.alert(
              'Coming Soon!',
              'Dark Mode will be available in a future update.',
            );
          }}
          icon="🎨"
        />
        <ToggleRow
          label="Hourly Water Reminder"
          value={userData.hourlyNotifications}
          onValueChange={handleToggleHourlyNotifications}
          icon="⏰"
          disabled={isUpdatingNotifications}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>About & Support</Text>
        </View>
       
        <LinkRow
          label="Privacy Policy"
          icon="🛡️"
          onPress={() => Linking.openURL('https://suyogshejal2004.github.io/aquabuddy-privacy-policy/')}
        />
        <LinkRow
          label="Contact Support"
          icon="✉️"
          onPress={() => Linking.openURL('mailto:suyogshejal2004@gmail.com')}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Developed by Suyog Shejal</Text>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={userData[pickerMode]}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {isEditMode && (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelEdit}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleUpdate}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', paddingHorizontal: 16 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  headerContainer: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#3B82F6',
  },
  avatarText: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  headerName: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  headerEmail: { fontSize: 16, color: '#64748B', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  editButtonText: { fontSize: 16, fontWeight: '600', color: '#3B82F6' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  rowIcon: { fontSize: 20, marginRight: 18, width: 24, textAlign: 'center' },
  rowLabel: { fontSize: 16, color: '#475569', flex: 1 },
  rowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  editableInput: {
    borderBottomWidth: 1.5,
    borderColor: '#94A3B8',
    paddingVertical: Platform.OS === 'ios' ? 6 : 0,
    minWidth: 60,
    fontWeight: '600',
  },
  editableText: { color: '#3B82F6', fontWeight: 'bold' },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: { backgroundColor: '#3B82F6', marginLeft: 8 },
  cancelButton: { backgroundColor: '#E2E8F0', marginRight: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButtonText: { color: '#475569' },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerText: { fontSize: 14, color: '#64748B' },
});
