import { check, group } from 'k6';

/**
 * Valida se o status code está correto
 */
export function checkStatusCode(response: any, expectedStatus: number, checkName?: string): boolean {
  return check(response, {
    [checkName || `status is ${expectedStatus}`]: (r) => r.status === expectedStatus
  });
}

/**
 * Valida tempo de resposta
 */
export function checkResponseTime(response: any, maxDuration: number): boolean {
  return check(response, {
    [`response time < ${maxDuration}ms`]: (r) => (r.timings?.waiting || 0) < maxDuration
  });
}

/**
 * Agrupa múltiplos checks
 */
export function checkRequest(
  response: any,
  expectedStatus: number,
  maxDuration: number,
  checksMap?: Record<string, (r: any) => boolean>
): boolean {
  const baseChecks: Record<string, (r: any) => boolean> = {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`response time < ${maxDuration}ms`]: (r) => (r.timings?.waiting || 0) < maxDuration,
    'response is not empty': (r) => String(r.body).length > 0
  };
  
  if (checksMap) {
    Object.assign(baseChecks, checksMap);
  }
  
  return check(response, baseChecks);
}
