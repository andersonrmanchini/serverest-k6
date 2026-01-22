import { ApiService } from './api.service';
import { User } from '../utils/data.factory';

/**
 * Serviço para operações com usuários
 */
export class UserApiService {
  private api: ApiService;

  constructor(baseUrl?: string) {
    this.api = new ApiService(baseUrl);
  }

  /**
   * Lista todos os usuários
   * GET /usuarios
   */
  listUsers(skip?: number, limit?: number) {
    const params: Record<string, any> = {};
    
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;
    
    return this.api.get('/usuarios', params);
  }

  /**
   * Busca usuário por ID
   * GET /usuarios/{id}
   */
  getUserById(id: string) {
    return this.api.get(`/usuarios/${id}`);
  }

  /**
   * Cria novo usuário
   * POST /usuarios
   */
  createUser(user: User) {
    return this.api.post('/usuarios', user);
  }

  /**
   * Atualiza usuário existente
   * PUT /usuarios/{id}
   */
  updateUser(id: string, user: Partial<User>) {
    return this.api.put(`/usuarios/${id}`, user);
  }

  /**
   * Deleta usuário
   * DELETE /usuarios/{id}
   */
  deleteUser(id: string) {
    return this.api.delete(`/usuarios/${id}`);
  }
}
