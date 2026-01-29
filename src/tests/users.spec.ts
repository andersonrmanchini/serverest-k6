import { check, group, sleep } from 'k6';
import { UserApiService } from '../services/user.api.service';
import { generateFakeUser } from '../utils/data.factory';
import { checkRequest } from '../utils/checks';
import { HTTP_STATUS, PERF_THRESHOLDS } from '../utils/constants';

const userService = new UserApiService();

/**
 * Teste de Performance - Endpoint: GET /usuarios
 * Simula listagem de usuários com diferentes volumes de dados
 * 
 * NOTA: ServeRest não aceita skip/limit como parâmetros de query.
 * Use apenas GET /usuarios sem parâmetros.
 */
export function listUsersTest() {
  group('GET /usuarios - List Users', () => {
    // Não usar skip/limit pois a API não os aceita
    const response = userService.listUsers();
    
    checkRequest(response, HTTP_STATUS.OK, PERF_THRESHOLDS.P95_DURATION, {
      'response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
      'response has quantidade field': (r) => {
        try {
          const json = JSON.parse(r.body);
          return 'quantidade' in json;
        } catch {
          return false;
        }
      },
      'response has usuarios array': (r) => {
        try {
          const json = JSON.parse(r.body);
          return Array.isArray(json.usuarios);
        } catch {
          return false;
        }
      }
    });
    
    // Simula tempo de processamento do usuário (think time)
    sleep(0.5);
  });
}

/**
 * Teste de Performance - Endpoint: GET /usuarios/{id}
 * Simula busca de usuário específico
 */
export function getUserByIdTest(userId?: string) {
  group('GET /usuarios/{id} - Get User By ID', () => {
    // Se não houver um ID específico, vamos listar e pegar o primeiro
    const listResponse = userService.listUsers();
    let id = userId;

    if (!id && listResponse.status === HTTP_STATUS.OK) {
      try {
        const json = JSON.parse(String(listResponse.body));
        if (json.usuarios && json.usuarios.length > 0) {
          id = json.usuarios[0]._id;
        }
      } catch {
        // Ignorar erro de parse
      }
    }

    if (id) {
      const response = userService.getUserById(id);
      
      checkRequest(response, HTTP_STATUS.OK, PERF_THRESHOLDS.P95_DURATION, {
        'response is valid JSON': (r) => {
          try {
            JSON.parse(r.body);
            return true;
          } catch {
            return false;
          }
        }
      });
      
      // Simula tempo de processamento do usuário (think time)
      sleep(0.5);
    }
  });
}

/**
 * Teste de Performance - Endpoint: POST /usuarios
 * Simula criação de novos usuários com dados únicos
 */
export function createUserTest() {
  group('POST /usuarios - Create User', () => {
    const newUser = generateFakeUser(false);
    
    const response = userService.createUser(newUser);
    
    checkRequest(response, HTTP_STATUS.CREATED, PERF_THRESHOLDS.P95_DURATION, {
      'response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
      'response has _id field': (r) => {
        try {
          const json = JSON.parse(r.body);
          return '_id' in json;
        } catch {
          return false;
        }
      }
    });
    
    // Simula tempo de processamento do usuário (think time)
    sleep(0.5);
  });
}

/**
 * Teste de Performance - Validação de taxa de erro
 * Monitora quantas requisições falharam
 */
export function validateErrorRate() {
  group('Error Rate Validation', () => {
    const response = userService.listUsers();
    
    check(response, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300,
      'no connection error': (r) => r.status !== 0
    });
    
    // Simula tempo de processamento do usuário (think time)
    sleep(0.5);
  });
}

/**
 * Cenário completo de testes de usuários
 */
export function userScenario() {
  listUsersTest();
  getUserByIdTest();
  createUserTest();
  validateErrorRate();
}

/**
 * Função padrão do k6 para execução do teste
 * Chamada automaticamente quando o arquivo é executado como script principal
 */
export default function () {
  userScenario();
}
