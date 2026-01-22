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
   */
  listProducts(skip?: number, limit?: number) {
    const params: Record<string, any> = {};
    
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;
    
    return this.api.get('/produtos', params);
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
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
    return this.api.post('/produtos', product, headers);
  }

  /**
   * Atualiza produto existente
   * PUT /produtos/{id}
   * Requer autenticação
   */
  updateProduct(id: string, product: Partial<Product>, token?: string) {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
    return this.api.put(`/produtos/${id}`, product, headers);
  }

  /**
   * Deleta produto
   * DELETE /produtos/{id}
   * Requer autenticação
   */
  deleteProduct(id: string, token?: string) {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
    return this.api.delete(`/produtos/${id}`, headers);
  }
}
