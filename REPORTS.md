# 📊 Guia de Relatórios de Testes

Sistema de geração de relatórios HTML para testes de performance k6, similar ao Playwright Report.

## 🚀 Uso Local

### Gerar Relatório

```bash
# Rodar testes e gerar relatório
npm run test:report

# Ou para teste smoke (mais rápido)
npm run test:report:smoke
```

### Visualizar Relatório

```bash
# Abrir automaticamente no navegador
npm run report:open

# Ou abrir manualmente
# Windows: start test-results/report.html
# macOS: open test-results/report.html
# Linux: xdg-open test-results/report.html
```

## 📈 Estrutura do Relatório

O relatório HTML inclui:

### Métricas Principais
- 📊 **Requisições HTTP** - Total de requisições e taxa por segundo
- ❌ **Taxa de Falha** - Porcentagem de requisições que falharam
- ✅ **Taxa de Checks** - Percentual de checks que passaram
- 👥 **VUs Máximo** - Número máximo de usuários virtuais
- ⏱️ **Duração Média** - Tempo médio de resposta
- 📊 **Percentis** - P95 e P99 (latência em diferentes percentis)

### Detalhes de Checks
Lista todos os checks executados com:
- ✓ Número de passes
- ✗ Número de falhas
- 📊 Taxa de sucesso (%)

### Status Geral
- 🟢 **PASSOU** - Todos os critérios atendidos (≥95% de checks)
- 🔴 **FALHOU** - Critérios não atendidos (<95% de checks)

## 🔄 CI/CD Integration

Relatórios são gerados automaticamente em:

### Principais Branch
**`main` e `develop`**
- ✅ Teste padrão (5 VUs, 30s) → `report.html`
- 📈 Teste de carga (10 VUs, 1m) → `report-load.html` (apenas develop)

### Scheduled
**Diariamente às 2 AM UTC**
- 🔥 Teste de stress (50 VUs, 5m) → `report-stress.html`

## 📥 Baixar Relatórios do GitHub

1. Acesse seu repositório
2. **Actions** → selecione o workflow desejado
3. **Artifacts** → baixe `k6-test-results-*`
4. Extraia o arquivo ZIP
5. Abra `report.html` no navegador

## 📁 Arquivos Gerados

```
test-results/
├── results.json              # Dados brutos (formato k6)
├── results-load.json         # Dados de carga
├── results-stress.json       # Dados de stress
│
├── report.html               # Relatório principal
├── report-load.html          # Relatório de carga
└── report-stress.html        # Relatório de stress
```

## 🎨 Recursos do Relatório

### Design
- 🌙 Dark theme profissional (similar ao Playwright)
- 📱 Responsivo (funciona em mobile)
- ⚡ Carregamento rápido (HTML puro, sem dependências)

### Cores
- 🟢 **Verde** - Métricas ok (✓ ≥95%)
- 🟡 **Amarelo** - Atenção (⚠️ 80-95%)
- 🔴 **Vermelho** - Crítico (✗ <80%)

## 🔧 Customizar Relatório

O script de geração está em `scripts/generate-report.js`:

```javascript
// Para adicionar novas métricas, modifique:
metrics.seu_campo = valor;

// Para alterar cores, edite a seção de CSS:
.success { color: #10b981; }  // Verde
.warning { color: #f59e0b; }  // Amarelo
.error { color: #ef4444; }    // Vermelho
```

## 📊 Interpretando Resultados

### Exemplo de Relatório "PASSOU" ✅

```
Requisições: 200 (6.67/s)
Taxa de Falha: 1.5%
Taxa de Checks: 98.5%
```

**Análise:**
- ✅ Todas as métricas estão saudáveis
- ✅ Taxa de erro abaixo do limite (5%)
- ✅ Checks acima do mínimo (95%)
- 🟢 **Teste aprovado**

### Exemplo de Relatório "FALHOU" ❌

```
Requisições: 150 (5.0/s)
Taxa de Falha: 8.0%
Taxa de Checks: 92.0%
```

**Análise:**
- ❌ Taxa de erro acima do limite (5%)
- ⚠️ Checks abaixo do mínimo (95%)
- 🔴 **Teste não aprovado - investigar**

## 🐛 Troubleshooting

### Relatório não é gerado

```bash
# Verificar se os testes geraram JSON
ls -la test-results/results.json

# Gerar relatório manualmente
node scripts/generate-report.js test-results/results.json test-results/report.html
```

### Relatório vazio ou com dados incorretos

1. Verifique se o teste foi executado:
   ```bash
   npm run test
   ```

2. Confirme que há dados em `test-results/results.json`:
   ```bash
   cat test-results/results.json | head -20
   ```

3. Gere o relatório novamente:
   ```bash
   npm run report:generate
   ```

### Erro ao abrir no navegador

- Windows: Use `start test-results/report.html`
- macOS: Use `open test-results/report.html`
- Linux: Use `xdg-open test-results/report.html`

## 📈 Próximos Passos

- [ ] Rodar `npm run test:report` localmente
- [ ] Abrir `test-results/report.html` no navegador
- [ ] Fazer um push para GitHub
- [ ] Baixar relatório do Actions artifact
- [ ] Compartilhar com o time

---

## ✨ Dicas

1. **Comparar resultados** - Salve relatórios de diferentes execuções
2. **Monitorar trends** - Acompanhe como as métricas evoluem ao longo do tempo
3. **Analisar P95/P99** - Indica performance da maioria dos usuários
4. **Verificar checks** - Cada check que falha aponta um problema específico
