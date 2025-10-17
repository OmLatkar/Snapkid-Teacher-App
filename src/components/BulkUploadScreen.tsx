import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RouteProp } from '@react-navigation/native';
import { databaseManager, CapturedPhoto } from '../utils/database';
import { uploadToS3 } from '../utils/s3Upload';
import { Teacher } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type BulkUploadScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface BulkUploadScreenProps {
  route: BulkUploadScreenRouteProp;
}

const BulkUploadScreen: React.FC<BulkUploadScreenProps> = ({ route }) => {
  const teacher = route?.params?.teacher as Teacher | undefined;
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    if (!teacher) return;
    
    try {
      setIsLoading(true);
      const unuploadedPhotos = await databaseManager.getUnuploadedPhotos(teacher.id);
      setPhotos(unuploadedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePhotoSelection = (photoId: number) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAllPhotos = () => {
    const allPhotoIds = new Set(photos.map(photo => photo.id));
    setSelectedPhotos(allPhotoIds);
  };

  const clearSelection = () => {
    setSelectedPhotos(new Set());
  };

  const uploadSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) {
      Alert.alert('No Selection', 'Please select photos to upload');
      return;
    }

    if (!teacher) {
      Alert.alert('Error', 'Teacher information not available');
      return;
    }

    setIsUploading(true);
    try {
      const selectedPhotoList = photos.filter(photo => selectedPhotos.has(photo.id));
      const uploadedIds: number[] = [];
      let counter = 1;

      for (const photo of selectedPhotoList) {
        try {
          // Read the photo file
          const response = await fetch(photo.filePath);
          const blob = await response.blob();

          // Upload to S3 with captured timestamp and counter
          await uploadToS3(
            blob,
            teacher.school,
            teacher.branch,
            teacher.class,
            teacher.id,
            counter,
            photo.capturedAt
          );

          uploadedIds.push(photo.id);
          counter++;
        } catch (error) {
          console.error(`Error uploading photo ${photo.id}:`, error);
        }
      }

      if (uploadedIds.length > 0) {
        // Mark photos as uploaded in database
        await databaseManager.markMultipleAsUploaded(uploadedIds);
        
        Alert.alert(
          'Upload Complete',
          `Successfully uploaded ${uploadedIds.length} out of ${selectedPhotoList.length} photos`
        );

        // Refresh the photo list
        await loadPhotos();
        setSelectedPhotos(new Set());
      } else {
        Alert.alert('Upload Failed', 'No photos were uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photos. Please check your AWS configuration.');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteSelectedPhotos = async () => {
    if (selectedPhotos.size === 0) {
      Alert.alert('No Selection', 'Please select photos to delete');
      return;
    }

    Alert.alert(
      'Delete Photos',
      `Are you sure you want to delete ${selectedPhotos.size} selected photos?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseManager.deleteMultiplePhotos(Array.from(selectedPhotos));
              await loadPhotos();
              setSelectedPhotos(new Set());
              Alert.alert('Success', 'Photos deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete photos');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderPhotoItem = ({ item }: { item: CapturedPhoto }) => {
    const isSelected = selectedPhotos.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.photoItem, isSelected && styles.selectedPhotoItem]}
        onPress={() => togglePhotoSelection(item.id)}
      >
        <Image source={{ uri: item.filePath }} style={styles.photoImage} />
        <View style={styles.photoInfo}>
          <Text style={styles.photoDate}>{formatDate(item.capturedAt)}</Text>
          {isSelected && (
            <Icon name="check-circle" size={24} color="#4CAF50" style={styles.checkIcon} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bulk Upload Photos</Text>
        <Text style={styles.headerSubtitle}>
          {photos.length} photos available • {selectedPhotos.size} selected
        </Text>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="photo-camera" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No photos available</Text>
          <Text style={styles.emptySubtext}>Capture some photos first to upload them</Text>
        </View>
      ) : (
        <>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={selectAllPhotos}
            >
              <Text style={styles.actionButtonText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={clearSelection}
            >
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.photoGrid}
          />

          {selectedPhotos.size > 0 && (
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={[styles.bottomButton, styles.deleteButton]}
                onPress={deleteSelectedPhotos}
              >
                <Icon name="delete" size={20} color="#fff" />
                <Text style={styles.bottomButtonText}>Delete Selected</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.bottomButton, styles.uploadButton]}
                onPress={uploadSelectedPhotos}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="cloud-upload" size={20} color="#fff" />
                    <Text style={styles.bottomButtonText}>Upload Selected</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  photoGrid: {
    padding: 16,
  },
  photoItem: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedPhotoItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  photoImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  photoInfo: {
    padding: 12,
    position: 'relative',
  },
  photoDate: {
    fontSize: 12,
    color: '#666',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default BulkUploadScreen;
