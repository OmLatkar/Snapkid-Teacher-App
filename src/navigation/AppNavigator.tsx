import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../components/HomeScreen';
import CameraScreen from '../components/CameraScreen';
import ProfileScreen from '../components/ProfileScreen';
import BulkUploadScreen from '../components/BulkUploadScreen';
import { Teacher } from '../types';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Main: { teacher: Teacher };
};

export type TabParamList = {
  Home: { teacher: Teacher };
  Camera: { teacher: Teacher };
  Profile: { teacher: Teacher };
};

export type HomeStackParamList = {
  HomeMain: { teacher: Teacher };
  BulkUpload: { teacher: Teacher };
};

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

type MainRouteProp = RouteProp<RootStackParamList, 'Main'>;

const HomeStackNavigator: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        initialParams={{ teacher }} 
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="BulkUpload" 
        component={BulkUploadScreen} 
        initialParams={{ teacher }}
        options={{ 
          title: 'Bulk Upload Photos',
          headerBackTitle: 'Back'
        }}
      />
    </HomeStack.Navigator>
  );
};

const TabNavigator: React.FC<{ route: MainRouteProp }> = ({ route }) => {
  const teacherParam = route?.params?.teacher as Teacher | undefined;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Camera') {
            iconName = 'camera';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        children={() => <HomeStackNavigator teacher={teacherParam!} />}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Camera" component={CameraScreen} initialParams={{ teacher: teacherParam }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ teacher: teacherParam }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;