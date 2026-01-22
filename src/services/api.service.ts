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

  constructor(baseUrl: string = apiConfig.baseUrl, timeout: string = apiConfig.timeout) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  /**
   * Executa uma requisição GET
   */
  get(endpoint: string, params?: Record<string, any>) {
    const url = this.buildUrl(endpoint, params);
    
    return http.get(url, {
      timeout: this.defaultTimeout,
      tags: { name: endpoint, method: 'GET' }
    });
  }

  /**
   * Executa uma requisição POST
   */
  post(endpoint: string, payload: any, headers?: Record<string, string>) {
    const url = this.buildUrl(endpoint);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    return http.post(url, JSON.stringify(payload), {
      headers: defaultHeaders,
      timeout: this.defaultTimeout,
      tags: { name: endpoint, method: 'POST' }
    });
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
    
    return http.put(url, JSON.stringify(payload), {
      headers: defaultHeaders,
      timeout: this.defaultTimeout,
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
    
    return http.del(url, null, {
      headers: defaultHeaders,
      timeout: this.defaultTimeout,
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
