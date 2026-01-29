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
  // Com sleeps de 0.5s entre requisições (think time), a estabilidade melhora significativamente
  // Local: taxa de falha < 10% (realista para ambiente de desenvolvimento)
  // CI: taxa de falha < 20% (reduzido de 35% após implementar sleeps)
  'http_req_failed': [isCI ? `rate<0.20` : `rate<0.10`],
  'http_req_duration': [
    // CI: permite latências maiores devido à rede
    isCI ? `p(95)<${thresholdConfig.p95 * 2}` : `p(95)<${thresholdConfig.p95}`,
    isCI ? `p(99)<${thresholdConfig.p99 * 2}` : `p(99)<${thresholdConfig.p99}`
  ],
  'http_req_tls_handshaking': [isCI ? 'p(95)<200' : 'p(95)<100'],
  'http_req_waiting': [isCI ? `p(95)<${thresholdConfig.p95 * 2}` : `p(95)<${thresholdConfig.p95}`],
  // Checks: 95% local, 85% no CI (mais rigoroso após implementar sleeps)
  'checks': [isCI ? 'rate>0.85' : `rate>${thresholdConfig.checkSuccessRate}`]
};

export const stressThresholds = {
  'http_reqs': ['count > 0'],
  // Stress test: encontra limites do sistema
  // Com sleeps, reduzimos os thresholds
  // Local: 10% (mais rigoroso)
  // CI: 30% (reduzido de 35% após implementar sleeps)
  'http_req_failed': [isCI ? 'rate<0.30' : `rate<${thresholdConfig.stressErrorRate}`],
  'http_req_duration': [
    // CI: permite latências muito maiores sob stress
    isCI ? `p(95)<${thresholdConfig.stressP95 * 3}` : `p(95)<${thresholdConfig.stressP95}`,
    isCI ? `p(99)<${thresholdConfig.stressP99 * 3}` : `p(99)<${thresholdConfig.stressP99}`
  ],
  // Checks: 85% local, 80% CI (mais rigoroso após sleeps)
  'checks': [isCI ? 'rate>0.80' : `rate>${thresholdConfig.stressCheckSuccessRate}`]
};

export const spikeThresholds = {
  'http_reqs': ['count > 0'],
  // Spike test: picos súbitos de tráfego
  // Com sleeps, ainda mantemos permissivo pois spike causa instabilidade
  // Local: 15% (esperado algumas falhas no pico)
  // CI: 35% (reduzido de 40% após implementar sleeps)
  'http_req_failed': [isCI ? 'rate<0.35' : 'rate<0.15'],
  'http_req_duration': [
    // CI: latências muito altas durante spike
    isCI ? `p(95)<${thresholdConfig.p95 * 4}` : `p(95)<${thresholdConfig.p95 * 2}`,
    isCI ? `p(99)<${thresholdConfig.p99 * 4}` : `p(99)<${thresholdConfig.p99 * 2}`
  ],
  // Checks: 80% local, 75% CI (mais rigoroso após sleeps)
  'checks': [isCI ? 'rate>0.75' : 'rate>0.80']
};

export const smokeThresholds = {
  'http_reqs': ['count > 0'],
  // Smoke test: mais permissivo pois é validação rápida
  // Com sleeps, reduzimos os thresholds
  // Local: 20% (configurado em k6.config.json)
  // CI: 25% (reduzido de 30% após implementar sleeps)
  'http_req_failed': [isCI ? `rate<0.25` : `rate<${thresholdConfig.smokeErrorRate}`],
  // Checks: 85% no CI (mais rigoroso após sleeps)
  'checks': [isCI ? 'rate>0.85' : `rate>${thresholdConfig.smokeCheckSuccessRate}`]
};
