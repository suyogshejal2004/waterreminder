import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { navigate } from '../Navigation/navigationutils';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      // Create user in Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Update display name in Auth profile
      await userCredential.user.updateProfile({ displayName: name });

      // Store user details in Firestore
      await firestore().collection("users").doc(userCredential.user.uid).set({
        name,
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("Success", "Account created successfully!");
      navigate("Login");
    } catch (error) {
      console.error(error);
      Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account 💧</Text>
      <Text style={styles.subtitle}>Join AquaBuddy and stay hydrated!</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigate("Login")}>
          <Text style={styles.footerLink}> Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

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
    color: '#004D40',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4DD0E1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
