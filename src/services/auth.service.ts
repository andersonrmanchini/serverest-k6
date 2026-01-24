import { ApiService } from './api.service';

/**
 * Serviço de Autenticação
 * Gerencia login e geração de tokens para testes autenticados
 */
export class AuthService {
  private api: ApiService;
  private cachedToken: string | null = null;
  private cachedEmail: string | null = null;
  private static instance: AuthService | null = null;
  private static tokenCache: Map<string, string> = new Map();

  constructor(baseUrl?: string) {
    this.api = new ApiService(baseUrl);
  }

  /**
   * Obtém instância singleton do AuthService
   */
  static getInstance(baseUrl?: string): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(baseUrl);
    }
    return AuthService.instance;
  }

  /**
   * Realiza login e retorna o token de autenticação
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Token JWT ou null se falhar
   */
  login(email: string, password: string): string | null {
    // Retornar cache se mesmo usuário
    if (this.cachedEmail === email && this.cachedToken) {
      return this.cachedToken;
    }

    const payload = {
      email: email,
      password: password
    };

    try {
      const response = this.api.post('/login', payload);
      
      if (response.status === 200) {
        try {
          const json = JSON.parse(response.body as string);
          if (json.authorization) {
            this.cachedToken = json.authorization;
            this.cachedEmail = email;
            return json.authorization;
          }
        } catch (e) {
          return null;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Cria um novo usuário admin para testes
   * Retorna o usuário criado com ID e token
   */
  createAdminUser(): { email: string; password: string; token: string | null } {
    const timestamp = Date.now();
    const email = `admin-${timestamp}@test.com`;
    const password = `AdminPass${timestamp}`;

    const payload = {
      nome: 'Admin Test User',
      email: email,
      password: password,
      administrador: 'true'
    };

    try {
      const response = this.api.post('/usuarios', payload);
      
      if (response.status === 201) {
        // Fazer login com o novo usuário
        const token = this.login(email, password);
        return {
          email: email,
          password: password,
          token: token
        };
      }
    } catch (e) {
      // Ignorar erros
    }

    return {
      email: email,
      password: password,
      token: null
    };
  }

  /**
   * Retorna o token em cache
   */
  getToken(): string | null {
    return this.cachedToken;
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cachedToken = null;
    this.cachedEmail = null;
  }
}
