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
8. [Git Workflow](#git-workflow)
9. [CI/CD com GitHub Secrets](#cicd-com-github-secrets)
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

### Teste com Relatório HTML 📊 (NOVO - Relatório Detalhado!)
```bash
npm run test:report              # Rodar testes + gerar relatório DETALHADO
npm run report:open-detailed     # Abrir relatório no navegador
npm run report:open              # Abrir relatório antigo (básico)
```

**Relatório Detalhado Inclui:**
- ✅ Checks separados por cenário (7 cenários)
- 📊 Métricas HTTP com percentis (Mín, P95, Máx)
- 🎨 Barras de progresso vs. thresholds
- 📈 4 cards com resumo de taxas
- 🎯 Cores inteligentes (Verde = OK, Amarelo = Atenção, Vermelho = Alerta)

### Outros Tipos
```bash
npm run test:smoke      # Validação rápida (1 VU, 10s)
npm run test:load       # Carga normal (10 VUs, 1m)
npm run test:stress     # Encontrar limite (50 VUs, 5m)
npm run test:spike      # Picos de tráfego (100 VUs, 1m)
npm run test:soak       # Longa duração (20 VUs, 30m)
```

---

## 📊 Relatórios HTML

Todos os testes geram **relatórios HTML detalhados e profissionais** com:

### ✨ Relatório Detalhado (NOVO - Recomendado!)
- 🎨 Dark theme moderno, responsivo para mobile
- 📈 **4 Cards Principais:** Taxa de checks, total de checks, cenários, tempo médio
- 🎯 **Checks por Cenário:** 7 cenários agrupados com seus checks específicos
- 📋 **Todos os 12 Checks:** Com taxa individual de sucesso
- ⏱️ **Métricas HTTP com Percentis:** Mín / P95 / Máx para cada métrica
- 📊 **Barras de Progresso:** Visualizam se dentro do threshold ou não
- 🎨 **Cores Inteligentes:**
  - 🟢 Verde = Dentro do threshold (OK)
  - 🟡 Amarelo = Próximo ao limite (Atenção)
  - 🔴 Vermelho = Acima do threshold (Alerta)

**Gerar:**
```bash
npm run test:report                # Teste padrão + relatório detalhado
npm run test:report:smoke          # Teste smoke + relatório
npm run test:report:load           # Teste load + relatório
npm run test:report:stress         # Teste stress + relatório
npm run report:open-detailed       # Abrir relatório existente
```

### Relatório Básico (Legacy)
Ainda disponível, mas o detalhado é recomendado:
```bash
npm run report:generate            # Gerar versão básica
npm run report:open                # Abrir versão básica
```

---

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

## 📈 Análise de Resultados via CLI

Além do relatório HTML, você pode analisar os resultados no console com detalhes de checks por cenário:

```bash
npm run analyze:results   # Analisa último teste
npm run analyze:smoke     # Analisa teste smoke
npm run analyze:load      # Analisa teste load
npm run analyze:stress    # Analisa teste stress
```

**Saída inclui:**
- ✅ Resumo geral de todos os 12 checks
- 🎯 Checks agrupados por 7 cenários de teste
- ⏱️ Métricas HTTP (duração, waiting, failed, total)
- 📊 Análise de erros e falhas esperadas

Exemplo:
```
📈 RESUMO GERAL DE CHECKS
✅ status is 200: 100.00% (140 execuções)
✅ response time < 500ms: 100.00% (175 execuções)
...

🎯 CHECKS POR CENÁRIO
📍 GET /usuarios - List Users
   ✓ status is 200: 35 execuções
   ✓ response time < 500ms: 35 execuções
   ...

⏱️ MÉTRICAS HTTP
📊 http_req_duration: Média 202.47ms | Min 156.40ms | Max 646.90ms | P95 293.54ms
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

## 📖 Documentação de Arquivos e Pastas

### 🎯 Raiz do Projeto

#### `package.json`
- **Propósito:** Gerenciador de dependências e scripts do Node.js
- **Conteúdo:** Todas as dependências (k6, TypeScript, Webpack), versão do projeto e scripts de test/report
- **Para quem?** Desenvolvedores que querem instalar deps ou entender as tasks disponíveis
- **Uso:** `npm install` para instalar, `npm run <script>` para executar

#### `k6.config.json`
- **Propósito:** Centraliza TODAS as configurações de performance (thresholds, VUs, duração)
- **Conteúdo:** 
  - `testConfig`: VUs, duração e ramp-up dos testes
  - `thresholds`: P95, P99 para testes normais e stress
  - `errorRates`: Taxa máxima de erro permitida
  - `checkSuccessRates`: Taxa mínima de sucesso esperada
- **Por quê?** Evita hardcoding valores no código, centraliza tudo em um lugar versionável
- **Nota:** Este é o arquivo a editar quando se quer ajustar comportamento dos testes

#### `tsconfig.json`
- **Propósito:** Configuração do compilador TypeScript
- **Conteúdo:** Compila TypeScript de `src/` para `dist/` com ES2020, strict mode ativado
- **Para quem?** Desenvolvedores que trabalham com TypeScript, ou que precisam entender como o código é compilado

#### `webpack.config.js`
- **Propósito:** Agrupa (bundle) código TypeScript para o k6 executar
- **Conteúdo:** Configura entry point (`src/tests/index.ts`) e output (`dist/`)
- **Nota:** k6 precisa de um bundle único, não de módulos separados
- **Para quem?** Avançado - configurar se houver problemas de import/export

#### `build.js`
- **Propósito:** Script de build customizado que compila TypeScript → JavaScript
- **Conteúdo:** Executado antes de cada `npm run test`, garante código atualizado
- **Para quem?** Automaticamente executado pelo projeto, raramente precisa ser editado

#### `.env.example`
- **Propósito:** Template das variáveis de ambiente sensíveis
- **Conteúdo:** Exemplo de como configurar `.env` (chaves secretas, URLs)
- **Nota:** NUNCA commite `.env` real, apenas `.env.example`
- **Para quem?** Novos dev membros - copiam este arquivo para `.env` local

#### `.env` (não versionado)
- **Propósito:** Armazena variáveis sensíveis (URLs, credenciais)
- **Conteúdo:** Gerado a partir de `.env.example`, nunca é commitado
- **Segurança:** Adicionado ao `.gitignore`
- **Para quem?** Ambiente local apenas - em produção vem de GitHub Secrets

#### `README.md`
- **Propósito:** Documentação do projeto (você está lendo agora!)
- **Conteúdo:** Setup, testes, resultados, CI/CD, troubleshooting
- **Para quem?** Todos - primeira leitura para entender o projeto

#### `k6.d.ts`
- **Propósito:** Type definitions customizadas para k6 (tipos TypeScript)
- **Conteúdo:** Define tipos das funções e módulos do k6
- **Para quem?** Desenvolvedores usando TypeScript - fornece autocomplete no IDE

#### `tsconfig.k6.json`
- **Propósito:** Configuração alternativa de TypeScript específica para k6
- **Para quem?** Raramente usado - fallback se houver problemas de compilação

---

### 📁 Pasta `src/`

Contém **todo o código-fonte** dos testes (TypeScript).

#### `src/tests/`
Cenários de teste e ponto de entrada principal.

**`index.ts`** - Suite principal
- **Propósito:** Arquivo central que define todos os testes e configurações
- **Conteúdo:**
  - Importa configuração de `k6.config.json`
  - Define virtual user script (VU script)
  - Executa diferentes endpoints (usuários, produtos)
  - Aplicam thresholds e checks
- **Fluxo:** Este é o primeiro arquivo executado quando você roda `npm run test`
- **Para quem?** Desenvolvedores que querem entender o fluxo geral dos testes

**`users.spec.ts`** - Testes específicos de usuários
- **Propósito:** Todos os testes relacionados ao CRUD de usuários (criar, ler, atualizar, deletar)
- **Conteúdo:**
  - Função para registrar usuário
  - Função para fazer login
  - Função para listar usuários
  - Função para atualizar perfil
- **Executado por:** `npm run test:users` ou chamado pela suite principal
- **Para quem?** Desenvolvedores testando endpoints de usuários

**`products.spec.ts`** - Testes específicos de produtos
- **Propósito:** Todos os testes de CRUD de produtos (criar, listar, atualizar, deletar)
- **Conteúdo:**
  - Função para criar produto
  - Função para listar produtos
  - Função para buscar por ID
  - Função para deletar produto
- **Executado por:** `npm run test:products` ou chamado pela suite principal
- **Para quem?** Desenvolvedores testando endpoints de produtos

---

#### `src/services/`
Camada de chamadas HTTP (sem lógica de teste).

**`api.service.ts`** - Serviço HTTP base
- **Propósito:** Client HTTP reutilizável para fazer requisições
- **Conteúdo:**
  - Função `request()` que faz calls HTTP genéricos
  - Trata autenticação (headers, tokens)
  - Gerencia timeouts e erros
  - Retorna resposta estruturada
- **Por quê?** Evita duplicação de código HTTP entre tests
- **Para quem?** Qualquer código que precisa fazer requisição

**`auth.service.ts`** - Endpoints de autenticação
- **Propósito:** Especializações de `api.service` para login/registração
- **Conteúdo:**
  - `register()` - registra novo usuário
  - `login()` - faz login e retorna token
  - Helper para extrair token da resposta
- **Uso:** Chamado por `users.spec.ts` antes de outras operações
- **Para quem?** Testes que precisam de autenticação

**`user.api.service.ts`** - Endpoints de usuários
- **Propósito:** Wraps de endpoints específicos de usuários
- **Conteúdo:**
  - `createUser()` - POST /usuarios
  - `getUsers()` - GET /usuarios
  - `updateUser()` - PUT /usuarios/:id
  - `deleteUser()` - DELETE /usuarios/:id
- **Nota:** Não faz validações de negócio, apenas chama HTTP
- **Para quem?** `users.spec.ts` e testes que manipulam usuários

**`product.api.service.ts`** - Endpoints de produtos
- **Propósito:** Wraps de endpoints específicos de produtos
- **Conteúdo:**
  - `createProduct()` - POST /produtos
  - `getProducts()` - GET /produtos
  - `getProductById()` - GET /produtos/:id
  - `updateProduct()` - PUT /produtos/:id
  - `deleteProduct()` - DELETE /produtos/:id
- **Para quem?** `products.spec.ts` e testes que manipulam produtos

---

#### `src/utils/`
Utilitários compartilhados entre testes.

**`config.ts`** - Leitor de configurações
- **Propósito:** Centraliza leitura de `.env` e `k6.config.json`
- **Conteúdo:**
  - `getConfig()` - retorna config carregada
  - `getApiBaseUrl()` - URL da API
  - `getThresholds()` - limites de performance
  - `getTestConfig()` - VUs, duração, etc
- **Por quê?** Evita hardcoding, torna valores reutilizáveis
- **Para quem?** Qualquer arquivo que precisa acessar configuração

**`constants.ts`** - Valores fixos tipados
- **Propósito:** Armazena constantes do projeto (paths, mensagens de erro, etc)
- **Conteúdo:**
  - URLs de endpoints da API
  - Mensagens padrão de erro
  - Códigos HTTP esperados
  - Timeouts padrão
- **Por quê?** Tipo-seguro, evita magic strings no código
- **Para quem?** Qualquer código que precisa de valores fixos

**`data.factory.ts`** - Gerador de dados fake (Faker)
- **Propósito:** Gera dados realistas para usuarios e produtos
- **Conteúdo:**
  - `generateUser()` - cria objeto usuário aleatório
  - `generateProduct()` - cria objeto produto aleatório
  - `generateEmail()` - email único
  - `generateName()` - nome completo
  - `generatePrice()` - preço realista
- **Por quê?** Testes precisam de dados variados, não dados hardcoded
- **Para quem?** `users.spec.ts` e `products.spec.ts` quando criam novos registros

**`thresholds.ts`** - Definição dinâmica de limites
- **Propósito:** Lê `k6.config.json` e cria thresholds válidos para k6
- **Conteúdo:**
  - Função que converte config JSON em sintaxe de threshold k6
  - Aplica diferentes thresholds para stress vs testes normais
  - Retorna objeto compatível com k6
- **Por quê?** k6 não lê JSON diretamente, precisa de object JavaScript
- **Para quem?** `index.ts` para configurar os testes

**`checks.ts`** - Validações reutilizáveis
- **Propósito:** Funções que testam se uma resposta atende critérios
- **Conteúdo:**
  - `checkStatusCode()` - valida status 200
  - `checkResponseTime()` - valida duração < threshold
  - `checkBodyContent()` - valida conteúdo esperado
  - `checkErrorRate()` - valida taxa de erro
- **Retorna:** booleano (passa/falha o check)
- **Para quem?** `index.ts`, `users.spec.ts`, `products.spec.ts` para validar respostas

---

### 📁 Pasta `test-results/`

Armazena resultados e relatórios de testes (gerados automaticamente).

**`results.json`** - Dados brutos em JSON
- **Propósito:** Saída bruta do k6 com todas as métricas
- **Formato:** JSON com arrays de data points de performance
- **Gerado por:** `npm run test:report`
- **Para quem?** Análise programática, integração com ferramentas

**`report.html`** - Relatório visual profissional
- **Propósito:** Dashboard interativo com gráficos e resumo
- **Conteúdo:**
  - Painel com 6 métricas principais (requests, fail rate, checks, VUs, duração, percentis)
  - Detalhes de cada check (passou/falhou)
  - Status final (PASSOU/FALHOU)
  - Dark theme responsivo
- **Gerado por:** `npm run report:generate` a partir de `results.json`
- **Abrir com:** `npm run report:open`
- **Para quem?** Stakeholders, documentação, análise de resultados

**Outros relatórios** (`report-smoke.html`, `report-load.html`, `report-stress.html`)
- **Propósito:** Mesma coisa que `report.html`, mas para diferentes tipos de teste
- **Naming:** Sufixo indica tipo de teste (`smoke`, `load`, `stress`, `soak`)
- **Gerados por:** `npm run test:report:smoke`, etc
- **Para quem?** Comparar resultados entre diferentes cenários

---

### 📁 Pasta `scripts/`

Scripts Node.js utilitários (não código de teste).

**`generate-report.js`** - Gerador de HTML
- **Propósito:** Lê `results.json` e gera `report.html` visual
- **Entrada:** Arquivo JSON com resultados k6
- **Saída:** Arquivo HTML pronto para visualizar no navegador
- **Conteúdo:**
  - Lê métricas do JSON
  - Cria HTML com CSS e gráficos
  - Aplica dark theme
- **Chamado por:** `npm run report:generate`
- **Para quem?** Desenvolvedor - normalmente roda automaticamente

---

### 📊 Resumo Rápido (Um Arquivo por Linha)

| Arquivo/Pasta | Tipo | Propósito | Editar? |
|---|---|---|---|
| `k6.config.json` | Config | Thresholds e parâmetros de teste | ✅ Sim |
| `src/tests/index.ts` | Código | Suite principal de testes | ✅ Ocasionalmente |
| `src/tests/users.spec.ts` | Código | Testes de usuários | ✅ Ocasionalmente |
| `src/tests/products.spec.ts` | Código | Testes de produtos | ✅ Ocasionalmente |
| `src/services/api.service.ts` | Código | Client HTTP base | ⚠️ Raramente |
| `src/utils/data.factory.ts` | Código | Gerador de dados fake | ⚠️ Raramente |
| `src/utils/config.ts` | Código | Leitor de config | ⚠️ Não |
| `src/utils/checks.ts` | Código | Validações reutilizáveis | ⚠️ Raramente |
| `.env` | Config | Variáveis sensíveis | ✅ Local only |
| `test-results/` | Output | Resultados e relatórios HTML | 🔍 Só read |
| `package.json` | Config | Dependências e scripts | ⚠️ Raramente |
| `tsconfig.json` | Config | Compilação TypeScript | ⚠️ Raramente |

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

## 🌳 Git Workflow

**Branch Strategy:** GitFlow com `main` (produção), `develop` (staging) e `feature/*`

**Fluxo básico:**
```bash
git checkout -b feature/xyz develop          # Nova feature
# ... trabalhe
git push origin feature/xyz && git checkout develop && git merge feature/xyz  # Merge para develop
# Pull Request develop → main via GitHub (testes obrigatórios)
git tag v1.0.1 && git push origin main --tags  # Release em main
```

**Commit Pattern:** `feat:`, `fix:`, `chore:`, `docs:`

**CI/CD Automático:** Push em `develop` roda testes + load tests. PR em `main` roda testes + comenta resultado (bloqueia se falhar).

---

## � CI/CD com GitHub Secrets

Configure 3 secrets em **Settings → Secrets and variables → Actions**:

| Secret | Descrição |
|--------|----------|
| `API_BASE_URL` | URL da API em produção |
| `K6_PROJECT_ID` | ID do projeto k6 Cloud |
| `INSECURE_SKIP_TLS_VERIFY` | Verificar TLS (false em prod) |

Workflow automático roda testes no push/PR usando esses secrets.

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| Cannot find module 'k6' | Execute `npm install` |
| Connection refused | Verifique se `API_BASE_URL` está acessível |
| Testes com timeout | Aumente `API_TIMEOUT` em `.env` |
| Testes falhando nos thresholds | Ajuste valores em `k6.config.json` |
| Relatório vazio | Rode `npm run test:report` e verifique `test-results/` |
| Relatório não abre | Use `npm run report:open` ou abra `test-results/report.html` manualmente |

---

## � Dicas Rápidas

- Edite `k6.config.json` para ajustar thresholds e VUs
- Copie relatórios antigos com timestamps: `cp test-results/report.html test-results/report-$(date +%Y-%m-%d).html`
- Compare relatórios ao longo do tempo para identificar degradação de performance
- Arquivos HTML são portáveis - compartilhe por email/Slack

---

## 📚 Recursos

- [Documentação k6](https://k6.io/docs/)
- [API ServeRest](https://serverest.dev/)
- [k6 Best Practices](https://k6.io/docs/test-types/)

## 📄 Licença

ISC
