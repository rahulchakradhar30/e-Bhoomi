/**
 * e-Bhoomi Authentication, Role-Based Access Control (RBAC) & Login ID Generator Service
 */
import { UserRole } from '../types';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Generate a structured Official Login ID template based on State, District LGD Code, and Role.
 * Format: [STATE_CODE]-[DISTRICT_CODE]-[ROLE_CODE]-[COUNTER]
 * Example for Kurnool: AP-545-VRO-00101
 */
export const generateOfficerLoginId = (
  stateShortCode: string = APP_CONFIG.activeStateShortCode,
  districtCode: string = APP_CONFIG.activeDistrictCode,
  roleId?: UserRole | string,
  counter: string = '00101'
): string => {
  const stCode = stateShortCode || APP_CONFIG.activeStateShortCode;
  const dist = districtCode || APP_CONFIG.activeDistrictCode;
  let roleTag = 'OFF';

  switch (roleId) {
    case 'STATE_ADMIN':
      return `${stCode}-ADM-${counter}`;
    case 'DISTRICT_COLLECTOR':
    case 'DISTRICT_DEPUTY_COMMISSIONER':
      roleTag = 'COLL';
      break;
    case 'RDO_OFFICER':
    case 'AC_OFFICER':
      roleTag = 'RDO';
      break;
    case 'TAHSILDAR_MRO':
    case 'TAHSILDAR':
      roleTag = 'MRO';
      break;
    case 'FIELD_VRO':
    case 'FIELD_VA':
      roleTag = 'VRO';
      break;
    default:
      roleTag = 'OFF';
  }

  return `${stCode}-${dist}-${roleTag}-${counter}`;
};

/**
 * Resolve Dashboard Route based on User's Role
 */
export const resolveDashboardRoute = (userRole?: UserRole | string): string => {
  switch (userRole) {
    case 'STATE_ADMIN':
      return '/state/dashboard';
    case 'DISTRICT_COLLECTOR':
    case 'DISTRICT_DEPUTY_COMMISSIONER':
      return '/district/dashboard';
    case 'RDO_OFFICER':
    case 'AC_OFFICER':
      return '/rdo/dashboard';
    case 'TAHSILDAR_MRO':
    case 'TAHSILDAR':
      return '/mro/dashboard';
    case 'FIELD_VRO':
    case 'FIELD_VA':
      return '/officer/dashboard';
    default:
      return '/login';
  }
};

/**
 * Password Policy Enforcement Definition
 */
export const DEFAULT_PASSWORD_POLICY = {
  mustChangePasswordOnFirstLogin: true,
  minPasswordLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  noticeText: 'Temporary credentials will be issued by the authorized administrator upon account creation.'
};
