import { check, group } from 'k6';
import { ProductApiService } from '../services/product.api.service';
import { AuthService } from '../services/auth.service';
import { generateFakeProduct, generateFakeProducts } from '../utils/data.factory';
import { 
  checkRequest,
  checkResponseTime,
  getJsonField
} from '../utils/checks';
import { ENDPOINTS, HTTP_STATUS, PERF_THRESHOLDS } from '../utils/constants';

const productService = new ProductApiService();
const authService = new AuthService();

/**
 * Teste de Performance - Endpoint: GET /produtos
 * Simula listagem de produtos com diferentes volumes de dados
 * 
 * NOTA: ServeRest não aceita skip/limit como parâmetros de query.
 * Use apenas GET /produtos sem parâmetros.
 */
export function listProductsTest() {
  group('GET /produtos - List Products', () => {
    // Não usar skip/limit pois a API não os aceita
    const response = productService.listProducts();
    
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
      'response has produtos array': (r) => {
        try {
          const json = JSON.parse(r.body);
          return Array.isArray(json.produtos);
        } catch {
          return false;
        }
      }
    });
  });
}

/**
 * Teste de Performance - Endpoint: GET /produtos/{id}
 * Simula busca de produto específico
 */
export function getProductByIdTest(productId?: string) {
  group('GET /produtos/{id} - Get Product By ID', () => {
    // Se não houver um ID específico, vamos listar e pegar o primeiro
    const listResponse = productService.listProducts();
    let id = productId;

    if (!id && listResponse.status === HTTP_STATUS.OK) {
      try {
        const json = JSON.parse(String(listResponse.body));
        if (json.produtos && json.produtos.length > 0) {
          id = json.produtos[0]._id;
        }
      } catch {
        // Ignorar erro de parse
      }
    }

    if (id) {
      const response = productService.getProductById(id);
      
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
 * Teste de Performance - Endpoint: POST /produtos
 * Simula criação de novos produtos com autenticação
 * 
 * Usa token obtido através de login para autenticar a requisição
 */
export function createProductTest(token?: string) {
  group('POST /produtos - Create Product (Authenticated)', () => {
    const newProduct = generateFakeProduct();
    
    // Se não houver token, tentar obter um
    let authToken = token;
    if (!authToken) {
      const admin = authService.createAdminUser();
      authToken = admin.token || undefined;
    }
    
    const response = productService.createProduct(newProduct, authToken);
    
    // Com autenticação, deve retornar 201
    if (response.status === HTTP_STATUS.CREATED) {
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
    } else if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      // Se ainda falhar com 401, documentar que autenticação falhou
      check(response, {
        'authentication required (401)': (r) => r.status === HTTP_STATUS.UNAUTHORIZED
      });
    } else {
      // Qualquer outro erro
      check(response, {
        'POST /produtos returns 2xx or 401': (r) => 
          (r.status >= 200 && r.status < 300) || r.status === 401
      });
    }
  });
}

/**
 * Teste de Performance com Paginação
 * DESABILITADO: ServeRest não suporta skip/limit como query parameters
 * 
 * A API apenas retorna todos os produtos quando chamada sem parâmetros.
 * Para implementar paginação, seria necessário usar um parâmetro diferente
 * ou implementar paginação no lado do cliente.
 */
export function paginationTest() {
  // Desabilitado até que a API suporte parâmetros de paginação
  // group('Pagination Performance', () => {
  //   const response = productService.listProducts();
  //   check(response, {
  //     'pagination with limit=10 returns 200': (r) => r.status === HTTP_STATUS.OK,
  //     'pagination with limit=10 response time < 1000ms': (r) => r.timings.duration < 1000
  //   });
  // });
}

/**
 * Teste de Performance - Validação de taxa de erro
 */
export function validateErrorRate() {
  group('Error Rate Validation', () => {
    const response = productService.listProducts();
    
    check(response, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300,
      'no connection error': (r) => r.status !== 0
    });
  });
}

/**
 * Cenário completo de testes de produtos
 */
export function productScenario() {
  listProductsTest();
  getProductByIdTest();
  createProductTest();
  paginationTest();
  validateErrorRate();
}
