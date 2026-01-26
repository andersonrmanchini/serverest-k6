import { ApiService } from './api.service';
import { Product } from '../utils/data.factory';

/**
 * Serviço para operações com produtos
 */
export class ProductApiService {
  private api: ApiService;

  constructor(baseUrl?: string) {
    this.api = new ApiService(baseUrl);
  }

  /**
   * Lista todos os produtos
   * GET /produtos
   * 
   * NOTA: ServeRest não aceita skip/limit como query parameters.
   * Os parâmetros skip e limit foram deprecados na API.
   */
  listProducts() {
    return this.api.get('/produtos');
  }

  /**
   * Busca produto por ID
   * GET /produtos/{id}
   */
  getProductById(id: string) {
    return this.api.get(`/produtos/${id}`);
  }

  /**
   * Cria novo produto
   * POST /produtos
   * Requer autenticação
   */
  createProduct(product: Product, token?: string) {
    const headers = token ? { 'Authorization': token } : undefined;
    // Usar allowAllStatus=true para não contar 401 como erro quando autenticação falha
    return this.api.post('/produtos', product, headers, true);
  }

  /**
   * Atualiza produto existente
   * PUT /produtos/{id}
   * Requer autenticação
   */
  updateProduct(id: string, product: Partial<Product>, token?: string) {
    const headers = token ? { 'Authorization': token } : undefined;
    return this.api.put(`/produtos/${id}`, product, headers);
  }

  /**
   * Deleta produto
   * DELETE /produtos/{id}
   * Requer autenticação
   */
  deleteProduct(id: string, token?: string) {
    const headers = token ? { 'Authorization': token } : undefined;
    return this.api.delete(`/produtos/${id}`, headers);
  }
}
