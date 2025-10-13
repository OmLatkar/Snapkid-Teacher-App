import { s3 } from '../config/aws';
import awsConfig from '../config/aws';
import Constants from 'expo-constants';
const extra = Constants.expoConfig?.extra ?? (Constants as any).manifestExtra ?? {};
const { AWS_S3_BUCKET } = extra as Record<string, string>;
import { Teacher } from '../types';

export const uploadToS3 = (
  image: Blob,
  teacherSchool: string,
  teacherBranch: string,
  teacherClass: string,
  teacherIdOrName: string | number,
  bulkIndex?: number
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if AWS is configured
    if (!AWS_S3_BUCKET) {
      reject(new Error('AWS S3 bucket not configured'));
      return;
    }
    if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
      reject(new Error('AWS credentials are not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.'));
      return;
    }
    
    // Create a unique filename per spec:
    // Single image: TeacherID_EpochTime (1 underscore)
    // Bulk upload: TeacherID_EpochTime_Counter (2 underscores)
    const epochTime = Date.now(); // Epoch time in milliseconds
    const idPart = String(teacherIdOrName);
    const cnt = (bulkIndex !== undefined && bulkIndex > 0) ? `_${bulkIndex}` : '';
    const filename = `${teacherSchool}/${teacherBranch}/${teacherClass}/${idPart}_${epochTime}${cnt}.jpg`;
    
    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: filename,
      Body: image,
      ContentType: 'image/jpeg'
    };
    
    s3.upload(params, (err: Error, data: any) => {
      if (err) {
        console.error('S3 Upload Error:', err);
        reject(err);
      } else {
        console.log('S3 Upload Success:', data.Location);
        resolve(data);
      }
    });
  });
};