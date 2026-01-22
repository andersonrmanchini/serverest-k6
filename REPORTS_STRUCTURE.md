# 📂 Estrutura de Relatórios - Visão Geral

## 🗂️ Arquivos Criados/Modificados

```
serverest-k6/
│
├── 📜 scripts/
│   └── generate-report.js          ← ✨ NOVO: Gerador de relatórios HTML
│
├── 📊 .github/workflows/
│   └── ci.yml                      ← 🔄 MODIFICADO: Adiciona jobs de relatórios
│
├── 📦 package.json                 ← 🔄 MODIFICADO: Scripts npm atualizados
│
├── 📚 Documentação
│   ├── START_REPORTS.md            ← ✨ NOVO: Resumo executivo
│   ├── QUICK_REPORT.md             ← ✨ NOVO: Quick start (30s)
│   ├── REPORTS.md                  ← ✨ NOVO: Documentação completa
│   ├── REPORTS_IMPLEMENTATION.md   ← ✨ NOVO: Detalhes técnicos
│   ├── GITHUB_SETUP.md             ← Existente: Setup GitHub
│   └── README.md                   ← 🔄 MODIFICADO: Integração reports
│
└── 📁 test-results/
    ├── results.json                (gerado dinamicamente)
    ├── results-load.json           (gerado dinamicamente)
    ├── results-stress.json         (gerado dinamicamente)
    ├── report.html                 (gerado dinamicamente)
    ├── report-load.html            (gerado dinamicamente)
    └── report-stress.html          (gerado dinamicamente)
```

---

## 🔄 Workflow CI/CD

### Jobs Automáticos

#### 1. **Push para main/develop**
```
Trigger: git push
    ↓
├─ Build (TypeScript → JS)
├─ Install dependencies
├─ Run tests (k6) → results.json
├─ Generate HTML report
└─ Upload artifacts (30 dias)
```

#### 2. **Pull Request para main**
```
Trigger: GitHub PR
    ↓
├─ Testes obrigatórios
├─ Gera relatório
├─ Comenta resultado no PR
└─ Bloqueia merge se falhar
```

#### 3. **Scheduled (2 AM UTC)**
```
Trigger: Cron job
    ↓
├─ Stress test (50 VUs, 5m)
├─ Gera relatório-stress.html
├─ Upload artifact
└─ Cria issue se falhar
```

---

## 📊 Fluxo de Dados

```
k6 testes
    ↓
--out json=results.json
    ↓
    ├─ Arquivo JSON
    │  (métricas brutas)
    │
scripts/generate-report.js
    ↓
Parser JSON
    ├─ Extrai métricas
    ├─ Processa checks
    └─ Calcula percentuais
    ↓
Gerador HTML
    ├─ Aplica CSS
    ├─ Monta dashboard
    └─ Salva report.html
    ↓
Navegador
    ├─ Visualiza
    ├─ Compartilha
    └─ Analisa
```

---

## 📋 Scripts npm

### Testes + Relatórios
```bash
npm run test:report         # Performance (5VUs) + relatório
npm run test:report:smoke   # Smoke (1VU) + relatório
```

### Relatórios Apenas
```bash
npm run report:generate         # Gerar do results.json existente
npm run report:generate-smoke   # Gerar do results-smoke.json
npm run report:open             # Abrir no navegador
```

---

## 🎨 Relatório HTML

### Estrutura do HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Dark theme com gradientes */
      /* CSS responsivo */
    </style>
  </head>
  <body>
    <header>
      <h1>Relatório k6</h1>
      <status-badge>✅ PASSOU</status-badge>
    </header>
    
    <metrics-grid>
      <card>Requisições: 66</card>
      <card>Taxa Falha: 81.81%</card>
      <card>Taxa Checks: 100%</card>
      <card>VUs Max: 2</card>
      <card>Duração Média: 192ms</card>
      <card>P95: 250.82ms</card>
    </metrics-grid>
    
    <checks-list>
      <check>Status 200 ✓ 100%</check>
      <check>Response < 1s ✓ 100%</check>
      <check>Data Valid ✓ 100%</check>
    </checks-list>
  </body>
