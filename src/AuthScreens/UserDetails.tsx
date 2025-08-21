import React, { useState, useRef } from 'react';
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
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

const UserDetails = ({ navigation }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [activeInput, setActiveInput] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    // Animate on component mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSubmit = () => {
    if (!height || !weight || !age) {
      Alert.alert(
        "Missing Information",
        "Please fill all fields to continue",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    
    // Validate inputs
    if (isNaN(height) || height <= 0 || height > 250) {
      Alert.alert(
        "Invalid Height",
        "Please enter a valid height between 1 and 250 cm",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    
    if (isNaN(weight) || weight <= 0 || weight > 300) {
      Alert.alert(
        "Invalid Weight",
        "Please enter a valid weight between 1 and 300 kg",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    
    if (isNaN(age) || age <= 0 || age > 120) {
      Alert.alert(
        "Invalid Age",
        "Please enter a valid age between 1 and 120",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    
    // Save details to Firebase or local state here
    console.log('User details:', { height, weight, age });
    
    // Navigate to Home or next screen
    navigation.replace("HomeScreen");
  };

  const InputField = ({ label, value, onChange, placeholder, keyboardType, unit }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        activeInput === label.toLowerCase() && styles.inputFocused
      ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChange}
          onFocus={() => setActiveInput(label.toLowerCase())}
          onBlur={() => setActiveInput(null)}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          width: '100%'
        }}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>💧</Text>
            </View>
            <Text style={styles.title}>Tell Us About You</Text>
            <Text style={styles.subtitle}>
              We'll use this information to calculate your personalized daily water intake goals
            </Text>
          </View>

          <InputField 
            label="Height" 
            value={height} 
            onChange={setHeight} 
            placeholder="Enter your height" 
            keyboardType="numeric"
            unit="cm"
          />
          
          <InputField 
            label="Weight" 
            value={weight} 
            onChange={setWeight} 
            placeholder="Enter your weight" 
            keyboardType="numeric"
            unit="kg"
          />
          
          <InputField 
            label="Age" 
            value={age} 
            onChange={setAge} 
            placeholder="Enter your age" 
            keyboardType="numeric"
            unit="years"
          />

          <TouchableOpacity 
            style={[styles.button, (!height || !weight || !age) && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={!height || !weight || !age}
          >
            <Text style={styles.buttonText}>Calculate My Water Intake</Text>
          </TouchableOpacity>
          
          <Text style={styles.note}>
            Your data is only used to calculate water intake and is never shared with third parties.
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#1A73E8',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1E2A47',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#1A73E8',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1F2937',
  },
  unit: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#1A73E8',
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});