import AWS from 'aws-sdk';
import Constants from 'expo-constants';

// Prefer Expo-injected config; fallback to legacy fields
const extra = (Constants as any).expoConfig?.extra ?? (Constants as any).manifestExtra ?? {};

const AWS_ACCESS_KEY_ID = extra.AWS_ACCESS_KEY_ID as string | undefined;
const AWS_SECRET_ACCESS_KEY = extra.AWS_SECRET_ACCESS_KEY as string | undefined;
const AWS_REGION = (extra.AWS_REGION as string | undefined) || 'us-east-1';
const AWS_S3_BUCKET = (extra.AWS_S3_BUCKET as string | undefined) || 'teacher-photo-upload-app';

const config = {
  accessKeyId: AWS_ACCESS_KEY_ID || '',
  secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  region: AWS_REGION,
  s3Bucket: AWS_S3_BUCKET
};

// Configure AWS only if we have the required keys
if (config.accessKeyId && config.secretAccessKey && config.region) {
  AWS.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region
  });
  console.log('AWS configured successfully');
} else {
  console.warn('AWS configuration incomplete. S3 functionality will not work.');
  console.log('Current config:', {
    hasAccessKey: !!config.accessKeyId,
    hasSecretKey: !!config.secretAccessKey,
    region: config.region
  });
}

export const s3 = new AWS.S3();
export default config;