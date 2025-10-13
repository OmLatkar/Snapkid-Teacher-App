import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? (Constants as any).manifestExtra ?? {};
const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET
} = extra as Record<string, string>;

export const validateAwsConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!AWS_ACCESS_KEY_ID || AWS_ACCESS_KEY_ID === 'your_aws_access_key_here') {
    errors.push('AWS_ACCESS_KEY_ID is not configured');
  }
  
  if (!AWS_SECRET_ACCESS_KEY || AWS_SECRET_ACCESS_KEY === 'your_aws_secret_key_here') {
    errors.push('AWS_SECRET_ACCESS_KEY is not configured');
  }
  
  if (!AWS_REGION || AWS_REGION === 'your_region_here') {
    errors.push('AWS_REGION is not configured');
  }
  
  if (!AWS_S3_BUCKET || AWS_S3_BUCKET === 'your_bucket_name_here') {
    errors.push('AWS_S3_BUCKET is not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const logConfigStatus = (): { isValid: boolean; errors: string[] } => {
  const configStatus = validateAwsConfig();
  
  if (configStatus.isValid) {
    console.log('AWS configuration is valid');
  } else {
    console.warn('AWS configuration issues:', configStatus.errors);
  }
  
  return configStatus;
};