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
  // Local: taxa de falha < 1% (rigoroso)
  // CI: taxa de falha < 15% (latência de rede e instabilidade maior no GitHub Actions)
  'http_req_failed': [isCI ? `rate<0.15` : `rate<0.01`],
  'http_req_duration': [
    // CI: permite latências maiores devido à rede
    isCI ? `p(95)<${thresholdConfig.p95 * 2}` : `p(95)<${thresholdConfig.p95}`,
    isCI ? `p(99)<${thresholdConfig.p99 * 2}` : `p(99)<${thresholdConfig.p99}`
  ],
  'http_req_tls_handshaking': [isCI ? 'p(95)<200' : 'p(95)<100'],
  'http_req_waiting': [isCI ? `p(95)<${thresholdConfig.p95 * 2}` : `p(95)<${thresholdConfig.p95}`],
  // Checks: 95% local, 85% no CI (mais permissivo devido a timeouts/falhas de rede)
  'checks': [isCI ? 'rate>0.85' : `rate>${thresholdConfig.checkSuccessRate}`]
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
  'http_req_failed': [isCI ? `rate<0.15` : `rate<${thresholdConfig.smokeErrorRate}`],
  'checks': [isCI ? 'rate>0.85' : `rate>${thresholdConfig.smokeCheckSuccessRate}`]
};
