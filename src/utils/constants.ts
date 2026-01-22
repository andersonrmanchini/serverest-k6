/**
 * Constantes da aplicação
 * Importa configurações do .env via config.ts
 */
import {
  apiConfig,
  endpoints as endpointsConfig,
  httpStatus,
  delays,
  thresholdConfig
} from './config';

// Configuração de API
export const API_BASE_URL = apiConfig.baseUrl;
export const API_TIMEOUT = apiConfig.timeout;

// Endpoints
export const ENDPOINTS = {
  USERS: endpointsConfig.USERS,
  PRODUCTS: endpointsConfig.PRODUCTS,
  LOGIN: endpointsConfig.LOGIN
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: httpStatus.OK,
  CREATED: httpStatus.CREATED,
  BAD_REQUEST: httpStatus.BAD_REQUEST,
  UNAUTHORIZED: httpStatus.UNAUTHORIZED,
  FORBIDDEN: httpStatus.FORBIDDEN,
  NOT_FOUND: httpStatus.NOT_FOUND,
  CONFLICT: httpStatus.CONFLICT,
  INTERNAL_ERROR: httpStatus.INTERNAL_ERROR
} as const;

// Timeout padrão para requisições
export const REQUEST_TIMEOUT = apiConfig.timeout;

// Delays
export const DELAYS = {
  SHORT: delays.SHORT,
  MEDIUM: delays.MEDIUM,
  LONG: delays.LONG
} as const;

// Thresholds de performance
export const PERF_THRESHOLDS = {
  P95_DURATION: thresholdConfig.p95,
  P99_DURATION: thresholdConfig.p99,
  MAX_ERROR_RATE: thresholdConfig.maxErrorRate,
  MAX_FAILED_CHECKS_RATE: thresholdConfig.maxFailedChecksRate
} as const;

// Configurações de teste
export const TEST_CONFIG = {
  DEFAULT_VUS: 5,
  DEFAULT_DURATION: '30s',
  RAMP_UP_DURATION: '10s'
} as const;
