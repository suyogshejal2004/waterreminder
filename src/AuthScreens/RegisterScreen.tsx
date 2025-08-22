// RegisterScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { navigate } from '../Navigation/navigationutils';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Check for empty fields before proceeding
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in both email and password.");
      return;
    }
    
    setLoading(true);

    try {
      // Step 1: Create the user in Firebase Authentication
      const userCredential = await auth().createUserWithEmailAndPassword(email.trim(), password);
      const user = userCredential.user;

      if (user) {
        // Step 2: Create a corresponding user document in Firestore
        await firestore().collection("users").doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          createdAt: firestore.FieldValue.serverTimestamp(),
          // Initialize other fields with default values
          name: '',
          age: 0,
          weight: 0,
          height: 0,
        });

        // Step 3: Redirect to the UserDetails screen for the new user to enter their info.
        // This is the logic you requested.
        console.log('Registration successful! Navigating to UserDetails screen...');
        navigate("UserDetails");
      }

    } catch (error) {
      console.error("Registration Error:", error.code, error.message);
      let errorMessage = "An unknown error occurred. Please try again.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email address is already registered. Please login instead.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address you entered is not valid.";
          break;
        case 'auth/weak-password':
          errorMessage = "Your password is too weak. It must be at least 6 characters long.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        default:
          errorMessage = "Registration failed. Please try again.";
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create Account 💧</Text>
        <Text style={styles.subtitle}>Join and start your hydration journey!</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor="#A0AEC0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigate("Login")}>
            <Text style={styles.footerLink}> Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#1A202C',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#2B6CB0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#2B6CB0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#A0AEC0',
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  footerText: {
    color: '#4A5568',
    fontSize: 15,
  },
  footerLink: {
    color: '#2B6CB0',
    fontWeight: '700',
    fontSize: 15,
  },
});
