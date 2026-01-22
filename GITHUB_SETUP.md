# 📚 Guia: Publicando no GitHub

Seu projeto local está pronto! Siga estes passos para publicar no GitHub:

## 1️⃣ Criar Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Preecha os dados:
   - **Repository name:** `serverest-k6`
   - **Description:** `Performance testing suite para ServeRest API com k6`
   - **Visibility:** Public (recomendado para portfolio)
   - **NÃO** inicialize com README, .gitignore ou LICENSE (já temos)
3. Clique em **Create repository**

## 2️⃣ Adicionar Remoto e Fazer Push

Depois de criar, você verá o comando. Execute no terminal:

```bash
cd 'c:\Users\USER\Documents\Estudos\serverest-k6'

# Adicione o remoto (substitua USER_GITHUB pelo seu usuário)
git remote add origin https://github.com/USER_GITHUB/serverest-k6.git

# Faça push da branch main
git branch -M main
git push -u origin main

# Faça push da branch develop
git push -u origin develop
```

**Nota:** Se pedir autenticação, use:
- **Username:** seu email do GitHub ou nome de usuário
- **Password:** um Personal Access Token (PAT)
  - Gere em: [github.com/settings/tokens](https://github.com/settings/tokens)
  - Selecione `repo` (acesso completo ao repositório)

## 3️⃣ Configurar GitHub Secrets

Essencial para o CI/CD rodar corretamente.

### Acessar Secrets
1. Acesse seu repositório no GitHub
2. **Settings → Secrets and variables → Actions**
3. Clique em **New repository secret**

### Adicione 3 Secrets:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `API_BASE_URL` | `https://serverest.dev` | URL da API (mude em produção) |
| `K6_PROJECT_ID` | `0` | ID do projeto k6 Cloud |
| `INSECURE_SKIP_TLS_VERIFY` | `true` | Verificação TLS (false em prod) |

**Exemplo:**
```
Secret name: API_BASE_URL
Secret value: https://serverest.dev
```

Clique **Add secret** para cada um.

## 4️⃣ Configurar Proteção de Branch (Importante!)

Garante que apenas código testado entre em main.

### Setup
1. **Settings → Branches**
2. Clique em **Add rule**
3. Branch name pattern: `main`

### Marque as opções:
- ✅ **Require a pull request before merging**
  - Require approvals: `1`
  - Dismiss stale pull request approvals when new commits are pushed: ✅
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: ✅
  - Search for status checks: procure por `test` (Node version)
- ✅ **Restrict who can push to matching branches** (opcional)
  - Allow force pushes: ❌
  - Allow deletions: ❌

### Resultado:
Ninguém consegue fazer merge em `main` sem:
1. ✅ Approval de outro dev
2. ✅ Testes CI passando
3. ✅ Branch atualizada com main

## 5️⃣ Verificar CI/CD

Após o push, o CI deve rodar automaticamente:

1. Acesse **Actions** no seu repositório
2. Veja o workflow `CI - k6 Performance Tests` rodando
3. Aguarde terminar (deve passar ✅)

**Se falhar:**
- Clique no workflow
- Verifique logs
- Comum: `.env` mal configurado (mas não é committado mesmo)

## 6️⃣ Criar First Feature Branch (Opcional)

Para testar o workflow GitFlow:

```bash
# Create feature branch
git checkout -b feature/add-spike-tests develop

# Faça alterações, teste:
npm run test

# Commit
git add .
git commit -m "feat: adicionar testes de spike"

# Push
git push -u origin feature/add-spike-tests
```

Depois:
1. Abra **Pull Request** no GitHub
2. Selecione `develop` como base
3. Veja CI rodar na PR ✅
4. Merge quando tudo ok

## 7️⃣ Próximos Passos

- 📊 Integrar k6 Cloud (opcional):
  ```
  k6 login cloud
  k6 cloud run src/tests/index.ts
  ```

- 🔄 Configurar schedule para stress tests:
  - Já está em `ci.yml` para rodar 2 AM UTC diariamente

- 📈 Monitorar runs:
  - **Actions → All workflows** para histórico completo

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Remoto adicionado: `git remote -v`
- [ ] Push de main e develop realizado
- [ ] 3 GitHub Secrets configurados
- [ ] Proteção de branch `main` ativada
- [ ] CI passou na first run ✅
- [ ] Pronto para começar a desenvolver!

---

## 🆘 Troubleshooting

### "fatal: could not read Username"
Gere um Personal Access Token:
1. Acesse [github.com/settings/tokens](https://github.com/settings/tokens)
2. **Generate new token → Generate new token (classic)**
3. Selecione `repo`
4. Copie o token
5. Cole como "password" no terminal

### CI falha com "Cannot find module"
Rode localmente antes de fazer push:
```bash
npm install
npm run test
```

### Erro de proteção de branch
Só administradores podem fazer push direto em `main`. Use PRs:
```bash
git checkout -b feature/xyz develop
# ... trabalhe ...
git push origin feature/xyz
# Abra PR no GitHub
```

---

Pronto! 🚀 Seu projeto está configurado para produção com CI/CD completo!
