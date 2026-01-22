# ServeRest Performance Tests com k6

Performance testing suite para a API [ServeRest](https://serverest.dev/) utilizando k6, uma ferramenta moderna de teste de carga e performance.

## 📚 Índice

1. [Funcionalidades](#funcionalidades)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Executando Testes](#executando-testes)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Tipos de Teste](#tipos-de-teste)
7. [Interpretando Resultados](#interpretando-resultados)
8. [Git Workflow & CI/CD](#git-workflow--cicd)
9. [GitHub Secrets](#github-secrets)
10. [Troubleshooting](#troubleshooting)

---

## ✨ Funcionalidades

- **Testes de Performance:** Carga, stress, spike e soak com TypeScript
- **Configurações Centralizadas:** `.env` (sensível) + `k6.config.json` (performance)
- **Checks Automáticos:** Validação de status, taxa de erro, duração e sucesso
- **Data Factory:** Geração de dados realistas para usuários e produtos
- **Múltiplos Cenários:** Testes para usuários, produtos e testes integrados
- **CI/CD Pronto:** Integração com GitHub Actions via secrets

## 🛠️ Pré-requisitos

- Node.js 20.x ou superior
- NPM ou Yarn
- k6 (instalado via npm devDependencies)

## 🚀 Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd serverest-k6

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
```

## 🔧 Configuração

Este projeto usa **2 arquivos de configuração**:

### 📋 `.env` (git ignored)

Contém **apenas** informações sensíveis:

```env
API_BASE_URL=https://serverest.dev        # URL da API
API_TIMEOUT=30s                             # Timeout padrão
K6_PROJECT_ID=0                             # ID projeto k6 Cloud
K6_PROJECT_NAME=ServeRest Performance Tests # Nome projeto
INSECURE_SKIP_TLS_VERIFY=true              # Flag TLS (dev only)
CI_ENVIRONMENT=false                        # Flag CI/CD
```

**Nota:** Use `.env.example` como template, não commite `.env`

### 📊 `k6.config.json` (versionado)

Contém **todas** as configurações de performance (totalmente documentado):

| Configuração | Valor | Descrição |
|---|---|---|
| `testConfig.vus` | 5 | Virtual Users simultâneos |
| `testConfig.duration` | 30s | Duração total do teste |
| `testConfig.rampUp` | 10s | Tempo de aumento gradual |
| `thresholds.p95` | 500 | P95 threshold (ms) |
| `thresholds.p99` | 1000 | P99 threshold (ms) |
| `errorRates.maxErrorRate` | 0.05 | Taxa máxima erro (5%) |
| `checkSuccessRates.normal` | 0.95 | Taxa mínima sucesso (95%) |

**Para alterar:** Edite `k6.config.json` → Os valores são aplicados automaticamente

---

## 🧪 Executando Testes

### Teste Padrão (5 VUs, 30 segundos)
```bash
npm run test
```

### Outros Tipos
```bash
npm run test:smoke      # Validação rápida (1 VU, 10s)
npm run test:load       # Carga normal (10 VUs, 1m)
npm run test:stress     # Encontrar limite (50 VUs, 5m)
npm run test:spike      # Picos de tráfego (100 VUs, 1m)
npm run test:soak       # Longa duração (20 VUs, 30m)
```

### Testes Específicos
```bash
npm run test:users      # Apenas usuários
npm run test:products   # Apenas produtos
```

### Teste com Configuração Customizada
```bash
# Altere os valores em k6.config.json, depois:
k6 run src/tests/index.ts

# Ou use variáveis de ambiente:
k6 run -e API_BASE_URL=https://seu-api.com src/tests/index.ts
```

---

## 📁 Estrutura do Projeto

```
src/
├── tests/
│   ├── index.ts              # Suite principal + configuração
│   ├── users.spec.ts         # Testes de usuários
│   └── products.spec.ts      # Testes de produtos
├── services/
│   ├── api.service.ts        # Serviço HTTP base
│   ├── user.api.service.ts   # Endpoints de usuários
│   └── product.api.service.ts # Endpoints de produtos
└── utils/
    ├── config.ts             # Lê .env + k6.config.json
    ├── constants.ts          # Constantes tipadas
    ├── thresholds.ts         # Thresholds dinâmicos
    ├── checks.ts             # Checks reutilizáveis
    └── data.factory.ts       # Geração de dados fake

k6.config.json                 # Configurações de performance
.env.example                   # Template .env
.env                          # Variáveis sensíveis (git ignored)
```

---

## 🎯 Tipos de Teste

| Tipo | VUs | Duração | Propósito |
|------|-----|---------|-----------|
| **Smoke** | 1 | 10s | Validação rápida de resposta |
| **Load** | 10 | 1m | Comportamento sob carga normal |
| **Stress** | 50 | 5m | Encontrar limite da aplicação |
| **Spike** | 100 | 1m | Picos repentinos de tráfego |
| **Soak** | 20 | 30m | Problemas de longa duração |

---

## 📊 Interpretando Resultados

Exemplo de saída:

```
checks..................: 98.5% ✓ 197 ✗ 3
   ✓ status is 200         95.0%
   ✓ response time ok       98.5%

http_reqs..............: 200     6.67/s
http_req_duration......: avg=150ms p(95)=400ms p(99)=750ms
http_req_failed........: 1.5%

thresholds:
   ✓ http_req_duration: p(95)<500ms
   ✓ http_req_failed: rate<0.05
   ✓ checks: rate>0.95
```

**Significado:**
- `checks`: Porcentagem de checks que passaram
- `http_reqs`: Total e taxa de requisições por segundo
- `http_req_duration`: Tempo médio, P95 e P99
- `thresholds`: Critérios passaram/falharam

---

## 🌳 Git Workflow & CI/CD

### Branch Strategy (GitFlow)

```
┌─────────────────────────────────────────────┐
│ main (produção)                            │
│ ├─ Apenas merges de develop via PR         │
│ ├─ Testes OBRIGATÓRIOS (bloqueia merge)    │
│ └─ Tags de release (vX.Y.Z)                │
└─────────────────────────────────────────────┘
         ↑ PR + Merge

┌─────────────────────────────────────────────┐
│ develop (staging)                          │
│ ├─ Branch padrão para desenvolvimento      │
│ ├─ Testes obrigatórios + load tests        │
│ └─ Recebe feature branches                 │
└─────────────────────────────────────────────┘
         ↑ Merge

┌─────────────────────────────────────────────┐
│ feature/* (seu trabalho)                   │
│ ├─ Cria no local: feature/xyz              │
│ ├─ Commits livres                          │
│ └─ Merge para develop quando pronto        │
└─────────────────────────────────────────────┘
```

### Fluxo Prático (passo-a-passo)

#### 1️⃣ Começar Nova Feature

```bash
# Crie a feature no local
git checkout -b feature/minha-feature develop

# Trabalhe normalmente
git add .
git commit -m "feat: adicionar novo test scenario"

# Quando pronto, envie para develop
git push origin feature/minha-feature
git checkout develop
git merge feature/minha-feature
git push origin develop
```

#### 2️⃣ CI Roda Automaticamente (develop)

```
Seu push para develop
    ↓
    ✓ Build (TypeScript)
    ✓ Tests (5 VUs, 30s) - obrigatório
    ✓ Load Tests (10 VUs, 1m) - opcional
    ✓ Artifacts salvos por 30 dias
```

#### 3️⃣ Abrir PR para Main

```bash
# Via GitHub UI
# Title: "[PERF] Melhorar thresholds de P95"
# Description: "Contexto e raciocínio"
```

**Automático no PR:**
- ✅ Build obrigatório
- ✅ Tests **obrigatório** (5 VUs, 30s)
- ✅ Comentário com resultados
- ✅ Bloqueia merge se testes falharem

#### 4️⃣ Aprove e Faça Merge

```bash
# Após aprovação (code review) e testes ✅
# Merge via GitHub UI
git tag v1.0.1
git push origin main --tags
```

### CI/CD Pipeline

| Evento | Testes | Load | Stress | PR Comment |
|--------|:---:|:---:|:---:|:---:|
| Push `develop` | ✅ | ✅ | ❌ | ❌ |
| PR para `main` | ✅ | ❌ | ❌ | ✅ |
| Schedule (02:00 UTC) | ❌ | ❌ | ✅ | ❌ |

### Proteção de Branch (Configure no GitHub)

**Settings → Branches → main**

```
✓ Require pull request before merging
  ├─ Require approvals (mínimo 1)
  └─ Dismiss stale reviews

✓ Require status checks to pass
  ├─ Required: test (Node 20.x)
  └─ Require up to date before merge

✓ Restrict push to matching branches
  └─ (Opcional: apenas admin)
```

Garante que **ninguém faça merge sem:**
- ✅ Approval de outro dev
- ✅ Testes passando
- ✅ Branch atualizada

### Commit Message Convention

```bash
# Feature
git commit -m "feat: adicionar novo endpoint test"

# Fix
git commit -m "fix: corrigir P95 threshold"

# Chore (config, deps)
git commit -m "chore: aumentar VUS de 5 para 10"

# Docs
git commit -m "docs: atualizar README"
```

### Checklist: Pronto para PR?

- [ ] Feature testada localmente: `npm run test`
- [ ] Commits com mensagens claras
- [ ] `k6.config.json` atualizado se mudou config
- [ ] Push para `develop` com sucesso no CI
- [ ] Abre PR para `main` via GitHub UI
- [ ] Aguarda code review + aprovação
- [ ] CI passa no PR ✅
- [ ] Merge quando tudo ok

---

## 🔄 GitHub Secrets (Produção)

Quando estiver pronto para CI/CD, configure apenas **3 secrets sensíveis** no GitHub:

**Settings → Secrets and variables → Actions**

| Secret | Exemplo | Descrição |
|--------|---------|-----------|
| `API_BASE_URL` | https://seu-api-prod.com | URL da API em produção |
| `K6_PROJECT_ID` | 12345 | ID do projeto k6 Cloud |
| `INSECURE_SKIP_TLS_VERIFY` | false | Verificar TLS em produção |

**Seu workflow (.github/workflows/test.yml):**

```yaml
name: K6 Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    env:
      API_BASE_URL: ${{ secrets.API_BASE_URL }}
      K6_PROJECT_ID: ${{ secrets.K6_PROJECT_ID }}
      INSECURE_SKIP_TLS_VERIFY: ${{ secrets.INSECURE_SKIP_TLS_VERIFY }}
      CI_ENVIRONMENT: true

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - run: npm install
      - run: npm run test
```

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| Cannot find module 'k6' | Execute `npm install` |
| Connection refused | Verifique se `API_BASE_URL` está acessível |
| Testes com timeout | Aumente `API_TIMEOUT` em `.env` |
| Testes falhando nos thresholds | Ajuste valores em `k6.config.json` |

---

## 📚 Checklist de Mudanças de Configuração

Se alterar thresholds ou performance:

- [ ] Edite o valor em `k6.config.json`
- [ ] Execute testes localmente: `npm run test`
- [ ] Valide os resultados
- [ ] Commit com mensagem clara:
  ```bash
  git add k6.config.json
  git commit -m "chore: aumentar P95 threshold de 500ms para 600ms

  Razão: API respondendo mais lentamente nas últimas medições"
  ```

Assim, outras pessoas podem ver no histórico **por quê** a configuração foi alterada.

---

## 📚 Recursos

- [Documentação k6](https://k6.io/docs/)
- [API ServeRest](https://serverest.dev/)
- [k6 Best Practices](https://k6.io/docs/test-types/)

## 📄 Licença

ISC
