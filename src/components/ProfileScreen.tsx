import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Teacher } from '../types';
import { authUtils } from '../utils/auth';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface ProfileScreenProps {
  route: ProfileScreenRouteProp;
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route, navigation }) => {
  const teacher = route?.params?.teacher as Teacher | undefined;
  if (!teacher) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>No teacher found</Text>
      </View>
    );
  }

  const handleLogout = () => {
    authUtils.logout();
    navigation.replace('Login');
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Icon name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>{teacher.name}</Text>
        <Text style={styles.role}>{teacher.school} • {teacher.branch}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Icon name="class" size={24} color="#007AFF" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Class</Text>
            <Text style={styles.detailValue}>{teacher.class}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Icon name="email" size={24} color="#007AFF" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{teacher.email}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Icon name="phone" size={24} color="#007AFF" />
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Mobile</Text>
            <Text style={styles.detailValue}>{teacher.mobile}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#666',
  },
  details: {
    padding: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailText: {
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ProfileScreen;