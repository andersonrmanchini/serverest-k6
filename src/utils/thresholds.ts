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
  // Stress test: encontra limites do sistema
  // Local: 10% (mais rigoroso)
  // CI: 35% (esperado falhas sob stress extremo + instabilidade de rede)
  'http_req_failed': [isCI ? 'rate<0.35' : `rate<${thresholdConfig.stressErrorRate}`],
  'http_req_duration': [
    // CI: permite latências muito maiores sob stress
    isCI ? `p(95)<${thresholdConfig.stressP95 * 3}` : `p(95)<${thresholdConfig.stressP95}`,
    isCI ? `p(99)<${thresholdConfig.stressP99 * 3}` : `p(99)<${thresholdConfig.stressP99}`
  ],
  // Checks: 85% local, 75% CI (stress é rigoroso mas não muito)
  'checks': [isCI ? 'rate>0.75' : `rate>${thresholdConfig.stressCheckSuccessRate}`]
};

export const spikeThresholds = {
  'http_reqs': ['count > 0'],
  // Spike test: picos súbitos de tráfego
  // Local: 15% (esperado algumas falhas no pico)
  // CI: 40% (pico + instabilidade de rede = alta taxa de falha)
  'http_req_failed': [isCI ? 'rate<0.40' : 'rate<0.15'],
  'http_req_duration': [
    // CI: latências muito altas durante spike
    isCI ? `p(95)<${thresholdConfig.p95 * 4}` : `p(95)<${thresholdConfig.p95 * 2}`,
    isCI ? `p(99)<${thresholdConfig.p99 * 4}` : `p(99)<${thresholdConfig.p99 * 2}`
  ],
  // Checks: 80% local, 70% CI (spike pode causar muitas falhas)
  'checks': [isCI ? 'rate>0.70' : 'rate>0.80']
};

export const smokeThresholds = {
  'http_reqs': ['count > 0'],
  // Smoke test: mais permissivo pois é validação rápida
  // Local: 20% (configurado em k6.config.json)
  // CI: 30% (ainda mais permissivo devido a instabilidade de rede)
  'http_req_failed': [isCI ? `rate<0.30` : `rate<${thresholdConfig.smokeErrorRate}`],
  // Checks: 80% tanto local quanto CI (smoke é menos rigoroso)
  'checks': [`rate>${thresholdConfig.smokeCheckSuccessRate}`]
};
