# Setup Local - Guia Passo a Passo para Desenvolvedores

## Pre-requisitos

Antes de começar, certifique-se de ter os seguintes programas instalados:

### Sistema Operacional
- Windows 10/11, macOS 11+ ou Linux (Ubuntu 20.04+)

### Ferramentas Necessarias
- **Node.js** 18.17+ ou superior
  - Verificar: `node --version` (deve exibir v18.17.0 ou superior)
  - Download: https://nodejs.org/

- **pnpm** (Package Manager)
  - Verificar: `pnpm --version`
  - Instalar: `npm install -g pnpm` (requer Node.js instalado)

- **Git**
  - Verificar: `git --version`
  - Download: https://git-scm.com/
  - Configurar usuario: `git config --global user.name "Seu Nome"`
  - Configurar email: `git config --global user.email "seu.email@exemplo.com"`

### Aplicacoes Recomendadas
- **VS Code** (editor de código) com extensoes:
  - ES7+ React/Redux snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint
  - Thunder Client ou Insomnia (para testar APIs)

### Contas Online (ja criadas)
- GitHub: https://github.com/edivaldosousa/baseconhecimento
- Supabase: https://supabase.com/dashboard
- Vercel: https://vercel.com/ (para deploy posterior)

---

## 1. Clonar o Repositorio

```bash
# Clonar do GitHub
git clone https://github.com/edivaldosousa/baseconhecimento.git
cd baseconhecimento

# Verificar que estamos no branch correto
git branch -a
# Esperado: * main (o asterisco indica branch ativa)
```

---

## 2. Instalar Dependencias npm

```bash
# Instalar todas as dependencias listadas em package.json
pnpm install

# Ou use npm se preferir (mais lento)
npm install
```

**O que foi instalado:**
- next, react, react-dom, typescript
- @supabase/supabase-js (cliente do Supabase)
- @supabase/auth-helpers-nextjs (autenticacao Supabase com Next.js)
- tailwindcss, autoprefixer, postcss
- eslint, prettier, @typescript-eslint
- zod (validacao), zustand (state management)
- @radix-ui/*, shadcn/ui, @tiptap/*

**Tempo estimado:** 2-5 minutos (primeira vez eh mais lento)

---

## 3. Configurar Variaveis de Ambiente

### 3.1 Criar arquivo `.env.local`

Copie do template:
```bash
cp .env.example .env.local
```

### 3.2 Editar `.env.local` com suas chaves Supabase

Abra `.env.local` em um editor e complete:

```env
# Supabase (encontrar em https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://zcyoaijntzwxxuqsggit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 Encontrar Suas Chaves Supabase

1. Acesse https://supabase.com/dashboard
2. Selecione o projeto **baseconhecimento**
3. Clique em **Settings** (engrenagem)
4. Vá para **API**
5. Copie:
   - `Project URL` → cole em `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `Service role key` → cole em `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE:** Nunca commitar `.env.local` (ja esta no `.gitignore`)

---

## 4. Instalar Supabase CLI (Opcional mas Recomendado)

```bash
# Instalar globalmente
npm install -g supabase

# Verificar instalacao
supabase --version

# Fazer login (requer conta Supabase)
supabase login

# Listar projetos
supabase projects list
```

---

## 5. Iniciar Servidor de Desenvolvimento Local

```bash
# Inicia na porta 3000
pnpm dev

# Ou com npm
npm run dev
```

**Logs esperados:**
```
▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in 1.2s
```

**Acessar:**
- Frontend: http://localhost:3000
- Admin Console Next.js: http://localhost:3000/_next/static

---

## 6. Estrutura de Pastas (Quando Next.js for criado)

```
baseconhecimento/
├── src/
│   ├── app/                    # Rotas e paginas (App Router)
│   │   ├── (auth)/            # Rotas de autenticacao
│   │   │   ├── entrar/page.tsx
│   │   │   ├── recuperar-senha/page.tsx
│   │   │   └── atualizar-senha/page.tsx
│   │   ├── (protected)/        # Rotas protegidas (requer login)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── admin/
│   │   │   ├── gestor/
│   │   │   └── kb/
│   │   ├── api/                # Rotas API
│   │   │   ├── auth/[...auth].ts
│   │   │   ├── teams/
│   │   │   ├── kb/
│   │   │   └── ...
│   │   ├── layout.tsx          # Layout raiz
│   │   └── page.tsx            # Home page
│   ├── components/             # Componentes reutilizaveis
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   ├── auth/               # Auth components
│   │   ├── kb/                 # KB domain components
│   │   └── admin/              # Admin domain components
│   ├── lib/                    # Funcoes utilitarias
│   │   ├── supabase-client.ts
│   │   ├── supabase-server.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── types/                  # TypeScript types
│   │   ├── auth.ts
│   │   ├── kb.ts
│   │   └── ...
│   ├── hooks/                  # React custom hooks
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   └── ...
│   └── styles/                 # Estilos globais
│       └── globals.css
├── public/                     # Assets estaticos
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── seed.sql
│   └── config.toml
├── .env.example                # Template de .env
├── .env.local                  # NUNCA commitar (gitignore)
├── .eslintrc.json
├── .prettierrc.json
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 7. Comandos Comuns

```bash
# Desenvolvimento
pnpm dev           # Inicia servidor dev (port 3000)

# Build
pnpm build         # Compila para producao
pnpm start         # Inicia producao localmente

# Qualidade de Codigo
pnpm lint          # Verifica lint (ESLint)
pnpm format        # Formata codigo (Prettier)
pnpm type-check    # Verifica tipos TypeScript

# Limpeza
pnpm clean         # Remove .next, node_modules, etc

# Git
git status         # Status do repositorio
git add .          # Adicionar todas as mudancas
git commit -m "feat: mensagem"  # Commitar com mensagem
git push           # Enviar para GitHub
```

---

## 8. Troubleshooting

### Problema: "node_modules nao encontrado"
**Solucao:** Rode `pnpm install` novamente

### Problema: "Erro de porta 3000 em uso"
**Solucao:** 
```bash
# Usar porta diferente
pnpm dev -- -p 3001
# Ou matar processo na porta 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000
```

### Problema: "Erro de autenticacao Supabase"
**Checklist:**
- ✅ `.env.local` existe e tem as chaves corretas?
- ✅ Copiou URL, ANON_KEY e SERVICE_ROLE_KEY?
- ✅ Nao ha espacos em branco nas chaves?
- ✅ `.env.local` nao foi commited no Git?

### Problema: "TypeScript errors"
**Solucao:** 
```bash
pnpm type-check  # Verificar todos os erros
pnpm format      # Auto-corrigir alguns erros
```

---

## 9. Proximos Passos

Apos o setup:
1. Leia `README.md` para contexto geral
2. Leia `ESPECIFICACAO_TECNICA.md` para arquitetura
3. Leia `ROADMAP.md` para o plano de desenvolvimento
4. Crie uma branch: `git checkout -b feature/sua-feature`
5. Comece a implementar de acordo com as fases

---

## Contatos e Suporte

- **Documentacao Next.js:** https://nextjs.org/docs
- **Documentacao Supabase:** https://supabase.com/docs
- **Documentacao Tailwind:** https://tailwindcss.com/docs
- **Duvidas do Projeto:** Abra uma Issue no GitHub

---

Ultima atualizacao: Janeiro 2026
