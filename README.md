# baseconhecimento

Plataforma corporativa de base de conhecimento com workflow de aprovacao, editor rich-text (Tiptap), autenticacao (Supabase Auth), e controle de acesso por time (RBAC + RLS).

## Visao Geral

baseconhecimento eh uma solucao web responsiva para gestao e compartilhamento de conhecimento em equipes. O sistema implementa:

- **Autenticacao segura** com Supabase (email/senha, recuperacao de senha)
- **RBAC (Role-Based Access Control)** por time com papeis: Admin Maximo, Gestor, Lider, Membro, Leitor/Viewer
- **RLS (Row Level Security)** no Postgres para seguranca em nivel de banco de dados
- **Editor Rich-Text** (Tiptap) com suporte a blocos de codigo, callouts, tabelas, imagens e anexos
- **Workflow de aprovacao** com estados: Rascunho → Aguardando revisao → Ajustes solicitados → Aguardando gestor → Publicado
- **Gestao de membros** com controle de papeis por time
- **Auditoria completa** (quem fez o que, quando)

## Tecnologia

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui (Radix)
- **Backend**: Supabase (Postgres + PostgREST API + Real time subscriptions)
- **Auth**: Supabase Auth (GoTrue)
- **Editor**: Tiptap (headless rich-text)
- **Deploy**: Vercel + Supabase

## Estrutura de Papeis

| Papel | Escopo | Permissoes |
|-------|--------|----|
| **Admin Maximo** | Plataforma | Criar/editar times, designar gestor, auditar tudo |
| **Gestor** | Time | Gerenciar membros, definir papeis, aprovar itens finais |
| **Lider** | Time | Revisar itens, aprovar/devolver para ajustes |
| **Membro** | Time | Criar/editar rascunhos, submeter para revisao, ajustar |
| **Leitor/Viewer** | Time | Ler itens publicados, comentar |

## Estados do Workflow

```
Rascunho
    ↓
Aguardando revisao do lider
    ↓
  Ajustes solicitados (devolvido pelo lider)
    ↓ (apos ajustes)
Aguardando revisao do lider
    ↓
Aguardando aprovacao do gestor
    ↓
Publicado (gestor aprovou)

EM QUALQUER PONTO:
Rejeitado (reprovacao final)
```

## Modelo de Dados (Resumo)

- `teams` - Times corporativos
- `team_members` - Membros do time com papel (admin_maximo, gestor, lider, membro, leitor)
- `kb_items` - Itens de conhecimento (metadados)
- `kb_versions` - Historico de versoes do conteudo
- `kb_categories` - Categorias/hierarquia
- `kb_tags` / `kb_item_tags` - Etiquetas para organizacao
- `kb_attachments` - Arquivos (via Storage)
- `kb_approval_requests` - Requisicoes de aprovacao
- `kb_approval_steps` - Etapas da aprovacao
- `kb_approval_actions` - Decisoes (aprova/reprova) com motivo
- `audit_log` - Trilha de auditoria (append-only)

## Setup

### Requisitos

- Node.js 18+
- pnpm (ou npm/yarn)
- Conta Supabase com projeto criado
- Vercel (para deploy)

### Desenvolvimento Local

1. **Clone o repositorio**
```bash
git clone https://github.com/edivaldosousa/baseconhecimento.git
cd baseconhecimento
```

2. **Instale as dependencias**
```bash
pnpm install
```

3. **Configure as variaveis de ambiente**
Crie um arquivo `.env.local` na raiz:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zcyoaijntzwxxuqsggit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui
```

4. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```
Acesse `http://localhost:3000`

### Supabase Setup

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Configure Auth (email/senha)
3. Configure Redirect URLs: `http://localhost:3000/*, https://seu_dominio.vercel.app/*`
4. Aplique as migrations SQL (ver pasta `supabase/migrations/`)
5. Configure RLS policies

## Branches e Workflow Git

- `main` - Producao (deployado na Vercel)
- `feature/*` - Novas features
- `bugfix/*` - Correcoes de bugs
- `docs/*` - Atualizacoes de documentacao

### Fluxo:

1. Crie uma branch a partir de `main`: `git checkout -b feature/sua-feature`
2. Faca commits com mensagens claras: `git commit -m "feat: adicionar pagina de perfil"`
3. Abra um Pull Request para `main`
4. Apos review e merge, a Vercel automaticamente faz deploy

## Arquitetura de Pastas

```
baseconhecimento/
├── apps/
│   └── web/                     # Next.js app
│       ├── src/
│       │   ├── app/              # App Router (pages)
│       │   │   ├── entrar/       # Login page
│       │   │   ├── recuperar-senha/ # Password recovery
│       │   │   ├── atualizar-senha/ # Password reset
│       │   │   ├── admin/        # Admin panel
│       │   │   ├── gestor/       # Gestor panel
│       │   │   ├── minhas-pendencias/ # My pending items
│       │   │   └── ...           # Other pages
│       │   ├── components/       # Reusable UI components
│       │   ├── lib/              # Utilities (auth, db, formatters)
│       │   ├── hooks/            # React hooks
│       │   ├── types/            # TypeScript types
│       │   ├── middleware.ts     # Auth middleware
│       │   └── styles/           # Global styles
│       ├── public/               # Static assets
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.js
├── packages/
│   ├── ui/                       # shadcn/ui components (shared)
│   └── types/                    # Shared TypeScript types
├── supabase/
│   ├── migrations/               # SQL migrations (versionadas)
│   ├── seed.sql                  # Seed data (opcional)
│   └── config.toml               # Supabase config
├── docs/
│   ├── ARCHITECTURE.md           # Arquitetura detalhada
│   ├── DATABASE.md               # Schema do banco
│   ├── AUTH.md                   # Fluxos de autenticacao
│   ├── DEPLOYMENT.md             # Deploy step-by-step
│   └── CONTRIBUTING.md           # Guia de contribuicao
├── .github/
│   └── workflows/                # CI/CD (GitHub Actions)
│       ├── lint.yml              # Lint + format check
│       └── deploy.yml            # Deploy automatico
├── .env.example                  # Template de variaveis
├── .gitignore                    # Git ignore (Node + Supabase)
├── .eslintrc.json                # ESLint config
├── .prettierrc.json              # Prettier config
├── tsconfig.json                 # TypeScript config (raiz)
└── README.md                     # Este arquivo
```

## Proximos Passos

1. ✅ Repositorio GitHub criado
2. ✅ Projeto Supabase configurado
3. ⏳ Setup local com Next.js
4. ⏳ Autenticacao (login, reset de senha)
5. ⏳ CRUD de times e membros
6. ⏳ CRUD de itens de conhecimento
7. ⏳ Workflow de aprovacao
8. ⏳ Editor rich-text
9. ⏳ Painel Admin (gestao de times)
10. ⏳ Painel Gestor (gestao de membros)
11. ⏳ Deploy na Vercel

## Contribuindo

Para contribuir:

1. Faca fork do repositorio
2. Crie uma branch com sua feature
3. Faca commit das suas mudancas
4. Abra um Pull Request

Ver [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para detalhes.

## Licenca

MIT

## Contato

Para duvidas ou sugestoes: edivaldosousa@seu_email.com
