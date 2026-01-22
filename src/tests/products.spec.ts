import { check, group } from 'k6';
import { ProductApiService } from '../services/product.api.service';
import { generateFakeProduct, generateFakeProducts } from '../utils/data.factory';
import { 
  checkRequest,
  checkResponseTime,
  getJsonField
} from '../utils/checks';
import { ENDPOINTS, HTTP_STATUS, PERF_THRESHOLDS } from '../utils/constants';

const productService = new ProductApiService();

/**
 * Teste de Performance - Endpoint: GET /produtos
 * Simula listagem de produtos com diferentes volumes de dados
 */
export function listProductsTest() {
  group('GET /produtos - List Products', () => {
    const response = productService.listProducts(0, 10);
    
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
 * Teste de Performance - Endpoint: GET /produtos/{id}
 * Simula busca de produto específico
 */
export function getProductByIdTest(productId?: string) {
  group('GET /produtos/{id} - Get Product By ID', () => {
    // Se não houver um ID específico, vamos listar e pegar o primeiro
    const listResponse = productService.listProducts(0, 1);
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
 * Simula criação de novos produtos
 * 
 * Nota: Este teste pode falhar se a API requer autenticação
 * Para habilitar, será necessário adicionar lógica de login
 */
export function createProductTest(token?: string) {
  group('POST /produtos - Create Product', () => {
    const newProduct = generateFakeProduct();
    
    const response = productService.createProduct(newProduct, token);
    
    // Status pode ser 201 ou 401 (se requer autenticação)
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
      check(response, {
        'authentication required (401)': (r) => r.status === HTTP_STATUS.UNAUTHORIZED
      });
    }
  });
}

/**
 * Teste de Performance com Paginação
 * Testa diferentes tamanhos de página para verificar impacto na performance
 */
export function paginationTest() {
  group('Pagination Performance', () => {
    const pageSizes = [10, 25, 50];
    
    pageSizes.forEach(pageSize => {
      const response = productService.listProducts(0, pageSize);
      
      check(response, {
        [`pagination with limit=${pageSize} returns 200`]: (r) => r.status === HTTP_STATUS.OK,
        [`pagination with limit=${pageSize} response time < 1000ms`]: (r) => r.timings.duration < 1000
      });
    });
  });
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
