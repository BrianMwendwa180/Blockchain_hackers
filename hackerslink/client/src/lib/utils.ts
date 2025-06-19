import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SKILLS = [
  "Mason",
  "Carpenter",
  "Electrician",
  "Plumber",
  "Painter",
  "Welder",
  "General Labor"
];

export const LOCATIONS = [
  "Pipeline",
  "Gikambura",
  "Kawangware",
  "Kasarani",
  "Rongai",
  "Kitengela"
];

export const DURATIONS = [
  "1 day",
  "2-3 days",
  "1 week",
  "2 weeks",
  "1 month",
  "3+ months"
];

export function formatPhoneNumber(phone: string): string {
  // Format phone number for display or processing
  if (!phone) return "";
  
  // Ensure the phone number starts with 0
  if (phone.startsWith("+254")) {
    return "0" + phone.substring(4);
  }
  
  return phone;
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic validation for Kenyan phone numbers
  const kenyanPhoneRegex = /^(0|\+254|254)?[17][0-9]{8}$/;
  return kenyanPhoneRegex.test(phone);
}

export function getWorkerAvailabilityMessage(skill: string, location: string, count: number): string {
  if (!skill || !location) return "";
  
  if (count === 0) {
    return `No ${skill}s currently registered in ${location}`;
  } else if (count === 1) {
    return `1 ${skill} available in ${location}`;
  } else {
    return `${count} ${skill}s available in ${location}`;
  }
}

export function getWorkerAvailabilityColor(count: number): string {
  if (count === 0) return "text-blue-400";
  if (count > 0) return "text-green-500";
  return "text-blue-400";
}
