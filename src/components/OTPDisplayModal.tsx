import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OTPDisplayModalProps {
  visible: boolean;
  otp: string;
  onClose: () => void;
  onLogin: () => void;
}

const OTPDisplayModal: React.FC<OTPDisplayModalProps> = ({ visible, otp, onClose, onLogin }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Your OTP</Text>
          <Text style={styles.otpText}>{otp}</Text>
          <Text style={styles.note}>
            For demo purposes, this OTP is displayed instead of being sent via SMS.
          </Text>
          
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>Login with this OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  otpText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginBottom: 20,
    color: '#007AFF',
  },
  note: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OTPDisplayModal;