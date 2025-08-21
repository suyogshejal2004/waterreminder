// Forgotpass.js
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';

const Forgotpass = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert("Success", "Password reset link sent to your email");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your registered email to receive a password reset link.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Forgotpass;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#7f8c8d",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    elevation: 2,
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#4a90e2",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});