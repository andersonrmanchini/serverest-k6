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
 * Valida múltiplos status codes
 */
export function checkStatusCodeIn(response: any, expectedStatuses: number[]): boolean {
  return check(response, {
    'status is one of expected': (r) => expectedStatuses.includes(r.status)
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
 * Valida se o conteúdo da resposta contém um texto específico
 */
export function checkResponseContains(response: any, expectedText: string): boolean {
  return check(response, {
    [`response contains "${expectedText}"`]: (r) => String(r.body).includes(expectedText)
  });
}

/**
 * Valida JSON response
 */
export function checkJsonResponse(response: any): boolean {
  return check(response, {
    'response is valid JSON': (r) => {
      try {
        JSON.parse(String(r.body));
        return true;
      } catch {
        return false;
      }
    }
  });
}

/**
 * Valida se a resposta contém um campo específico
 */
export function checkJsonField(response: any, fieldPath: string): boolean {
  return check(response, {
    [`response has field "${fieldPath}"`]: (r) => {
      try {
        const json = JSON.parse(String(r.body));
        return fieldPath in json;
      } catch {
        return false;
      }
    }
  });
}

/**
 * Extrai valor de um campo JSON
 */
export function getJsonField(response: any, fieldPath: string): any {
  try {
    const json = JSON.parse(String(response.body));
    return json[fieldPath];
  } catch {
    return null;
  }
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
