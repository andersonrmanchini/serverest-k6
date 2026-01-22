# 🎯 Quick Start: Relatórios

Guia rápido para começar a usar os relatórios HTML dos testes.

## ⚡ 30 Segundos

```bash
# 1. Rodar testes e gerar relatório
npm run test:report

# 2. Abrir no navegador
npm run report:open
```

**Pronto!** 📊 Seu relatório está aberto no navegador.

## 🔥 Comando Direto

Se quiser gerar relatório de um teste que já rodou:

```bash
# Gerar relatório a partir de dados existentes
node scripts/generate-report.js test-results/results.json test-results/report.html
```

## 📂 Estrutura de Relatórios

Cada tipo de teste gera seu próprio relatório:

| Teste | Comando | Relatório |
|-------|---------|-----------|
| Padrão | `npm run test:report` | `report.html` |
| Smoke | `npm run test:report:smoke` | `report-smoke.html` |
| Carga | (automático em develop) | `report-load.html` |
| Stress | (automático 2 AM UTC) | `report-stress.html` |

## 🌐 No GitHub Actions

Os relatórios são automaticamente:
1. ✅ Gerados após cada teste
2. 📤 Enviados como artifacts
3. 📥 Disponíveis para download

**Onde baixar:**
1. Acesse **Actions** → seu workflow
2. Clique em **Artifacts**
3. Baixe `k6-test-results-*`

## 📊 O que Você Verá

```
Dashboard
├── 📊 Requisições HTTP (total e taxa/s)
├── ❌ Taxa de Falha (%)
├── ✅ Taxa de Checks (%)
├── 👥 VUs Máximo
├── ⏱️ Duração Média (ms)
└── 📊 Percentis (P95, P99)

Checks
├── ✓ Check 1 - 100% passed
├── ✓ Check 2 - 98% passed
└── ✗ Check 3 - 80% passed (⚠️)
```

## 💡 Interpretação Rápida

### Status Badge

- 🟢 **PASSOU** - Tudo ok, métricas saudáveis
- 🔴 **FALHOU** - Problemas detectados

### Cores das Métricas

| Cor | Significado | Ação |
|-----|-------------|------|
| 🟢 Verde | OK (≥95%) | ✅ Aprovado |
| 🟡 Amarelo | Atenção (80-95%) | ⚠️ Monitorar |
| 🔴 Vermelho | Crítico (<80%) | ❌ Investigar |

## 🔧 Troubleshooting Rápido

### "Relatório vazio"
```bash
npm run test:report     # Rodar testes
npm run report:generate # Gerar relatório
```

### "Não consigo abrir o relatório"
```bash
# Windows
start test-results/report.html

# macOS
open test-results/report.html

# Linux
xdg-open test-results/report.html
```

### "Taxa de erro alta"
1. Verifique `API_BASE_URL` em `.env`
2. Confirme se a API está respondendo:
   ```bash
   curl https://serverest.dev
   ```
3. Tente novamente com menos VUs:
   ```bash
   npm run test:smoke
   ```

## 📚 Documentação Completa

Para informações detalhadas, veja [REPORTS.md](REPORTS.md)

---

**Dica Pro:** 💡 Salve relatórios de diferentes execuções para comparar tendências!
