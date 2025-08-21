import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { navigate } from '../Navigation/navigationutils';
import auth from '@react-native-firebase/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert("Success", "Logged in successfully!");
      // navigate to your main app screen, e.g., Home
      navigate("Home");
    } catch (error) {
      console.error(error);
      Alert.alert("Login Error", error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email first");
      return;
    }
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert("Success", "Password reset email sent!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to continue your AquaBuddy journey</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.forgotContainer} onPress={()=>navigate('forgot')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => navigate("Register")}>
          <Text style={styles.footerLink}> Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00796B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#004D40',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#B2EBF2',
  },
  forgotContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    color: '#00796B',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4DD0E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  footerText: {
    color: '#004D40',
    fontSize: 15,
  },
  footerLink: {
    color: '#00796B',
    fontWeight: '600',
    fontSize: 15,
  },
});
