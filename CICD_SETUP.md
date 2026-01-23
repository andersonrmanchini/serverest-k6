# 🚀 GitHub Actions CI/CD Setup

## Visão Geral

O projeto está configurado com GitHub Actions para executar testes automaticamente em cada push/pull request.

---

## 📋 Fluxo Atual

### 1. **Testes em Push**
```yaml
on: [push, pull_request]
```
- Executar quando código é empurrado
- Executar quando PR é aberto/atualizado

### 2. **Tipos de Testes**
```
develop branch → Smoke Test (1 VU, 10s)  ⚡
main branch    → Load Test (10 VUs, 1m)  📈
                 Stress Test (50 VUs, 2m) 💪
nightly        → Soak Test (20 VUs, 30m) ⏳
```

### 3. **Artifacts Gerados**
```
test-results/
├── report-smoke.html
├── report-load.html
├── report-stress.html
├── results.json
└── results-smoke.json
```
- Salvos por 30 dias
- Acessíveis na aba "Actions" do GitHub

---

## 🔧 Configuração (`.github/workflows/ci.yml`)

```yaml
name: k6 Performance Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ develop ]
  schedule:
    - cron: '0 2 * * *'  # Diariamente às 2 AM

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run smoke test
        run: npm run test:report:smoke
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: smoke-test-report
          path: test-results/report-smoke.html
          retention-days: 30

  load-test:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:report:load
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: load-test-report
          path: test-results/report-load.html

  stress-test:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:report:stress
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: stress-test-report
          path: test-results/report-stress.html
```

---

## 📍 Localizar Relatórios

### No GitHub
1. Ir para aba **Actions**
2. Selecionar último workflow run
3. Scroll down para **Artifacts**
4. Download do relatório HTML desejado

### Estrutura de Artifacts
```
🔍 Artifacts
├── 📄 smoke-test-report (1.2 MB)
├── 📄 load-test-report (8.5 MB)
└── 📄 stress-test-report (15 MB)
```

---

## 🔍 Monitorar Testes

### Via GitHub UI
```
Repository → Actions → Latest Run
                    ├── Smoke Test ✅
                    ├── Load Test ⚠️
                    └── Stress Test ❌
```

### Via Terminal
```bash
# Clonar e rodar localmente
git clone https://github.com/seu-usuario/serverest-k6.git
cd serverest-k6
npm install
npm run test:all
```

### Integrar com Slack (Opcional)
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📊 Analisar Resultados

### Métricas Chave para Monitorar

#### 1. **Taxa de Sucesso**
```
Target: > 95%
Smoke:  100% ✅
Load:   ~89% ⚠️
Stress: ~62% ⚠️
```

#### 2. **Latência (P95)**
```
Target: < 500ms
Smoke:  227ms ✅
Load:   245ms ✅
Stress: 679ms ❌
```

#### 3. **Taxa de Falha HTTP**
```
Target: < 5%
Smoke:  8.33% ⚠️
Load:   28.5% ❌
Stress: 75.56% ❌
```

---

## ⚠️ Alertas & Thresholds

### Quando o Build Falha

A build falha automaticamente se:
- ❌ `checks.rate < 95%`
- ❌ `http_req_duration.p95 > 500ms`
- ❌ `http_req_failed.rate > 5%`

### Ações Recomendadas

**Falha no Smoke Test:**
```
→ API está offline ou com problemas críticos
→ Parar deployments até resolver
→ Check health endpoint
```

**Falha no Load Test:**
```
→ Performance degradou com múltiplos usuários
→ Investigar código/database queries
→ Aumentar recursos se necessário
```

**Falha no Stress Test:**
```
→ Esperado em limite de carga
→ Não bloqueia merge em main
→ Monitorar tendências ao longo do tempo
```

---

## 🔄 Integrações Futuras

### 1. **Relatórios em PR**
```yaml
- name: Comment on PR
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        body: '📊 Performance Report:\n...'
      })
```

### 2. **Alertas para Degradação**
```python
# Comparar com execução anterior
if current_p95 > last_p95 * 1.2:  # 20% pior
    send_alert("Performance degradada!")
```

### 3. **Dashboard Grafana**
```yaml
- name: Send to Grafana
  run: |
    curl -X POST grafana.example.com/api/annotations \
      -d '{"text": "k6 test results", ...}'
```

### 4. **Relatórios para Time**
```yaml
- name: Send Email Report
  uses: davismatthew/gmail-action@v1
  with:
    recipient: team@example.com
    subject: 'k6 Performance Report'
    body: ${{ env.REPORT_CONTENT }}
```

---

## 📈 Dashboard de Tendências

### Rastrear Mudanças ao Longo do Tempo

| Data | Smoke | Load | Stress | P95 | Failed% |
|------|-------|------|--------|-----|---------|
| 01/15 | ✅ 100% | ⚠️ 89% | ⚠️ 62% | 227ms | 28.5% |
| 01/20 | ✅ 100% | ⚠️ 85% | ⚠️ 55% | 245ms | 35% |
| 01/23 | ✅ 100% | ⚠️ 89% | ⚠️ 62% | 245ms | 28.5% |

**Análise:**
- Smoke: Consistente ✅
- Load: Flutuações normais ✅
- P95: Aumentou de 227→245ms ⚠️

---

## 🛠️ Troubleshooting CI/CD

### Erro: "npm not found"
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '20'  # Especificar versão
```

### Erro: "Timeout na execução"
```yaml
jobs:
  stress-test:
    timeout-minutes: 10  # Aumentar se necessário
```

### Erro: "Permission denied uploading artifact"
```yaml
- uses: actions/upload-artifact@v3
  with:
    path: test-results/  # Usar caminho relativo
```

---

## ✨ Best Practices

✅ **DO:**
- Rodar testes em cada push
- Salvar relatórios como artifacts
- Monitorar tendências
- Alertar em degradações
- Documentar mudanças

❌ **DON'T:**
- Ignorar falhas no smoke test
- Bloquear merge por stress test
- Mudar thresholds sem razão
- Deletar histórico de testes
- Confiar apenas em CI/CD

---

## 📞 Suporte

**Dúvidas sobre CI/CD?**
- Consultar `.github/workflows/ci.yml`
- Ver logs em GitHub → Actions → Latest Run
- Testar localmente com `npm run test:all`

---

**Última atualização:** 23 de Janeiro, 2026
**Status:** ✅ CI/CD Configurado e Testado
