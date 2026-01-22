# 🚀 Quick Reference

## Primeiros Passos (2 minutos)

```bash
# 1. Setup
cp .env.example .env
npm install

# 2. Rodar testes
npm run test

# 3. Customizar (opcional)
# Edite k6.config.json para alterar VUS, P95, etc
```

## Estrutura de Configuração

```
.env (sensível)           k6.config.json (público)
├─ API_BASE_URL     →     ├─ testConfig (VUS, DURATION)
├─ K6_PROJECT_ID          ├─ thresholds (P95, P99)
└─ INSECURE_SKIP_TLS      ├─ errorRates (máximas)
                          └─ checkSuccessRates (mínimas)
```

## Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `npm run test` | Teste padrão (5 VUs, 30s) |
| `npm run test:smoke` | Validação rápida |
| `npm run test:stress` | Teste de stress |
| `k6 run src/tests/index.ts` | Rodar diretamente |

## Alterar Configuração

1. Abra `k6.config.json`
2. Edite o valor em `testConfig`, `thresholds`, etc
3. Execute: `npm run test`
4. Commit com motivo claro

## GitHub Secrets (depois)

Crie 3 secrets:
- `API_BASE_URL` → sua URL prod
- `K6_PROJECT_ID` → seu ID
- `INSECURE_SKIP_TLS_VERIFY` → false

E use no workflow:
```yaml
env:
  API_BASE_URL: ${{ secrets.API_BASE_URL }}
  K6_PROJECT_ID: ${{ secrets.K6_PROJECT_ID }}
  INSECURE_SKIP_TLS_VERIFY: ${{ secrets.INSECURE_SKIP_TLS_VERIFY }}
```

---

👉 Para documentação completa, veja [README.md](README.md)
