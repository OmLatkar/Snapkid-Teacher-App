import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Teacher } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { uploadToS3 } from '../utils/s3Upload';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ route }) => {
  const teacher = route?.params?.teacher as Teacher | undefined;

  const handleBulkUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow gallery access to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        selectionLimit: 0,
      });

      if (result.canceled) return;

      const assets = (result as any).assets as Array<{ uri: string }>;
      if (!assets || assets.length === 0) return;

      if (!teacher) {
        Alert.alert('Error', 'No teacher context found. Please re-login.');
        return;
      }

      let successCount = 0;
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          await uploadToS3(blob, teacher.school, teacher.branch, teacher.class, teacher.id, i + 1);
          successCount += 1;
        } catch (e) {
          console.warn('Bulk upload failed for', asset.uri, e);
        }
      }

      Alert.alert('Bulk Upload', `Uploaded ${successCount} of ${assets.length} photos.`);
    } catch (error) {
      console.error('Bulk upload error:', error);
      Alert.alert('Error', 'Failed to complete bulk upload.');
    }
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