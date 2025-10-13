import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import LoginScreen from './src/components/LoginScreen';
import TabNavigator, { RootStackParamList } from './src/navigation/AppNavigator';
import { logConfigStatus } from './src/utils/configValidator';
import Constants from 'expo-constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Check configuration on app start
    const configStatus = logConfigStatus();
    const extra = (Constants as any).expoConfig?.extra ?? (Constants as any).manifestExtra ?? {};
    console.log('Resolved AWS extra at runtime:', {
      hasAccessKey: !!extra.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!extra.AWS_SECRET_ACCESS_KEY,
      region: extra.AWS_REGION,
      bucket: extra.AWS_S3_BUCKET,
    });
    
    if (!configStatus.isValid) {
      Alert.alert(
        'Configuration Warning', 
        'AWS S3 is not properly configured. Photo uploads will not work. ' +
        'Please check your environment variables.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}