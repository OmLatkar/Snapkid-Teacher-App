import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../components/HomeScreen';
import CameraScreen from '../components/CameraScreen';
import ProfileScreen from '../components/ProfileScreen';
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

const Tab = createBottomTabNavigator<TabParamList>();

type MainRouteProp = RouteProp<RootStackParamList, 'Main'>;

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
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ teacher: teacherParam }} />
      <Tab.Screen name="Camera" component={CameraScreen} initialParams={{ teacher: teacherParam }} />
      <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ teacher: teacherParam }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;