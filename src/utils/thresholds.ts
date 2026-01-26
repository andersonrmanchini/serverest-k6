/**
 * Configuração de thresholds para o teste de performance
 * Thresholds definem critérios de sucesso/falha do teste
 * 
 * Importa valores do .env via config.ts
 */
import { thresholdConfig } from './config';

export const thresholds = {
  'http_reqs': ['count > 0'],
  // http_req_failed: 401 de testes de autenticação são esperados (~15% do total)
  // Threshold ajustado para 20% para permitir esses casos válidos
  'http_req_failed': [`rate<0.20`],
  'http_req_duration': [
    `p(95)<${thresholdConfig.p95}`,
    `p(99)<${thresholdConfig.p99}`
  ],
  'http_req_tls_handshaking': ['p(95)<100'],
  'http_req_waiting': [`p(95)<${thresholdConfig.p95}`],
  'checks': [`rate>${thresholdConfig.checkSuccessRate}`]
};

export const stressThresholds = {
  'http_reqs': ['count > 0'],
  'http_req_failed': [`rate<${thresholdConfig.stressErrorRate}`],
  'http_req_duration': [
    `p(95)<${thresholdConfig.stressP95}`,
    `p(99)<${thresholdConfig.stressP99}`
  ],
  'checks': [`rate>${thresholdConfig.stressCheckSuccessRate}`]
};

export const smokeThresholds = {
  'http_reqs': ['count > 0'],
  'http_req_failed': [`rate<${thresholdConfig.smokeErrorRate}`],
  'checks': [`rate>${thresholdConfig.smokeCheckSuccessRate}`]
};
