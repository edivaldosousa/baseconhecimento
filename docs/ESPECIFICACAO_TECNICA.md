# Especificacao Tecnica - Base de Conhecimento

## 1. Introducao

Este documento descreve a especificacao tecnica completa da plataforma "baseconhecimento", uma solucao de base de conhecimento corporativa com workflow de aprovacao, editor rich-text e controle de acesso granular por time.

## 2. Stack Tecnologico

### Frontend
- **Next.js 14** (App Router com typescript)
- **React 18+**
- **Tailwind CSS** (utility-first CSS framework)
- **shadcn/ui** (Radix UI + Tailwind components)
- **Tiptap** (editor rich-text headless)
- **TanStack Query** (gerenciamento de estado/cache)
- **Zustand** (state management leve)
- **Zod** (validacao de schemas TypeScript)

### Backend
- **Supabase** (Postgres + PostgREST API)
- **Supabase Auth** (JWT-based, GoTrue)
- **Supabase Storage** (para anexos)
- **Supabase Realtime** (websockets para sync)
- **Edge Functions** (Deno) para logica customizada

### Infra
- **Vercel** (hosting frontend, edge functions)
- **Supabase** (banco de dados, auth, storage)
- **GitHub** (versionamento de codigo)

## 3. Modelo de Dados

### 3.1 Tabelas Principais

#### `auth.users` (Gerenciado por Supabase)
Usuarios e autenticacao feita pelo Supabase Auth (GoTrue).

#### `public.profiles`
Espelho de auth.users com dados adicionais:
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `public.teams`
Times corporativos:
```sql
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `public.team_members`
Membros do time com papeis:
```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL CHECK (role IN ('admin_maximo', 'gestor', 'lider', 'membro', 'leitor')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

#### `public.kb_items`
Itens de conhecimento (metadados):
```sql
CREATE TABLE public.kb_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'aguardando_revisao_lider', 'ajustes_solicitados', 
                      'aguardando_aprovacao_gestor', 'publicado', 'rejeitado')),
  category_id UUID REFERENCES public.kb_categories(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  UNIQUE(team_id, slug)
);
```

#### `public.kb_versions`
Historico de versoes do conteudo:
```sql
CREATE TABLE public.kb_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_item_id UUID NOT NULL REFERENCES public.kb_items(id),
  content JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  version_number INTEGER NOT NULL
);
```

#### `public.kb_categories`
Categorias para organizacao:
```sql
CREATE TABLE public.kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES public.kb_categories(id),
  UNIQUE(team_id, slug)
);
```

#### `public.kb_tags` + `public.kb_item_tags`
Etiquetas para busca e filtragem.

#### `public.kb_attachments`
Arquivos anexados aos itens (via Supabase Storage).

#### `public.kb_approval_requests`
Requisicoes de aprovacao:
```sql
CREATE TABLE public.kb_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_item_id UUID NOT NULL REFERENCES public.kb_items(id),
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'aguardando_lider'
    CHECK (status IN ('aguardando_lider', 'lider_approved', 'lider_rejected', 
                      'aguardando_gestor', 'gestor_approved', 'gestor_rejected')),
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

#### `public.kb_approval_actions`
Decisoes de aprovacao/reprovacao:
```sql
CREATE TABLE public.kb_approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_request_id UUID NOT NULL REFERENCES public.kb_approval_requests(id),
  decided_by UUID NOT NULL REFERENCES public.profiles(id),
  decision TEXT NOT NULL CHECK (decision IN ('aprovado', 'reprovado')),
  reason TEXT,
  step TEXT NOT NULL CHECK (step IN ('lider_review', 'gestor_review')),
  decided_at TIMESTAMP DEFAULT NOW()
);
```

#### `public.audit_log`
Trilha de auditoria (append-only):
```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  performed_by UUID REFERENCES public.profiles(id),
  changes JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
```

## 4. RLS (Row Level Security)

Todas as tabelas sensveis devem ter RLS ativado. Polices devem ser criadas por role e operacao.

### Exemplo: kb_items
```sql
ALTER TABLE public.kb_items ENABLE ROW LEVEL SECURITY;

-- Membros do time vem itens publicados
CREATE POLICY "members_see_published_items" ON public.kb_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = kb_items.team_id
        AND user_id = auth.uid()
    )
    AND status = 'publicado'
  );

-- Autor ve seus rascunhos
CREATE POLICY "author_sees_own_drafts" ON public.kb_items
  FOR SELECT
  USING (created_by = auth.uid());

