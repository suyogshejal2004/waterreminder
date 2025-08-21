// LoginScreen.js
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
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { navigate } from '../Navigation/navigationutils'; // Assuming you have this helper

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();

        if (userDoc.exists) {
          console.log("User details found, navigating to HomeScreen.");
          navigate("HomeScreen", { userDetails: userDoc.data() });
        } else {
          console.log("User details not found, navigating to UserDetails.");
          navigate("UserDetails");
        }
      }
    } catch (error) {
      console.error("Login Error Code:", error.code);
      
      // *** KEY CHANGE HERE: Refined error messages based on your request ***
      let errorMessage = "An unknown error occurred. Please try again.";

      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please enter the correct password and try again.";
          break;
        case 'auth/user-not-found':
          errorMessage = "This email is not registered. Please check your email ID or create a new account.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address format is invalid. Please check your email ID.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.";
          break;
        default:
          errorMessage = "Login failed. Please check your credentials and try again.";
      }
      
      Alert.alert("Login Failed", errorMessage);
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
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Let's continue your hydration journey.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0AEC0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.forgotContainer} onPress={() => navigate('Forgot')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigate("Register")}>
            <Text style={styles.footerLink}> Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

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
  forgotContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#2B6CB0',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#2B6CB0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
