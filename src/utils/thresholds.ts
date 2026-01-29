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
  // GitHub Actions + API pública = alta instabilidade (rede, latência, compartilhamento)
  // Local: taxa de falha < 10% (realista para ambiente de desenvolvimento)
  // CI: taxa de falha < 30% (realista para GitHub Actions observado em múltiplas execuções)
  'http_req_failed': [isCI ? `rate<0.30` : `rate<0.10`],
  'http_req_duration': [
    // CI: permite latências muito maiores devido à rede GitHub Actions
    isCI ? `p(95)<${thresholdConfig.p95 * 3}` : `p(95)<${thresholdConfig.p95}`,
    isCI ? `p(99)<${thresholdConfig.p99 * 3}` : `p(99)<${thresholdConfig.p99}`
  ],
  'http_req_tls_handshaking': [isCI ? 'p(95)<300' : 'p(95)<100'],
  'http_req_waiting': [isCI ? `p(95)<${thresholdConfig.p95 * 3}` : `p(95)<${thresholdConfig.p95}`],
  // Checks: 95% local, 80% no CI (realista para ambiente CI)
  'checks': [isCI ? 'rate>0.80' : `rate>${thresholdConfig.checkSuccessRate}`]
};

export const stressThresholds = {
  'http_reqs': ['count > 0'],
  // Stress test: encontra limites do sistema
  // Stress + GitHub Actions = alta taxa de falhas esperada
  // Local: 10% (mais rigoroso)
  // CI: 40% (realista para stress em ambiente CI)
  'http_req_failed': [isCI ? 'rate<0.40' : `rate<${thresholdConfig.stressErrorRate}`],
  'http_req_duration': [
    // CI: permite latências muito maiores sob stress
    isCI ? `p(95)<${thresholdConfig.stressP95 * 4}` : `p(95)<${thresholdConfig.stressP95}`,
    isCI ? `p(99)<${thresholdConfig.stressP99 * 4}` : `p(99)<${thresholdConfig.stressP99}`
  ],
  // Checks: 85% local, 75% CI (stress é esperado falhar mais)
  'checks': [isCI ? 'rate>0.75' : `rate>${thresholdConfig.stressCheckSuccessRate}`]
};

export const spikeThresholds = {
  'http_reqs': ['count > 0'],
  // Spike test: picos súbitos de tráfego
  // Spike + GitHub Actions = muitas falhas esperadas
  // Local: 15% (esperado algumas falhas no pico)
  // CI: 45% (realista para spike em ambiente CI)
  'http_req_failed': [isCI ? 'rate<0.45' : 'rate<0.15'],
  'http_req_duration': [
    // CI: latências extremamente altas durante spike
    isCI ? `p(95)<${thresholdConfig.p95 * 5}` : `p(95)<${thresholdConfig.p95 * 2}`,
    isCI ? `p(99)<${thresholdConfig.p99 * 5}` : `p(99)<${thresholdConfig.p99 * 2}`
  ],
  // Checks: 80% local, 70% CI (spike causa muitas falhas)
  'checks': [isCI ? 'rate>0.70' : 'rate>0.80']
};

export const smokeThresholds = {
  'http_reqs': ['count > 0'],
  // Smoke test: validação rápida, mais permissivo
  // Local: 20% (configurado em k6.config.json)
  // CI: 30% (realista para GitHub Actions)
  'http_req_failed': [isCI ? `rate<0.30` : `rate<${thresholdConfig.smokeErrorRate}`],
  // Checks: 80% no CI (realista para validação rápida)
  'checks': [isCI ? 'rate>0.80' : `rate>${thresholdConfig.smokeCheckSuccessRate}`]
};
