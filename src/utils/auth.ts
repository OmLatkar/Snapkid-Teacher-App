import { Teacher, AuthResponse } from '../types';
import { teachers, verifyTeacher, getTeacherByMobile } from '../data/teachers';

// Store authenticated teacher
let currentTeacher: Teacher | null = null;

export const authUtils = {
  // Generate OTP for a mobile number
  generateOtp: (mobile: string): AuthResponse => {
    const teacher = getTeacherByMobile(mobile);
    if (!teacher) {
      return { 
        success: false, 
        error: 'Mobile number not registered' 
      };
    }
    
    return { 
      success: true, 
      otp: teacher.otp,
      message: 'OTP generated successfully' 
    };
  },

  // Verify OTP
  verifyOtp: (mobile: string, otp: string): AuthResponse => {
    const teacher = verifyTeacher(mobile, otp);
    if (teacher) {
      currentTeacher = teacher;
      return { 
        success: true, 
        teacher,
        message: 'Login successful' 
      };
    }
    return { 
      success: false,
      error: 'Invalid OTP' 
    };
  },

  // Get current teacher
  getCurrentTeacher: (): Teacher | null => {
    return currentTeacher;
  },

  // Logout
  logout: (): AuthResponse => {
    currentTeacher = null;
    return { success: true, message: 'Logged out successfully' };
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return currentTeacher !== null;
  }
};

export default authUtils;