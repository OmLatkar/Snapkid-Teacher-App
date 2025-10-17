import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp } from '@react-navigation/native';
import { databaseManager } from '../utils/database';
import { Teacher } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface CameraScreenProps {
  route: CameraScreenRouteProp;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ route }) => {
  const teacher = route?.params?.teacher as Teacher | undefined;
  const cameraRef = useRef<CameraView | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  // Use string literals to avoid runtime undefined when CameraType constant is not exported
  const [type, setType] = useState<'back' | 'front'>('back');

  useEffect(() => {
    (async () => {
      if (!permission || permission.status !== 'granted') {
        await requestPermission();
      }
      // Initialize database
      try {
        await databaseManager.init();
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    })();
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (cameraRef.current && !isSaving && teacher) {
      setIsSaving(true);
      try {
        const capturedAt = Date.now(); // Epoch timestamp when photo was captured
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false
        });

        // Compress image
        const compressedPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Create a permanent file path for the photo
        const fileName = `photo_${teacher.id}_${capturedAt}.jpg`;
        const permanentPath = `${FileSystem.documentDirectory}${fileName}`;
        
        // Copy the compressed photo to permanent storage using legacy API
        await FileSystem.copyAsync({
          from: compressedPhoto.uri,
          to: permanentPath
        });

        // Save photo info to SQLite database
        await databaseManager.savePhoto(teacher.id, permanentPath, capturedAt);
        
        Alert.alert('Success', 'Photo captured and saved locally! Use Bulk Upload to upload to S3.');
      } catch (error) {
        console.error('Save Error:', error);
        Alert.alert('Error', 'Failed to save photo. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const switchCamera = () => {
    setType(type === 'back' ? 'front' : 'back');
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (permission.status !== 'granted') {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={type}
      >
        <View style={styles.controls}>
          <TouchableOpacity style={styles.switchButton} onPress={switchCamera}>
            <Icon name="flip-camera-android" size={30} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={takePicture}
            disabled={isSaving}
            style={styles.captureButton}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>
          
          <View style={styles.placeholder} />
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  switchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  placeholder: {
    width: 50,
  },
});

export default CameraScreen;