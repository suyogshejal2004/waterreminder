// Forgotpass.js
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { navigate } from '../Navigation/navigationutils'; // Assuming you have this helper

const Forgotpass = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    // Trim email to remove whitespace and validate
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Email Required", "Please enter your email address to reset your password.");
      return;
    }

    setLoading(true);

    try {
      await auth().sendPasswordResetEmail(trimmedEmail);
      // ✅ IMPROVED MESSAGE: More helpful and specific success alert
      Alert.alert(
        "Check Your Email",
        `A password reset link has been sent to ${trimmedEmail}. If you don't see it, please check your spam or junk folder.`,
        [{ text: "OK", onPress: () => navigate('Login') }] // Option to navigate back
      );
    } catch (error) {
      console.error("Password Reset Error:", error.code);
      let errorMessage = "An error occurred. Please try again.";

      // ✅ IMPROVED ERROR HANDLING: User-friendly messages
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "This email is not registered. Please check the email address and try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address format is invalid. Please enter a valid email.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
          break;
      }
      Alert.alert("Reset Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* ✅ UI IMPROVEMENT: Added an icon */}
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          No worries! Enter your registered email below to receive password reset instructions.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#A0AEC0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        {/* ✅ UI IMPROVEMENT: Added a back to login link */}
        <TouchableOpacity onPress={() => navigate('Login')}>
          <Text style={styles.backLink}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Forgotpass;

// ✅ UI IMPROVEMENT: Updated and modernized styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A5568',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#1A202C',
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2B6CB0',
    alignItems: "center",
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  backLink: {
    marginTop: 24,
    color: '#2B6CB0',
    fontWeight: '600',
    fontSize: 15,
  },
});
