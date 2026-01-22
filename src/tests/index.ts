import { sleep } from 'k6';
import { Options } from 'k6/options';
import { userScenario } from './users.spec';
import { productScenario } from './products.spec';
import { thresholds, scenarioOptions } from '../utils/thresholds';
import { testConfig, k6CloudConfig, securityConfig } from '../utils/config';

/**
 * Configuração de Options do K6
 * Define parâmetros de execução do teste
 * 
 * Configurações vêm de:
 * - k6.config.json (performance e thresholds)
 * - .env (API e secrets)
 */
export const options: Options = {
  // Configuração de Virtual Users (VUs) e Duração
  vus: testConfig.vus,
  duration: testConfig.duration,

  // Thresholds - critérios de sucesso/falha
  thresholds: thresholds,

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
 * Cenários alternativos podem ser definidos aqui
 * 
 * Exemplo de uso com múltiplos cenários:
 * 
 * export const options: Options = {
 *   scenarios: {
 *     smoke: {
 *       executor: 'ramping-vus',
 *       stages: [
 *         { duration: '10s', target: 1 },
 *         { duration: '10s', target: 0 },
 *       ],
 *       thresholds: smokeThresholds,
 *     },
 *     load: {
 *       executor: 'ramping-vus',
 *       stages: [
 *         { duration: '30s', target: 10 },
 *         { duration: '1m', target: 10 },
 *         { duration: '30s', target: 0 },
 *       ],
 *       thresholds: thresholds,
 *     },
 *   }
 * };
 */
