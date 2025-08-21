// components/WaterSelectionModal.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';

const cupOptions = [
  { id: '1', amount: 100, icon: '💧' },
  { id: '2', amount: 150, icon: '💧' },
  { id: '3', amount: 250, icon: '🥤' },
  { id: '4', amount: 300, icon: '🥤' },
  { id: '5', amount: 500, icon: '🫙' },
  { id: '6', amount: 'custom', icon: '+' },
];

const WaterSelectionModal = ({ isVisible, onClose, onAddWater }) => {
  const [selectedAmount, setSelectedAmount] = useState(null);

  const handleSelect = (amount) => {
    if (amount === 'custom') {
      // For custom, we don't set a selected amount, we prompt directly
      handleCustomAmount();
    } else {
      setSelectedAmount(amount);
    }
  };

  const handleConfirm = () => {
    if (selectedAmount) {
      onAddWater(selectedAmount);
      setSelectedAmount(null); // Reset after adding
    }
  };
  
  const handleCustomAmount = () => {
    Alert.prompt(
      "Custom Amount",
      "Enter the amount of water in ml:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "OK", 
          onPress: (text) => {
            const amount = parseInt(text, 10);
            if (!isNaN(amount) && amount > 0) {
              onAddWater(amount);
            } else {
              Alert.alert("Invalid Input", "Please enter a valid number.");
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const renderCup = ({ item }) => {
    const isSelected = selectedAmount === item.amount;
    return (
      <TouchableOpacity
        style={[styles.cupItem, isSelected && styles.cupItemSelected]}
        onPress={() => handleSelect(item.amount)}
      >
        <Text style={styles.cupIcon}>{item.icon}</Text>
        <Text style={styles.cupAmount}>
          {item.amount === 'custom' ? 'Custom' : `${item.amount} ml`}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Amount</Text>
          <FlatList
            data={cupOptions}
            renderItem={renderCup}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.cupGrid}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.okButton]}
              onPress={handleConfirm}
              disabled={!selectedAmount}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default WaterSelectionModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
  },
  cupGrid: {
    justifyContent: 'center',
  },
  cupItem: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    margin: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cupItemSelected: {
    borderColor: '#3182CE',
    backgroundColor: '#EBF8FF',
  },
  cupIcon: {
    fontSize: 28,
  },
  cupAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: 'bold',
  },
  okButton: {
    backgroundColor: '#3182CE',
    marginLeft: 8,
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
