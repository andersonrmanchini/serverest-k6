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
  // Local: taxa de falha < 10% (realista para ambiente de desenvolvimento com recursos limitados)
  // CI: taxa de falha < 25% (instabilidade severa de rede no GitHub Actions - observado 21.38%)
  'http_req_failed': [isCI ? `rate<0.25` : `rate<0.10`],
  'http_req_duration': [
    // CI: permite latências maiores devido à rede
    isCI ? `p(95)<${thresholdConfig.p95 * 2}` : `p(95)<${thresholdConfig.p95}`,
    isCI ? `p(99)<${thresholdConfig.p99 * 2}` : `p(99)<${thresholdConfig.p99}`
  ],
  'http_req_tls_handshaking': [isCI ? 'p(95)<200' : 'p(95)<100'],
  'http_req_waiting': [isCI ? `p(95)<${thresholdConfig.p95 * 2}` : `p(95)<${thresholdConfig.p95}`],
  // Checks: 95% local, 80% no CI (mais permissivo devido a instabilidade severa)
  'checks': [isCI ? 'rate>0.80' : `rate>${thresholdConfig.checkSuccessRate}`]
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
  'http_req_failed': [isCI ? `rate<0.25` : `rate<${thresholdConfig.smokeErrorRate}`],
  'checks': [isCI ? 'rate>0.80' : `rate>${thresholdConfig.smokeCheckSuccessRate}`]
};
