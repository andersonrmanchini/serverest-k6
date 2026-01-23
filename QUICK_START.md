# 🚀 Quick Reference Card

## Executar Testes

```bash
# Todos os testes com relatórios
npm run test:all

# Individual
npm run test:report:smoke      # 1 VU, 10s
npm run test:report:load       # 10 VUs, 1m
npm run test:report:stress     # 50 VUs, 2m

# Apenas compilar (sem executar)
npm run build
```

---

## Ver Relatórios

Localização: `test-results/report-*.html`

**Abrir no navegador:**
```bash
# Windows PowerShell
start test-results\report-smoke.html
start test-results\report-load.html
start test-results\report-stress.html
```

---

## Resultados Esperados

| Teste | VUs | Duração | Taxa Sucesso | Latência P95 | Status |
|-------|-----|---------|--------------|--------------|--------|
| Smoke | 1 | 10s | 100% | 227ms | ✅ |
| Load | 10 | 1m | 89% | 245ms | ✅ |
| Stress | 50 | 2m | 62% | 679ms | ⚠️ |

---

## Arquivos Importantes

```
📂 Raiz
├── package.json              → NPM scripts (20 commands)
├── tsconfig.json            → TypeScript config
├── k6.config.json           → k6 settings
│
├── 📂 src/
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── product.api.service.ts
│   │   ├── user.api.service.ts
│   │   └── auth.service.ts  ✨ NOVO
│   │
│   ├── tests/
│   │   ├── index.ts
│   │   ├── products.spec.ts (modificado)
│   │   └── users.spec.ts
│   │
│   └── utils/
│       ├── checks.ts
│       ├── config.ts
│       ├── constants.ts
│       ├── data.factory.ts
│       └── thresholds.ts
│
├── 📂 scripts/
│   ├── analyze-failures.js   ✨ NOVO
│   └── generate-report.js
│
├── 📂 test-results/
│   ├── report-smoke.html
│   ├── report-load.html
│   └── report-stress.html
│
├── 📂 .github/workflows/
│   └── ci.yml                → GitHub Actions
│
├── 📄 README.md              → Início rápido
├── 📄 COMPLETE_GUIDE.md      ✨ NOVO (300+ linhas)
├── 📄 CICD_SETUP.md          ✨ NOVO (200+ linhas)
└── 📄 STATUS.md              ✨ NOVO (checklist + resultados)
```

---

## Troubleshooting Rápido

### Erro: "Failed to list resources"
```bash
npm run build    # Recompilar
```

### Erro: "Connection refused"
```bash
# Verificar se API está disponível
curl https://serverest.dev/health
```

### Erro: "401 Unauthorized"
```bash
# Esperado! AuthService cuida disso automaticamente
# Se ocorrer, verificar config.ts: EMAIL e PASSWORD
```

### Teste lento/timeout
```bash
# Aumentar timeout em k6.config.json
batch: {
  maxConnections: 100,
  timeout: 60000  // aumentado de 30000
}
```

---

## Commits Recentes

```
640cf93 - docs: Add comprehensive project status
32080e2 - feat: Complete k6 test suite with auth + load/stress tests
```

Clique em SHA para ver detalhes: `git show 32080e2`

---

## Próximos Passos

1. **Push para GitHub**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Verificar GitHub Actions**
   - Ir para: GitHub → Actions → Latest Run
   - Download relatórios em Artifacts

3. **Executar Soak Test** (opcional, 30 minutos)
   ```bash
   npm run test:soak
   npm run report:generate-soak
   ```

4. **Implementar Retry Logic** (próxima iteração)
   - Adicionar em `src/services/api.service.ts`
   - Configurar: 3 retries com exponential backoff

---

## Contatos & Recursos

**Documentação Completa:**
- [COMPLETE_GUIDE.md](COMPLETE_GUIDE.md) - Guia detalhado de testes
- [CICD_SETUP.md](CICD_SETUP.md) - GitHub Actions configuration
- [STATUS.md](STATUS.md) - Status e resultados

**Recursos Externos:**
- k6 Documentation: https://k6.io/docs
- ServeRest API: https://serverest.dev
- GitHub Actions: https://github.com/features/actions

---

## Legenda

✅ = Tudo bem / Completo  
⚠️ = Aviso / Esperado  
❌ = Erro / Problema  
✨ = Novo / Modificado  
🔄 = Em progresso  
⏳ = Pendente  

---

**Atualizado:** 23 de Janeiro, 2026  
**Versão:** 1.0.0  
**Licença:** MIT
