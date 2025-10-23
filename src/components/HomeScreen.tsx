import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { Teacher } from '../types';
import { RootStackParamList, HomeStackParamList } from '../navigation/AppNavigator';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route }) => {
  const teacher = route?.params?.teacher as Teacher | undefined;
  const navigation = useNavigation<any>();

  const handleBulkUpload = () => {
    navigation.navigate('BulkUpload', { teacher });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome{teacher ? `, ${teacher.name}` : ''}!</Text>
      {teacher && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Class: <Text style={styles.infoValue}>{teacher.class}</Text></Text>
          <Text style={styles.infoText}>School: <Text style={styles.infoValue}>{teacher.school}</Text></Text>
          <Text style={styles.infoText}>Branch: <Text style={styles.infoValue}>{teacher.branch}</Text></Text>
          <Text style={styles.infoText}>Email: <Text style={styles.infoValue}>{teacher.email}</Text></Text>
        </View>
      )}

      <View style={styles.bulkContainer}>
        <TouchableOpacity style={styles.bulkButton} onPress={handleBulkUpload}>
          <Text style={styles.bulkButtonText}>Bulk Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 18,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  infoValue: {
    fontWeight: '700',
    color: '#111',
  },
  bulkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 10,
  },
  bulkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;