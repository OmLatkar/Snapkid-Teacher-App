export interface Teacher {
  id: number;
  name: string;
  mobile: string;
  school: string;
  branch: string;
  class: string;
  otp: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  success: boolean;
  teacher?: Teacher;
  message?: string;
  error?: string;
  otp?: string;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
}