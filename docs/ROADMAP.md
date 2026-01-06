# ROADMAP - Plataforma de Base de Conhecimento

## Visão Geral
Este documento detalha o plano de desenvolvimento da plataforma baseconhecimento 
em fases iterativas, com estimativas de tempo e dependências.

## Fases de Desenvolvimento

### FASE 1: Fundação (Semana 1)
**Objetivo:** Setup inicial e autenticação

#### 1.1 - Setup do Projeto Next.js
- Criar projeto com: `npx create-next-app@latest --typescript --tailwind --app`
- Estruturar pastas: `src/app`, `src/components`, `src/lib`, `src/types`, `src/hooks`
- Configurar TypeScript strict mode
- Instalar dependências principais

#### 1.2 - Integração Supabase
- Instalar: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`
- Criar `lib/supabase-client.ts` para cliente JavaScript
- Criar `lib/supabase-server.ts` para lado servidor
- Configurar variáveis de ambiente (.env.local)

#### 1.3 - Autenticação (Páginas)
Criar 3 rotas de autenticação:
- **GET `/entrar`** - Formulário login com email/senha
- **GET `/recuperar-senha`** - Formulário para solicitar reset
- **GET `/atualizar-senha`** - Formulário para nova senha (após link de email)

**Lógica de fluxo:**


**Tempo estimado:** 3 dias

---

### FASE 2: Banco de Dados (Semana 2)
**Objetivo:** Schema SQL completo com migrations e RLS

#### 2.1 - Criar Migrations SQL
Via Supabase CLI ou painel SQL Editor, criar migrations versionadas:

1. **`001_create_tables.sql`** - Tabelas principais
   - `public.profiles` (espelho de auth.users)
   - `public.teams` (times corporativos)
   - `public.team_members` (membros + papéis)

2. **`002_create_kb_tables.sql`** - Knowledge Base
   - `public.kb_items` (metadados do item)
   - `public.kb_versions` (histórico de conteúdo)
   - `public.kb_categories` (categorias)
   - `public.kb_tags` + `public.kb_item_tags` (etiquetas)
   - `public.kb_attachments` (arquivos)

3. **`003_create_approval_tables.sql`** - Workflow
   - `public.kb_approval_requests` (requisições)
   - `public.kb_approval_actions` (decisões)

4. **`004_create_audit_table.sql`** - Auditoria
   - `public.audit_log` (trilha completa)

5. **`005_enable_rls.sql`** - RLS policies
   - Habilitar RLS em todas as tabelas sensíveis
   - Criar policies por papel e time

**Tempo estimado:** 3-4 dias

#### 2.2 - Seed Data (Opcional, para testes)
Criar `supabase/seed.sql` com dados de teste:
- 1 Admin máximo (você)
- 2-3 times de exemplo
- Membros em cada time com papéis variados
- 2-3 itens de conhecimento em rascunho

---

### FASE 3: Layout Base (Semana 3)
**Objetivo:** UI responsiva e componentes reutilizáveis

#### 3.1 - Componentes UI (shadcn/ui)
Criar pasta `src/components/ui/` com componentes:
- Button, Input, Card, Dialog, DropdownMenu, Sidebar, etc.

#### 3.2 - Layout Principal
- **`src/components/layout/SidebarLayout.tsx`** - Layout com sidebar
- **`src/components/layout/Header.tsx`** - Cabeçalho responsivo
- **`src/components/layout/Sidebar.tsx`** - Navegação por time

#### 3.3 - Páginas Base
- `src/app/(auth)/entrar/page.tsx`
- `src/app/(auth)/recuperar-senha/page.tsx`
- `src/app/(auth)/atualizar-senha/page.tsx`
- `src/app/(protected)/dashboard/page.tsx` (home após login)

**Responsividade:**
- Mobile-first com Tailwind
- Sidebar colapsável em mobile
- Menu hamburger para navegação

**Tempo estimado:** 3-4 dias

---

### FASE 4: Admin Panel (Semana 4)
**Objetivo:** Criar e gerenciar times

#### 4.1 - Páginas Admin
- `src/app/(protected)/admin/times/page.tsx` - Listar times
- `src/app/(protected)/admin/times/[id]/page.tsx` - Detalhes do time
- `src/app/(protected)/admin/times/criar/page.tsx` - Criar time

#### 4.2 - Funcionalidades
- POST `/api/teams` - Criar time (admin apenas)
- GET `/api/teams` - Listar times (com filtro admin)
- PUT `/api/teams/:id` - Atualizar gestor
- DELETE `/api/teams/:id` - Desativar time

#### 4.3 - Permissões
- RLS policy: apenas `role = 'admin_maximo'` pode acessar

**Tempo estimado:** 2-3 dias

---

### FASE 5: Gestor Panel (Semana 5)
**Objetivo:** Gerenciar membros do time

#### 5.1 - Páginas Gestor
- `src/app/(protected)/gestor/membros/page.tsx` - Listar membros
- `src/app/(protected)/gestor/membros/convidar/page.tsx` - Convidar membro

#### 5.2 - Funcionalidades
- POST `/api/teams/:id/members` - Convidar (gestor apenas)
  - Gera link de convite ou envia email
- PUT `/api/teams/:id/members/:memberId` - Alterar papel
- DELETE `/api/teams/:id/members/:memberId` - Remover membro

#### 5.3 - Fluxo de Convite


**Tempo estimado:** 3 dias

---

### FASE 6: Knowledge Base MVP (Semana 6-7)
**Objetivo:** CRUD de itens + editor

#### 6.1 - Páginas KB
- `src/app/(protected)/kb/page.tsx` - Listar itens (por time)
- `src/app/(protected)/kb/criar/page.tsx` - Criar item
- `src/app/(protected)/kb/[id]/page.tsx` - Visualizar/editar item

#### 6.2 - Editor Tiptap
```typescript
// src/components/kb/TiptapEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

export function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight,
      // ...
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })
  
  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}



---

## Resumo da Timeline

| Fase | Descricao | Dias | Fim Estimado |
|------|-----------|------|---|
| 1 | Autenticacao | 3 | Dia 3 |
| 2 | Banco de dados | 4 | Dia 7 |
| 3 | Layout Base | 4 | Dia 11 |
| 4 | Admin Panel | 3 | Dia 14 |
| 5 | Gestor Panel | 3 | Dia 17 |
| 6 | Knowledge Base | 6 | Dia 23 |
| 7 | Deploy | 2 | Dia 25 |
| **Total** | | **25 dias** | **Mes 1** |

---

## Padroes de Desenvolvimento

### Commits (Conventional Commits)
- `feat: adicionar pagina de login`
- `fix: corrigir validacao de email`
- `docs: atualizar README`
- `chore: atualizar dependencias`
- `refactor: reorganizar componentes`

### Branch Workflow
```
main (producao)
  ^
  | (PR review obrigatoria)
  |
feature/autenticacao (development)
feature/kb-crud
feature/admin-panel
```

---

## Notas Importantes para Analistas

### RLS (Row Level Security)
- Sempre habilitar RLS em tabelas sensveis
- Testar policies ANTES de publicar
- Audit log eh append-only (nao deletar)

### Autenticacao
- Redirect URLs devem estar corretas no Supabase
- Testar fluxo completo de reset de senha
- Email de convite DEVE funcionar

### Seguranca
- Nunca commitar `.env.local`
- `NEXT_PUBLIC_` apenas para valores publicos
- Validar input com Zod
- Sanitizar HTML no editor

---

Ultima atualizacao: Janeiro 2026
