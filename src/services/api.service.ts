import http from 'k6/http';
import { apiConfig } from '../utils/config';

/**
 * Serviço base para requisições HTTP
 * Encapsula a lógica de requisições com configurações padrão
 * 
 * Usa configurações do .env via config.ts
 */
export class ApiService {
  private baseUrl: string;
  private defaultTimeout: string;
  private isCI: boolean;

  constructor(baseUrl: string = apiConfig.baseUrl, timeout: string = apiConfig.timeout) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
    this.isCI = __ENV.CI_ENVIRONMENT === 'true';
  }

  /**
   * Executa uma requisição GET
   */
  get(endpoint: string, params?: Record<string, any>) {
    const url = this.buildUrl(endpoint, params);
    
    // No CI, aumenta timeout e usa configuração mais robusta
    const timeout = this.isCI ? '60s' : this.defaultTimeout;
    
    return http.get(url, {
      timeout: timeout,
      tags: { name: endpoint, method: 'GET' }
    });
  }

  /**
   * Executa uma requisição POST
   * @param endpoint Endpoint da API
   * @param payload Dados a enviar
   * @param headers Headers opcionais
   * @param allowAllStatus Se true, não marca 4xx/5xx como erro
   */
  post(endpoint: string, payload: any, headers?: Record<string, string>, allowAllStatus: boolean = false) {
    const url = this.buildUrl(endpoint);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    // No CI, aumenta timeout para lidar com latência maior
    const timeout = this.isCI ? '60s' : this.defaultTimeout;
    
    const options: any = {
      headers: defaultHeaders,
      timeout: timeout,
      tags: { name: endpoint, method: 'POST' }
    };
    
    // Se allowAllStatus=true, considera qualquer status como sucesso (não marca como erro)
    if (allowAllStatus) {
      options.validateStatus = (status: number) => true;
    }
    
    return http.post(url, JSON.stringify(payload), options);
  }

  /**
   * Executa uma requisição PUT
   */
  put(endpoint: string, payload: any, headers?: Record<string, string>) {
    const url = this.buildUrl(endpoint);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    // No CI, aumenta timeout para lidar com latência maior
    const timeout = this.isCI ? '60s' : this.defaultTimeout;
    
    return http.put(url, JSON.stringify(payload), {
      headers: defaultHeaders,
      timeout: timeout,
      tags: { name: endpoint, method: 'PUT' }
    });
  }

  /**
   * Executa uma requisição DELETE
   */
  delete(endpoint: string, headers?: Record<string, string>) {
    const url = this.buildUrl(endpoint);
    const defaultHeaders = {
      ...headers
    };
    
    // No CI, aumenta timeout para lidar com latência maior
    const timeout = this.isCI ? '60s' : this.defaultTimeout;
    
    return http.del(url, null, {
      headers: defaultHeaders,
      timeout: timeout,
      tags: { name: endpoint, method: 'DELETE' }
    });
  }

  /**
   * Construi a URL completa com query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const queryParams = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`)
        .join('&');
      
      if (queryParams) {
        url += `?${queryParams}`;
      }
    }
    
    return url;
  }
}