-- Membro cria item no seu time
CREATE POLICY "member_create_item" ON public.kb_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = kb_items.team_id
        AND user_id = auth.uid()
        AND role IN ('gestor', 'lider', 'membro')
    )
  );

-- Gestor publica
CREATE POLICY "gestor_publish_item" ON public.kb_items
  FOR UPDATE
  USING (
    status IN ('aguardando_aprovacao_gestor', 'ajustes_solicitados')
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = kb_items.team_id
        AND user_id = auth.uid()
        AND role = 'gestor'
    )
  )
  WITH CHECK (
    status IN ('publicado', 'rejeitado')
  );
```

## 5. Autenticacao

### Fluxos

#### Login
1. Usuario entra email/senha
2. Supabase Auth autentica
3. JWT token armazenado no localStorage/cookie seguro
4. Middleware valida token em cada requisicao
5. Redireciona para dashboard

#### Primeiro Acesso (Convite do Gestor)
1. Gestor cria usuario com email
2. Email de convite enviado com link para `/definir-senha`
3. Usuario clica no link, entra senha e confirma
4. Usuario e adicionado ao time com role definido
5. Usuario redireciona ao dashboard

#### Recuperacao de Senha
1. Usuario clica "Esqueci minha senha"
2. Entra email
3. Supabase envia email com link de reset (`.../atualizar-senha?token=...`)
4. Usuario abre link, confirma nova senha
5. Senhaatualizada, usuario redireciona ao login

## 6. Workflow de Aprovacao

### Estados
- `rascunho`: Autor editando
- `aguardando_revisao_lider`: Submetido, aguardando revisor
- `ajustes_solicitados`: Lider devolveu para ajustes
- `aguardando_aprovacao_gestor`: Lider aprovou, aguardando gestor
- `publicado`: Gestor publicou
- `rejeitado`: Reprovacao final

### Transicoes

| Estado Atual | Proximum Estado | Quem Pode | Condicao |
|---|---|---|---|
| Rascunho | Aguardando Revisao | Membro/Lider | Enviar para aprovacao |
| Aguardando Revisao | Ajustes Solicitados | Lider | Solicitar mudancas |
| Aguardando Revisao | Aguardando Gestor | Lider | Aprovar tecnicamente |
| Ajustes Solicitados | Aguardando Revisao | Membro/Lider | Reenviar apos ajustes |
| Aguardando Gestor | Publicado | Gestor | Aprovar e publicar |
| Aguardando Gestor | Rejeitado | Gestor | Rejeitar |
| * | Rascunho | Autor | Salvar novo rascunho (em qualquer etapa) |

## 7. Endpoints API

### Auth
- POST `/api/auth/login` - Login
- POST `/api/auth/logout` - Logout
- POST `/api/auth/reset-password` - Solicitar reset
- POST `/api/auth/update-password` - Atualizar senha
- POST `/api/auth/signup` - Criar conta (via convite)

### Teams
- GET `/api/teams` - Listar times do usuario
- POST `/api/teams` - Criar time (admin maximo)
- GET `/api/teams/:id` - Detalhe
- PUT `/api/teams/:id` - Atualizar
- DELETE `/api/teams/:id` - Desativar

### Team Members
- GET `/api/teams/:id/members` - Listar membros
- POST `/api/teams/:id/members` - Convidar membro (gestor)
- PUT `/api/teams/:id/members/:memberId` - Atualizar papel
- DELETE `/api/teams/:id/members/:memberId` - Remover membro

### Knowledge Base
- GET `/api/teams/:id/kb` - Listar itens
- POST `/api/teams/:id/kb` - Criar item
- GET `/api/teams/:id/kb/:itemId` - Detalhe
- PUT `/api/teams/:id/kb/:itemId` - Atualizar rascunho
- POST `/api/teams/:id/kb/:itemId/submit` - Submeter para aprovacao
- POST `/api/teams/:id/kb/:itemId/approve` - Aprovar/Rejeitar

## 8. Seguranca

- RLS em nivel de banco (Postgres)
- HTTPS apenas
- JWT com expiracao
- CORS configurado
- Rate limiting (Vercel)
- Validacao de input (Zod)
- Sanitizacao de HTML no editor (Tiptap)
- Audit log de todas as acoes

## 9. Performance

- Edge caching com Vercel
- ISR (Incremental Static Regeneration) para listas
- Lazy loading de componentes
- Infinite scroll/pagina para listas longas
- Indexes no Postgres para buscas frequentes
- Connection pooling no Supabase

## 10. Observabilidade

- Logs estruturados (JSON)
- Audit log no Postgres
- Erros capturados e enviados para Sentry (opcional)
- Analytics com Vercel Analytics

