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
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

// Reusable row components
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
      {new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}
    </Text>
  </TouchableOpacity>
);

const ToggleRow = ({ label, value, onValueChange, icon }) => (
  <View style={styles.row}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch
      trackColor={{ false: '#E2E8F0', true: '#60A5FA' }}
      thumbColor={value ? '#3B82F6' : '#f4f3f4'}
      ios_backgroundColor="#E2E8F0"
      onValuecha
      nge={onValueChange}
      value={value}
    />
  </View>
);

const SettingsScreen = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('wakeUpTime');

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const subscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          const formattedData = {
            ...data,
            wakeUpTime: new Date(data.wakeUpTime),
            sleepTime: new Date(data.sleepTime),
            height: data.height.toString(),
            weight: data.weight.toString(),
            age: data.age.toString(),
          };
          setUserData(formattedData);
          setOriginalData(formattedData);
        }
        setLoading(false);
      });
    return () => subscriber();
  }, []);

  const handleUpdate = async () => {
    setIsSaving(true);
    const user = auth().currentUser;
    if (!user || !userData) {
      setIsSaving(false);
      return;
    }

    try {
      const updatedData = {
        name: userData.name.trim(),
        height: parseFloat(userData.height),
        weight: parseFloat(userData.weight),
        age: parseInt(userData.age, 10),
        wakeUpTime: userData.wakeUpTime.toISOString(),
        sleepTime: userData.sleepTime.toISOString(),
      };
      await firestore().collection('users').doc(user.uid).update(updatedData);
      await user.updateProfile({ displayName: userData.name.trim() });
      Alert.alert('Success', 'Your profile has been updated!');
      setIsEditMode(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUserData(originalData);
    setIsEditMode(false);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowPicker(false);
    if (selectedTime) {
      setUserData(prev => ({ ...prev, [pickerMode]: selectedTime }));
    }
  };

  const showTimePicker = mode => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const getInitials = name => {
    if (!name) return '?';
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
      {/* --- New Avatar Header --- */}
      <View style={styles.headerContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(userData?.name)}</Text>
        </View>
        <Text style={styles.headerName}>{userData?.name}</Text>
        <Text style={styles.headerEmail}>{userData?.email}</Text>
      </View>

      {/* --- Profile Details Card --- */}
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
          value={userData?.age}
          icon="🎂"
          isEditable={isEditMode}
          onChangeText={val => setUserData(prev => ({ ...prev, age: val }))}
          keyboardType="numeric"
        />
        <SettingsRow
          label="Height (cm)"
          value={userData?.height}
          icon="📏"
          isEditable={isEditMode}
          onChangeText={val => setUserData(prev => ({ ...prev, height: val }))}
          keyboardType="numeric"
        />
        <SettingsRow
          label="Weight (kg)"
          value={userData?.weight}
          icon="⚖️"
          isEditable={isEditMode}
          onChangeText={val => setUserData(prev => ({ ...prev, weight: val }))}
          keyboardType="numeric"
        />
      </View>

      {/* --- Daily Routine Card --- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Daily Routine</Text>
        </View>
        <TimeSettingsRow
          label="Wake-up Time"
          value={userData?.wakeUpTime}
          icon="☀️"
          isEditable={isEditMode}
          onPress={() => showTimePicker('wakeUpTime')}
        />
        <TimeSettingsRow
          label="Sleep Time"
          value={userData?.sleepTime}
          icon="🌙"
          isEditable={isEditMode}
          onPress={() => showTimePicker('sleepTime')}
        />
      </View>

      {/* --- Preferences Card --- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Preferences</Text>
        </View>
        <ToggleRow
          label="Dark Mode"
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          icon="🎨"
        />
        <ToggleRow
          label="Notifications"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          icon="🔔"
        />
      </View>

      {showPicker && (
        <DateTimePicker
          value={userData?.[pickerMode]}
          mode="time"
          is24Hour={false}
          display="spinner"
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

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
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
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
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
    borderBottomWidth: 1,
    borderColor: '#CBD5E0',
    paddingVertical: 4,
    minWidth: 60,
    fontWeight: '600',
  },
  editableText: { color: '#3B82F6', fontWeight: 'bold' },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
});
