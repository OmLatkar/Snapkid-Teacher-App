import { Teacher } from '../types';

export const teachers: Teacher[] = [
  { id: 1, name: "Aarav Sharma", mobile: "9000000001", school: "Greenwood High", branch: "North", class: "Class A1", otp: "111111", email: "aarav.sharma@greenwood.com" },
  { id: 2, name: "Isha Verma", mobile: "9000000002", school: "Greenwood High", branch: "North", class: "Class A1", otp: "222222", email: "isha.verma@greenwood.com" },
  { id: 3, name: "Rahul Nair", mobile: "9000000003", school: "Greenwood High", branch: "South", class: "Class B1", otp: "333333", email: "rahul.nair@greenwood.com" },
  { id: 4, name: "Sneha Rao", mobile: "9000000004", school: "Greenwood High", branch: "South", class: "Class B2", otp: "444444", email: "sneha.rao@greenwood.com" },
  { id: 5, name: "Kunal Patel", mobile: "9000000005", school: "Sunrise Public", branch: "East", class: "Class C1", otp: "555555", email: "kunal.patel@sunrise.com" },
  { id: 6, name: "Priya Singh", mobile: "9000000006", school: "Sunrise Public", branch: "East", class: "Class C2", otp: "666666", email: "priya.singh@sunrise.com" },
  { id: 7, name: "Vikas Gupta", mobile: "9000000007", school: "Sunrise Public", branch: "West", class: "Class D1", otp: "777777", email: "vikas.gupta@sunrise.com" },
  { id: 8, name: "Neha Kapoor", mobile: "9000000008", school: "Sunrise Public", branch: "West", class: "Class D2", otp: "888888", email: "neha.kapoor@sunrise.com" },
];

export const verifyTeacher = (mobile: string, otp: string): Teacher | undefined => {
  return teachers.find(teacher => 
    teacher.mobile === mobile && teacher.otp === otp
  );
};

export const getTeacherByMobile = (mobile: string): Teacher | undefined => {
  return teachers.find(teacher => teacher.mobile === mobile);
};