</html>
```

---

## 🎯 Métricas Exibidas

### Dashboard Principal (6 cards)
1. **📊 Requisições HTTP** - Total + taxa/s
2. **❌ Taxa de Falha** - Percentage de falhas
3. **✅ Taxa de Checks** - Percentage sucesso
4. **👥 VUs Máximo** - Virtual users pico
5. **⏱️ Duração Média** - Response time average
6. **📊 Percentis** - P95 e P99

### Seção de Checks
- Nome do check
- Passes e failures
- Taxa de sucesso (%)
- Cor indicativa (verde/amarelo/vermelho)

### Status Geral
- Badge ✅/❌
- Timestamp de geração
- Interpretação automática

---

## 🔍 Onde Encontrar Tudo

| O que você quer | Arquivo | Ir para |
|-----------------|---------|--------|
| **Começar AGORA** | START_REPORTS.md | [Aqui](START_REPORTS.md) |
| **Guia rápido (5m)** | QUICK_REPORT.md | [Aqui](QUICK_REPORT.md) |
| **Documentação completa** | REPORTS.md | [Aqui](REPORTS.md) |
| **Detalhes técnicos** | REPORTS_IMPLEMENTATION.md | [Aqui](REPORTS_IMPLEMENTATION.md) |
| **Setup GitHub** | GITHUB_SETUP.md | [Aqui](GITHUB_SETUP.md) |
| **Ver o HTML** | test-results/report.html | Local |
| **Código do gerador** | scripts/generate-report.js | [Aqui](scripts/generate-report.js) |

---

## ✅ Checklist de Implementação

### Fase 1: Código
- [x] Script gerador criado (`scripts/generate-report.js`)
- [x] Templates HTML profissionais
- [x] Parser de JSON k6
- [x] Sem dependências externas

### Fase 2: Integração
- [x] Scripts npm adicionados (`package.json`)
- [x] CI/CD atualizado (`.github/workflows/ci.yml`)
- [x] Jobs para smoke, load, stress
- [x] Upload de artifacts

### Fase 3: Documentação
- [x] Quick start (QUICK_REPORT.md)
- [x] Documentação completa (REPORTS.md)
- [x] Resumo executivo (START_REPORTS.md)
- [x] Detalhes técnicos (REPORTS_IMPLEMENTATION.md)
- [x] README integrado

### Fase 4: Validação
- [x] Testado localmente
- [x] HTML gerado corretamente
- [x] Navegador visualiza
- [x] Commits realizados

---

## 🚀 Próximos Passos

### Hoje
1. [ ] Ler [START_REPORTS.md](START_REPORTS.md)
2. [ ] Rodar `npm run test:report:smoke`
3. [ ] Abrir relatório no navegador

### Esta Semana
1. [ ] Push para GitHub
2. [ ] Verificar GitHub Actions
3. [ ] Baixar artifacts
4. [ ] Compartilhar com o time

### Futuro
1. [ ] Monitorar tendências
2. [ ] Customizar thresholds
3. [ ] Integrar em dashboards
4. [ ] Automações avançadas

---

## 🎓 Exemplos de Uso

### Você quer... | Execute...
|---|---|
| Teste rápido com relatório | `npm run test:report:smoke && npm run report:open` |
| Teste completo com relatório | `npm run test:report && npm run report:open` |
| Gerar relatório manualmente | `node scripts/generate-report.js test-results/results.json test-results/report.html` |
| Ver JSON bruto | `cat test-results/results.json \| head -50` |
| Listar relatórios | `ls test-results/*.html` |

---

## 💡 Dicas Pro

1. **Salvar Histórico**: Copie relatórios antigos com nomes descritivos
   ```bash
   cp test-results/report.html test-results/report-2026-01-22.html
   ```

2. **Comparar**: Abra 2 relatórios lado-a-lado no navegador

3. **Compartilhar**: O HTML é portável, envie por email/Slack

4. **Integrar**: Adicione links nos PRs automaticamente

5. **Monitorar**: Acompanhe P95/P99 como KPIs

---

**Tudo pronto para começar!** 🎉

Próxima ação: [Leia START_REPORTS.md](START_REPORTS.md)
