/**
 * Configuração de thresholds para o teste de performance
 * Thresholds definem critérios de sucesso/falha do teste
 * 
 * Importa valores do .env via config.ts
 */
import { thresholdConfig } from './config';

// Detecta se está rodando em ambiente CI
const isCI = __ENV.CI_ENVIRONMENT === 'true';

export const thresholds = {
  'http_reqs': ['count > 0'],
  // Apenas cenários positivos com autenticação válida
  // Esperamos taxa de falha próxima a 0% (permitindo até 1% para flutuações da rede)
  // Em CI, permite até 5% por causa de latência de rede maior
  'http_req_failed': [isCI ? `rate<0.05` : `rate<0.01`],
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
  'http_req_failed': [isCI ? `rate<0.05` : `rate<${thresholdConfig.smokeErrorRate}`],
  'checks': [`rate>${thresholdConfig.smokeCheckSuccessRate}`]
};
