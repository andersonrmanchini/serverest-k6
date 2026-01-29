import { check, group, sleep } from 'k6';
import { ProductApiService } from '../services/product.api.service';
import { AuthService } from '../services/auth.service';
import { generateFakeProduct } from '../utils/data.factory';
import { checkRequest } from '../utils/checks';
import { HTTP_STATUS, PERF_THRESHOLDS } from '../utils/constants';

const productService = new ProductApiService();
const authService = new AuthService();

// Credenciais fixas de admin para testes de performance
// Simula usuário real que já existe no sistema
const ADMIN_EMAIL = 'fulano@qa.com';
const ADMIN_PASSWORD = 'teste';

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
    
    // Simula tempo de processamento do usuário (think time)
    sleep(0.5);
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
      
      // Simula tempo de processamento do usuário (think time)
      sleep(0.5);
    }
  });
}

/**
 * Teste de Performance - Endpoint: POST /produtos
 * Simula criação de novos produtos COM autenticação válida
 * 
 * Representa cenário real onde usuário autenticado cria produtos.
 * Espera-se retorno 201 (Created) com sucesso.
 */
export function createProductWithAuthTest() {
  group('POST /produtos - Create Product (Authenticated)', () => {
    // 1. Autenticar com usuário admin existente
    const token = authService.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    
    // 2. Criar produto com token válido
    if (token) {
      const newProduct = generateFakeProduct();
      const response = productService.createProduct(newProduct, token);
      
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
    }
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
    
    // Simula tempo de processamento do usuário (think time)
    sleep(0.5);
  });
}

/**
 * Cenário completo de testes de produtos
 * Apenas cenários positivos que simulam uso real do sistema
 */
export function productScenario() {
  listProductsTest();
  getProductByIdTest();
  createProductWithAuthTest();
  validateErrorRate();
}

/**
 * Função padrão do k6 para execução do teste
 * Chamada automaticamente quando o arquivo é executado como script principal
 */
export default function () {
  productScenario();
}
