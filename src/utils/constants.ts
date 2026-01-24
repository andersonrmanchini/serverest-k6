/**
 * Constantes da aplicação
 * Importa configurações do .env via config.ts
 */
import {
  apiConfig,
  httpStatus,
  thresholdConfig
} from './config';

// Configuração de API
export const API_BASE_URL = apiConfig.baseUrl;
export const API_TIMEOUT = apiConfig.timeout;

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

// Thresholds de performance
export const PERF_THRESHOLDS = {
  P95_DURATION: thresholdConfig.p95,
  P99_DURATION: thresholdConfig.p99,
  MAX_ERROR_RATE: thresholdConfig.maxErrorRate,
  MAX_FAILED_CHECKS_RATE: thresholdConfig.maxFailedChecksRate
} as const;
