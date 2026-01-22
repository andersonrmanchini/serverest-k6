/**
 * Tipos essenciais para k6
 * Definições minimalistas para suportar a compilação TypeScript
 */

declare module 'k6' {
  export function sleep(seconds: number): void;
  export function check(
    val: any,
    sets: Record<string, (val: any) => boolean>,
    tags?: Record<string, string>
  ): boolean;
  export function group(name: string, fn: () => void): void;
}

declare module 'k6/http' {
  export function get(url: string, params?: any): any;
  export function post(url: string, body?: any, params?: any): any;
  export function put(url: string, body?: any, params?: any): any;
  export function patch(url: string, body?: any, params?: any): any;
  export function del(url: string, params?: any): any;
  export function head(url: string, params?: any): any;
}

declare module 'k6/options' {
  export interface Options {
    vus?: number;
    duration?: string;
    stages?: Array<{ duration: string; target: number }>;
    thresholds?: Record<string, string[]>;
    [key: string]: any;
  }
}

