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
   * 
   * NOTA: ServeRest não aceita skip/limit como query parameters.
   * Os parâmetros skip e limit foram deprecados na API.
   */
  listUsers() {
    return this.api.get('/usuarios');
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
