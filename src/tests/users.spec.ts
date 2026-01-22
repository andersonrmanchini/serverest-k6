import { check, group } from 'k6';
import { UserApiService } from '../services/user.api.service';
import { generateFakeUser, generateFakeUsers } from '../utils/data.factory';
import { 
  checkStatusCode, 
  checkResponseTime, 
  checkJsonResponse,
  checkRequest 
} from '../utils/checks';
import { ENDPOINTS, HTTP_STATUS, PERF_THRESHOLDS } from '../utils/constants';

const userService = new UserApiService();

/**
 * Teste de Performance - Endpoint: GET /usuarios
 * Simula listagem de usuários com diferentes volumes de dados
 */
export function listUsersTest() {
  group('GET /usuarios - List Users', () => {
    const response = userService.listUsers(0, 10);
    
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
      }
    });
  });
}

/**
 * Teste de Performance - Endpoint: GET /usuarios/{id}
 * Simula busca de usuário específico
 */
export function getUserByIdTest(userId?: string) {
  group('GET /usuarios/{id} - Get User By ID', () => {
    // Se não houver um ID específico, vamos listar e pegar o primeiro
    const listResponse = userService.listUsers(0, 1);
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
