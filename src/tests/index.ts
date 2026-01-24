import { sleep } from 'k6';
import { Options } from 'k6/options';
import { userScenario } from './users.spec';
import { productScenario } from './products.spec';
import { thresholds, smokeThresholds } from '../utils/thresholds';
import { testConfig, k6CloudConfig, securityConfig } from '../utils/config';

// Detecta qual tipo de teste está rodando pelos args da CLI
// k6 passa VUs via linha de comando como: k6 run ... --vus 1 --duration 10s
// Para isso, verificamos se está rodando um smoke test baseado em duração curta
const durationMs = testConfig.duration.match(/\d+/)?.[0];
const isSmoke = durationMs && parseInt(durationMs) <= 10; // 10s ou menos = smoke

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

  // Thresholds - critérios de sucesso/falha (escolhe baseado no tipo de teste)
  // Se detectar smoke test (duração <= 10s), usa smokeThresholds com tolerância maior
  thresholds: isSmoke ? smokeThresholds : thresholds,

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
