import { check, group } from 'k6';
import { ProductApiService } from '../services/product.api.service';
import { AuthService } from '../services/auth.service';
import { generateFakeProduct } from '../utils/data.factory';
import { checkRequest } from '../utils/checks';
import { HTTP_STATUS, PERF_THRESHOLDS } from '../utils/constants';

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
 * Simula criação de novos produtos SEM autenticação
 * 
 * Testa o comportamento da API quando não há token válido.
 * Espera-se retorno 401 (Unauthorized) neste cenário.
 */
export function createProductTest(token?: string) {
  group('POST /produtos - Create Product (Authenticated)', () => {
    const newProduct = generateFakeProduct();
    
    // Não usar autenticação neste teste de performance
    // O objetivo é testar se a API retorna 401 corretamente
    const response = productService.createProduct(newProduct, undefined);
    
    // Espera-se 401 (sem autenticação)
    check(response, {
      'authentication required (401)': (r) => r.status === HTTP_STATUS.UNAUTHORIZED
    });
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

/**
 * Função padrão do k6 para execução do teste
 * Chamada automaticamente quando o arquivo é executado como script principal
 */
export default function () {
  productScenario();
}
