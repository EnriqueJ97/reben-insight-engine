// Roles de usuario
export const USER_ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  HR_ADMIN: 'HR_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

// Estados de bienestar
export const WELLNESS_STATUS = {
  GOOD: 'good',
  WARNING: 'warning',
  CRITICAL: 'critical'
} as const;

// Tendencias
export const TRENDS = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable'
} as const;

// Tipos de alertas
export const ALERT_TYPES = {
  BURNOUT: 'burnout',
  LOW_MORALE: 'low_morale',
  HIGH_STRESS: 'high_stress',
  ABSENTEEISM: 'absenteeism'
} as const;

// Estados de alertas
export const ALERT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  PENDING: 'pending'
} as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Configuración de debounce
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FORM_SUBMIT: 500,
  API_CALL: 1000
} as const;

// Configuración de timeouts
export const TIMEOUTS = {
  SESSION_EXPIRY: 30 * 60 * 1000, // 30 minutos
  API_TIMEOUT: 10000, // 10 segundos
  TOAST_DURATION: 5000 // 5 segundos
} as const;

// Rutas de la aplicación
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CHECKIN: '/dashboard/checkin',
  TEAM: '/dashboard/team',
  ALERTS: '/dashboard/alerts',
  INTEGRATIONS: '/dashboard/integrations',
  REPORTS: '/dashboard/reports',
  TEAM_ANALYSIS: '/dashboard/team-analysis',
  HR_CHAT: '/dashboard/hr-chat',
  SETTINGS: '/dashboard/settings',
  EMPLOYEE_IMPORT: '/dashboard/employees/import',
  SUPER_ADMIN: '/dashboard/super-admin'
} as const;

// Configuración de validación
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
} as const;

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  CSV_HEADERS: ['nombre', 'email', 'rol', 'equipo']
} as const;

// Mensajes de error
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Formato de email inválido',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido',
  NETWORK_ERROR: 'Error de conexión. Inténtalo de nuevo.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado'
} as const;

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  DATA_SAVED: 'Datos guardados correctamente',
  IMPORT_SUCCESS: 'Importación completada exitosamente',
  ALERT_RESOLVED: 'Alerta marcada como resuelta'
} as const;

// Configuración de temas
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

// Configuración de idiomas
export const LANGUAGES = {
  ES: 'es',
  EN: 'en'
} as const; 