// Simple environment variable loader for Expo
export const getEnvVariable = (key: string): string | undefined => {
  // Try to get from process.env (for development and testing)
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore - process.env might not have the key
    return process.env[key];
  }
  
  // Fallback for Expo
  try {
    // Support both expoConfig.extra and manifestExtra across SDK versions
    // @ts-ignore - Expo constants
    const constants = require('expo-constants');
    return (
      constants.expoConfig?.extra?.[key] ??
      constants.manifestExtra?.[key]
    );
  } catch (error) {
    console.warn('Could not load Expo constants:', error);
    return undefined;
  }
};