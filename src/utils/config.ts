/**
 * Configuração centralizada do projeto
 * Lê configurações de:
 * 1. .env (variáveis sensíveis: URLs, secrets, IDs)
 * 2. k6.config.json (configurações de performance e thresholds)
 */

import k6Config from '../../k6.config.json';

// Função auxiliar para obter variáveis de ambiente com fallback
const getEnvVar = (key: string, defaultValue: string | number): any => {
  const value = __ENV[key];
  return value !== undefined ? value : defaultValue;
};

// Conversão de valores de ambiente
const parseEnvNumber = (value: string | number, defaultValue: number): number => {
  if (typeof value === 'number') return value;
  const parsed = parseInt(value as string, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper para pegar valores de config JSON
const getConfigValue = (key: string, defaultValue: any): any => {
  try {
    return key.split('.').reduce((obj: any, k: string) => obj?.[k], k6Config) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Configuração de API (from .env)
 */
export const apiConfig = {
  baseUrl: getEnvVar('API_BASE_URL', 'https://serverest.dev'),
  timeout: getEnvVar('API_TIMEOUT', '30s')
};

/**
 * Configuração de Testes de Performance (from k6.config.json)
 */
export const testConfig = {
  vus: getConfigValue('testConfig.vus.value', 5),
  duration: getConfigValue('testConfig.duration.value', '30s'),
  rampUp: getConfigValue('testConfig.rampUp.value', '10s')
};

/**
 * Configuração de Thresholds (from k6.config.json)
 */
export const thresholdConfig = {
  // Normal thresholds
  p95: getConfigValue('thresholds.p95_threshold.value', 500),
  p99: getConfigValue('thresholds.p99_threshold.value', 1000),
  
  // Stress thresholds
  stressP95: getConfigValue('thresholds.stress_p95_threshold.value', 1000),
  stressP99: getConfigValue('thresholds.stress_p99_threshold.value', 2000),
  
  // Error rates
  maxErrorRate: getConfigValue('errorRates.max_error_rate.value', 0.05),
  stressErrorRate: getConfigValue('errorRates.stress_error_rate.value', 0.1),
  smokeErrorRate: getConfigValue('errorRates.smoke_error_rate.value', 0.2),
  maxFailedChecksRate: getConfigValue('errorRates.max_failed_checks_rate.value', 0.05),
  
  // Check success rates
  checkSuccessRate: getConfigValue('checkSuccessRates.normal.value', 0.95),
  stressCheckSuccessRate: getConfigValue('checkSuccessRates.stress.value', 0.85),
  smokeCheckSuccessRate: getConfigValue('checkSuccessRates.smoke.value', 0.8)
};

/**
 * Códigos HTTP (from k6.config.json)
 */
export const httpStatus = {
  OK: getConfigValue('httpStatus.ok', 200),
  CREATED: getConfigValue('httpStatus.created', 201),
  BAD_REQUEST: getConfigValue('httpStatus.bad_request', 400),
  UNAUTHORIZED: getConfigValue('httpStatus.unauthorized', 401),
  FORBIDDEN: getConfigValue('httpStatus.forbidden', 403),
  NOT_FOUND: getConfigValue('httpStatus.not_found', 404),
  CONFLICT: getConfigValue('httpStatus.conflict', 409),
  INTERNAL_ERROR: getConfigValue('httpStatus.internal_error', 500)
};

/**
 * Delays entre requisições (from k6.config.json)
 */
export const delays = {
  SHORT: getConfigValue('delays.short.value', 100),
  MEDIUM: getConfigValue('delays.medium.value', 500),
  LONG: getConfigValue('delays.long.value', 1000)
};

/**
 * Endpoints da API (from k6.config.json)
 */
export const endpoints = {
  USERS: getConfigValue('endpoints.users', '/usuarios'),
  PRODUCTS: getConfigValue('endpoints.products', '/produtos'),
  LOGIN: getConfigValue('endpoints.login', '/login')
};

/**
 * Configuração K6 Cloud (from .env)
 */
export const k6CloudConfig = {
  projectId: parseEnvNumber(getEnvVar('K6_PROJECT_ID', 0), 0),
  projectName: getEnvVar('K6_PROJECT_NAME', 'ServeRest Performance Tests')
};

/**
 * Configuração de Segurança (from .env)
 */
export const securityConfig = {
  insecureSkipTLSVerify: getEnvVar('INSECURE_SKIP_TLS_VERIFY', 'true') === 'true'
};


