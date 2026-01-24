# 🔐 Guia de Autenticação - Tokens para Visual Studio Code e AI Agents

Este guia explica onde encontrar e como configurar tokens de autenticação para acessar este projeto com agentes de IA no Visual Studio Code.

## 📋 Índice

1. [GitHub Personal Access Token (PAT)](#github-personal-access-token-pat)
2. [GitHub Copilot](#github-copilot)
3. [Outros Agentes de IA no VS Code](#outros-agentes-de-ia-no-vs-code)
4. [Tokens para CI/CD](#tokens-para-cicd)
5. [Troubleshooting](#troubleshooting)

---

## 🔑 GitHub Personal Access Token (PAT)

O **Personal Access Token (PAT)** é usado para autenticar operações Git (clone, push, pull) quando você está trabalhando com repositórios GitHub.

### Quando Usar?

- Ao clonar repositórios privados
- Ao fazer push/pull sem SSH
- Ao autenticar Git no terminal ou VS Code
- Quando solicitado "password" pelo Git (em vez da senha da conta GitHub)

### Como Gerar um PAT:

1. **Acesse:** [github.com/settings/tokens](https://github.com/settings/tokens)

2. **Clique em:** "Generate new token" → "Generate new token (classic)"

3. **Configure o Token:**
   - **Note (Nome):** Dê um nome descritivo, ex: "VS Code - serverest-k6"
   - **Expiration:** Escolha a validade (recomendado: 90 dias ou 1 ano)
   - **Select scopes (Permissões):**
     - ✅ `repo` - Acesso completo aos repositórios privados
     - ✅ `workflow` - Atualizar GitHub Actions workflows (se necessário)
     - ✅ `read:org` - Ler organizações (se o repo estiver em uma org)

4. **Gere o Token:**
   - Clique em **"Generate token"**
   - ⚠️ **IMPORTANTE:** Copie o token IMEDIATAMENTE - você não poderá vê-lo novamente!

5. **Use como Password:**
   ```bash
   # Quando o Git pedir credenciais:
   Username: seu-usuario-github
   Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Armazenar o Token com Segurança:

#### Opção 1: Git Credential Manager (Recomendado)
```bash
# No Windows/Mac/Linux, o Git Credential Manager armazena automaticamente
# Depois de usar o token uma vez, ele será salvo

# Para verificar:
git config --global credential.helper
```

#### Opção 2: VS Code Settings
O VS Code pode armazenar suas credenciais GitHub automaticamente:
1. Vá em: **File → Preferences → Settings** (ou `Ctrl+,`)
2. Procure por: `github.gitAuthentication`
3. Marque: ✅ "Enables GitHub authentication"

---

## 🤖 GitHub Copilot

O **GitHub Copilot** é o agente de IA da GitHub para sugestões de código no VS Code.

### Como Autenticar no VS Code:

1. **Instale a Extensão:**
   - Abra o VS Code
   - Vá em **Extensions** (`Ctrl+Shift+X`)
   - Procure por: `GitHub Copilot`
   - Clique em **Install**

2. **Faça Login:**
   - Após instalação, clique no ícone do Copilot (canto inferior direito)
   - Clique em **"Sign in to GitHub"**
   - Uma janela do navegador será aberta
   - Autorize o GitHub Copilot na sua conta GitHub

3. **Verifique a Assinatura:**
   - GitHub Copilot requer uma assinatura paga ou trial
   - Acesse: [github.com/settings/copilot](https://github.com/settings/copilot)
   - Ative o trial gratuito ou assine

### Onde Está o "Token"?

⚠️ **O GitHub Copilot NÃO usa um token manual.** A autenticação é feita via OAuth diretamente no navegador quando você faz login pela primeira vez.

Se desconectado, clique no ícone do Copilot e faça login novamente.

---

## 🧠 Outros Agentes de IA no VS Code

Se você está usando outros agentes de IA (como ChatGPT, Claude, Tabnine, etc.), cada um tem seu próprio método de autenticação:

### Extensões Comuns:

| Extensão | Autenticação |
|----------|-------------|
| **GitHub Copilot** | Login OAuth via navegador |
| **Tabnine** | Login via extensão + API Key |
| **ChatGPT** | API Key da OpenAI |
| **Codeium** | Login OAuth via navegador |
| **Amazon Q Developer** | Login AWS |

### Como Encontrar:

1. **Abra a extensão no VS Code**
2. Procure por "Settings" ou "Sign In"
3. Siga as instruções específicas da extensão

---

## 🔄 Tokens para CI/CD (GitHub Actions)

Este projeto usa **GitHub Secrets** para configurar tokens no CI/CD, NÃO no seu ambiente local.

### Configurar Secrets no Repositório:

1. **Acesse:** `Settings → Secrets and variables → Actions`

2. **Clique em:** "New repository secret"

3. **Adicione os seguintes secrets:**

   | Nome | Valor | Descrição |
   |------|-------|-----------|
   | `API_BASE_URL` | `https://serverest.dev` | URL da API |
   | `K6_PROJECT_ID` | `0` | ID do projeto k6 Cloud |
   | `INSECURE_SKIP_TLS_VERIFY` | `true` | Verificação TLS (false em prod) |

⚠️ **Estes NÃO são tokens de autenticação pessoal** - são variáveis de ambiente para o workflow CI/CD.

---

## 🆘 Troubleshooting

### ❌ "Authentication failed" ao fazer git push

**Solução:**
1. Verifique se o token PAT foi copiado corretamente
2. Certifique-se de que o token tem permissão `repo`
3. Verifique se o token não expirou em: [github.com/settings/tokens](https://github.com/settings/tokens)
4. Gere um novo token se necessário

### ❌ "GitHub Copilot não está funcionando"

**Solução:**
1. Verifique se você está logado: clique no ícone do Copilot
2. Verifique sua assinatura: [github.com/settings/copilot](https://github.com/settings/copilot)
3. Reinstale a extensão se necessário
4. Recarregue o VS Code: `Ctrl+Shift+P` → "Reload Window"

### ❌ "Não consigo clonar o repositório"

**Solução:**
```bash
# Use HTTPS com PAT:
git clone https://github.com/andersonrmanchini/serverest-k6.git

# Quando pedir credenciais:
Username: seu-usuario-github
Password: seu-token-PAT (ghp_xxxx...)

# Ou configure SSH:
# 1. Gere chave SSH: ssh-keygen -t ed25519 -C "seu-email@example.com"
# 2. Adicione em: https://github.com/settings/keys
# 3. Clone com SSH: git clone git@github.com:andersonrmanchini/serverest-k6.git
```

### ❌ "VS Code não está pedindo autenticação"

**Solução:**
```bash
# Force o Git a pedir credenciais novamente:
git credential reject https://github.com

# Depois, tente git push novamente
```

---

## 📚 Links Úteis

| Recurso | Link |
|---------|------|
| **Gerenciar PATs** | [github.com/settings/tokens](https://github.com/settings/tokens) |
| **GitHub Copilot Settings** | [github.com/settings/copilot](https://github.com/settings/copilot) |
| **SSH Keys** | [github.com/settings/keys](https://github.com/settings/keys) |
| **Aplicações Autorizadas** | [github.com/settings/applications](https://github.com/settings/applications) |
| **Documentação Git Credentials** | [git-scm.com/docs/gitcredentials](https://git-scm.com/docs/gitcredentials) |
| **Docs GitHub Copilot** | [docs.github.com/pt/copilot](https://docs.github.com/pt/copilot) |

---

## 🔒 Segurança

### ⚠️ Boas Práticas:

- ✅ **NUNCA** compartilhe seu token PAT com outras pessoas
- ✅ **NUNCA** commite tokens no código (use `.env` + `.gitignore`)
- ✅ Use tokens com **permissões mínimas** necessárias
- ✅ Configure **expiration** nos tokens (ex: 90 dias)
- ✅ **Revogue** tokens antigos que não usa mais
- ✅ Use **SSH keys** para operações Git quando possível

### Revogar um Token:

1. Acesse: [github.com/settings/tokens](https://github.com/settings/tokens)
2. Encontre o token que deseja revogar
3. Clique em **Delete** ou **Revoke**

---

## ✅ Resumo Rápido

**Pergunta:** Onde encontro meu token de autenticação para AI no VS Code?

**Resposta:**

1. **Para GitHub Copilot:** 
   - Instale a extensão → Faça login via navegador (OAuth)
   - Não precisa de token manual

2. **Para operações Git (clone, push, pull):**
   - Gere um PAT em: [github.com/settings/tokens](https://github.com/settings/tokens)
   - Use como "password" quando o Git pedir

3. **Para outras extensões de IA:**
   - Veja as instruções específicas de cada extensão
   - Normalmente login OAuth ou API Key

---

**Precisa de mais ajuda?** Abra uma issue no repositório ou consulte a [documentação oficial do GitHub](https://docs.github.com).
