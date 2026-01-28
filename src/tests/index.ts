import { sleep } from 'k6';
import { Options } from 'k6/options';
import { userScenario } from './users.spec';
import { productScenario } from './products.spec';
import { thresholds, smokeThresholds } from '../utils/thresholds';
import { testConfig, k6CloudConfig, securityConfig } from '../utils/config';

/**
 * Detecta tipo de teste baseado em variável de ambiente TEST_TYPE
 * Valores possíveis: smoke, load, stress, spike, soak, default
 */
const testType = (__ENV.TEST_TYPE || 'default') as 'smoke' | 'load' | 'stress' | 'spike' | 'soak' | 'default';

/**
 * Detecta se está rodando em ambiente CI
 * No CI, reduz carga para evitar instabilidade de rede
 */
const isCI = __ENV.CI_ENVIRONMENT === 'true';

/**
 * Configuração de Options do K6
 * Define scenarios com stages para cada tipo de teste
 * 
 * Configurações vêm de:
 * - k6.config.json (performance e thresholds)
 * - .env (API e secrets)
 */
export const options: Options = {
  // Scenarios com stages apropriados para cada tipo de teste
  scenarios: testType === 'smoke' ? {
    smoke_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 1 },   // Ramp-up para 1 VU
        { duration: '5s', target: 1 },   // Mantém 1 VU
        { duration: '5s', target: 0 }    // Ramp-down
      ],
      gracefulRampDown: '5s'
    }
  } : testType === 'load' ? {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: isCI ? [
        // CI: Reduz carga devido à instabilidade de rede
        { duration: '15s', target: 3 },   // Ramp-up mais suave
        { duration: '30s', target: 5 },   // Carga reduzida (50% do local)
        { duration: '30s', target: 5 },   // Mantém carga reduzida
        { duration: '15s', target: 0 }    // Ramp-down
      ] : [
        // Local: Carga normal
        { duration: '15s', target: 5 },   // Ramp-up gradual
        { duration: '30s', target: 10 },  // Aumenta para carga normal
        { duration: '30s', target: 10 },  // Mantém carga
        { duration: '15s', target: 0 }    // Ramp-down
      ],
      gracefulRampDown: '10s'
    }
  } : testType === 'stress' ? {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Warm-up
        { duration: '1m', target: 20 },   // Aumenta gradualmente
        { duration: '1m', target: 30 },   // Continua aumentando
        { duration: '1m', target: 40 },   // Aproxima do limite
        { duration: '1m', target: 50 },   // Atinge o limite
        { duration: '1m', target: 50 },   // Mantém no limite
        { duration: '30s', target: 0 }    // Ramp-down
      ],
      gracefulRampDown: '30s'
    }
  } : testType === 'spike' ? {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },  // Carga normal
        { duration: '10s', target: 100 }, // Spike súbito!
        { duration: '30s', target: 100 }, // Mantém pico
        { duration: '10s', target: 10 },  // Volta ao normal
        { duration: '10s', target: 0 }    // Ramp-down
      ],
      gracefulRampDown: '5s'
    }
  } : testType === 'soak' ? {
    soak_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },    // Ramp-up
        { duration: '26m', target: 20 },   // Mantém por longo período
        { duration: '2m', target: 0 }      // Ramp-down
      ],
      gracefulRampDown: '1m'
    }
  } : {
    // Default: usa configuração do k6.config.json
    default_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: testConfig.vus },
        { duration: testConfig.duration, target: testConfig.vus },
        { duration: '10s', target: 0 }
      ],
      gracefulRampDown: '10s'
    }
  },

  // Thresholds - critérios de sucesso/falha
  thresholds: testType === 'smoke' ? smokeThresholds : thresholds,

  // Configurações gerais
  noConnectionReuse: false,
  noVUConnectionReuse: false,
  insecureSkipTLSVerify: securityConfig.insecureSkipTLSVerify,
  
  // Extensões
  ext: {
    loadimpact: {
      projectID: k6CloudConfig.projectId,
      name: k6CloudConfig.projectName
    }
  }
};

/**
 * Função principal de execução do teste
 * Executa os cenários de usuários e produtos em paralelo
 */
export default function () {
  // Executa teste de usuários
  userScenario();
  
  // Pequeno delay entre requisições para simular comportamento real
  sleep(1);
  
  // Executa teste de produtos
  productScenario();
  
  // Delay antes da próxima iteração
  sleep(1);
}

/**
 * Tipos de teste disponíveis:
 * 
 * - SMOKE (1 VU, 10s): Validação rápida - stages com warm-up suave
 * - LOAD (10 VUs, 1m): Comportamento sob carga normal - ramp-up/down gradual
 * - STRESS (50 VUs, 5m): Encontra limite - aumenta progressivamente até 50 VUs
 * - SPIKE (100 VUs, 1m): Picos repentinos - sobe rápido de 10 para 100 VUs
 * - SOAK (20 VUs, 30m): Longa duração - mantém carga constante por muito tempo
 * 
 * Cada tipo usa stages otimizados para simular padrões realistas de tráfego.
 */
