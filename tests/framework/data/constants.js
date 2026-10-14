// ============================================================================
// Shared Test Constants
// ============================================================================
//
// Centralized constants for credentials, API paths, and common values.
// Reads from environment variables with sensible defaults.
//
// Usage:
//   import { CREDENTIALS, API } from '../data/constants.js';
//   await loginPage.login(CREDENTIALS.patient.email, CREDENTIALS.patient.password);
//
// ============================================================================

// Test user credentials — come from .env or defaults
export const CREDENTIALS = {
  patient: {
    email: process.env.TEST_EMAIL || 'patient@healthhub.test',
    password: process.env.TEST_PASSWORD || 'Test123!',
    firstName: 'John',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@healthhub.test',
    password: process.env.ADMIN_PASSWORD || 'Test123!',
    firstName: 'Admin',
  },
  secondary: {
    email: 'sarah@healthhub.test',
    password: 'Test123!',
    firstName: 'Sarah',
  },
};

// API configuration
export const API = {
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001/api/v1',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REGISTER: '/auth/register',
    APPOINTMENTS: '/appointments',
    HEALTH_RECORDS: '/health-records',
    MEDICATIONS: '/medications',
    NOTIFICATIONS: '/notifications',
    SYMPTOMS_LIST: '/symptoms/list',
    SYMPTOMS_CHECK: '/symptoms/check',
    SYMPTOMS_HISTORY: '/symptoms/history',
    DEV_RESET: '/_dev/reset',
    DEV_HEALTH: '/_dev/health',
  },
};

// App routes (frontend paths)
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  APPOINTMENTS: '/appointments',
  HEALTH_RECORDS: '/health-records',
  MEDICATIONS: '/medications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

// Common test data defaults
export const DEFAULTS = {
  TIMEOUT: 10000,
  API_TIMEOUT: 5000,
  APPOINTMENT: {
    type: 'general',
    duration: '30',
    status: 'scheduled',
  },
};

// Appointment types and statuses (match backend enums)
export const APPOINTMENT_TYPES = ['general', 'mental_health', 'physical', 'followup'];
export const APPOINTMENT_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'];

// Health record types (match backend enums)
export const HEALTH_RECORD_TYPES = ['vital', 'lab_result', 'diagnosis', 'procedure', 'note'];

// Medication statuses (match backend enums)
export const MEDICATION_STATUSES = ['active', 'completed', 'discontinued'];
