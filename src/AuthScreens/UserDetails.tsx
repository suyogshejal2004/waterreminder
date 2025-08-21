// UserDetails.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

// A memoized InputField to prevent keyboard issues
const InputField = React.memo(({ label, value, onChange, unit, onFocus, onBlur, isFocused, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, isFocused && styles.inputFocused]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholderTextColor="#A0AEC0"
        {...props}
      />
      {unit && <Text style={styles.unit}>{unit}</Text>}
    </View>
  </View>
));

const UserDetails = ({ navigation }) => {
  // Existing state
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [activeInput, setActiveInput] = useState(null);
  const [loading, setLoading] = useState(false);

  // New state for advanced details
  const [gender, setGender] = useState(null); // 'male' or 'female'
  const [wakeUpTime, setWakeUpTime] = useState(new Date(new Date().setHours(7, 0, 0, 0))); // Default to 7:00 AM
  const [sleepTime, setSleepTime] = useState(new Date(new Date().setHours(22, 0, 0, 0))); // Default to 10:00 PM

  // State for the time picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('wake'); // 'wake' or 'sleep'

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onTimeChange = (event, selectedTime) => {
    setShowPicker(false);
    if (selectedTime) {
      if (pickerMode === 'wake') {
        setWakeUpTime(selectedTime);
      } else {
        setSleepTime(selectedTime);
      }
    }
  };

  const showTimePicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !height.trim() || !weight.trim() || !age.trim() || !gender) {
      Alert.alert("Missing Fields", "Please fill in all your details to proceed.");
      return;
    }
    // ... other validations ...

    setLoading(true);
    const user = auth().currentUser;

    if (user) {
      try {
        const userDetails = {
          name: name.trim(),
          height: parseFloat(height),
          weight: parseFloat(weight),
          age: parseInt(age, 10),
          gender: gender,
          wakeUpTime: wakeUpTime.toISOString(),
          sleepTime: sleepTime.toISOString(),
          detailsCompleted: true,
        };
        
        await firestore().collection('users').doc(user.uid).set(userDetails, { merge: true });
        await user.updateProfile({ displayName: name.trim() });
        navigation.replace("HomeScreen", { userDetails });
      } catch (error) {
        setLoading(false);
        Alert.alert("Upload Failed", "Something went wrong. Please try again.");
        console.error('Error saving user details:', error);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          <View style={styles.header}>
            <View style={styles.iconBackground}><Text style={styles.icon}>💧</Text></View>
            <Text style={styles.title}>Tell Us More About You</Text>
            <Text style={styles.subtitle}>These details help us create the perfect hydration plan.</Text>
          </View>
          
          <InputField
            label="Full Name" value={name} onChange={setName} placeholder="e.g., John Doe" autoCapitalize="words"
            onFocus={() => setActiveInput('Full Name')} onBlur={() => setActiveInput(null)} isFocused={activeInput === 'Full Name'}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'male' && styles.genderButtonSelected]}
                onPress={() => setGender('male')}>
                <Text style={[styles.genderIcon, gender === 'male' && {fontSize: 30}]}>♂</Text>
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, gender === 'female' && styles.genderButtonSelected]}
                onPress={() => setGender('female')}>
                <Text style={[styles.genderIcon, gender === 'female' && {fontSize: 30}]}>♀</Text>
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          <InputField
            label="Height" value={height} onChange={setHeight} placeholder="175" unit="cm" keyboardType="numeric"
            onFocus={() => setActiveInput('Height')} onBlur={() => setActiveInput(null)} isFocused={activeInput === 'Height'}
          />
          <InputField
            label="Weight" value={weight} onChange={setWeight} placeholder="70" unit="kg" keyboardType="numeric"
            onFocus={() => setActiveInput('Weight')} onBlur={() => setActiveInput(null)} isFocused={activeInput === 'Weight'}
          />
          <InputField
            label="Age" value={age} onChange={setAge} placeholder="25" unit="years" keyboardType="numeric"
            onFocus={() => setActiveInput('Age')} onBlur={() => setActiveInput(null)} isFocused={activeInput === 'Age'}
          />

          {/* --- *** UPDATED TIME SELECTOR UI *** --- */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Daily Routine</Text>
            <View style={styles.timeSelectorCard}>
              <TouchableOpacity style={styles.timeSelectorRow} onPress={() => showTimePicker('wake')}>
                <Text style={styles.timeSelectorIcon}>☀️</Text>
                <Text style={styles.timeSelectorLabel}>Wake-up Time</Text>
                <Text style={styles.timeText}>{wakeUpTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.timeSelectorRow} onPress={() => showTimePicker('sleep')}>
                <Text style={styles.timeSelectorIcon}>🌙</Text>
                <Text style={styles.timeSelectorLabel}>Sleep Time</Text>
                <Text style={styles.timeText}>{sleepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {showPicker && (
            <DateTimePicker
              value={pickerMode === 'wake' ? wakeUpTime : sleepTime}
              mode="time"
              is24Hour={false} // Set to false for AM/PM
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <TouchableOpacity
            style={[styles.button, (loading) && styles.buttonDisabled]}
            onPress={handleSubmit} disabled={loading} activeOpacity={0.7}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Calculate My Goal</Text>}
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  content: { width: '100%' },
  header: { alignItems: 'center', marginBottom: 30 },
  iconBackground: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#0052D4', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  icon: { fontSize: 36 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A202C', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#4A5568', textAlign: 'center', lineHeight: 24, maxWidth: '90%' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', height: 56, paddingHorizontal: 16, shadowColor: '#CBD5E0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  inputFocused: { borderColor: '#3182CE', shadowColor: '#3182CE', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
  input: { flex: 1, fontSize: 16, color: '#1A202C', fontWeight: '500' },
  unit: { fontSize: 16, fontWeight: '500', color: '#718096', marginLeft: 8 },
  button: { backgroundColor: '#2B6CB0', height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#2B6CB0', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginTop: 20 },
  buttonDisabled: { backgroundColor: '#A0AEC0', elevation: 0 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  genderButton: { flex: 1, height: 100, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginHorizontal: 6, },
  genderButtonSelected: { borderColor: '#3182CE', backgroundColor: '#EBF8FF', transform: [{ scale: 1.05 }] },
  genderIcon: { fontSize: 28, color: '#4A5568' },
  genderText: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginTop: 8 },
  // *** New styles for the improved Time Selector ***
  timeSelectorCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
    shadowColor: '#CBD5E0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
  },
  timeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  timeSelectorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  timeSelectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
  },
  timeText: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '600',
    marginLeft: 'auto' // Pushes the time to the right
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  }
});
