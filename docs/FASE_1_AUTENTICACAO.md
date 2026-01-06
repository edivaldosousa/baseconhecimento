# FASE 1: Implementacao de Autenticacao com Supabase

## Objetivo
Implementar o sistema completo de autenticacao (login, recuperacao de senha, primeiro acesso) usando Supabase Auth com Next.js 14 App Router.

## Tempo Estimado
**3 dias de desenvolvimento**

## Tarefas

### 1. Criar Projeto Next.js (30 minutos)

```bash
npx create-next-app@latest baseconhecimento-web \
  --typescript \
  --tailwind \
  --app \
  --no-eslint \
  --src-dir \
  --import-alias '@/*'

cd baseconhecimento-web
```

**Estrutura criada:**
```
src/
  app/
    layout.tsx
    page.tsx
  globals.css
package.json
next.config.js
tsconfig.json
tailwind.config.js
```

### 2. Instalar Dependencias Supabase (20 minutos)

```bash
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add zod zustand
pnpm add -D @types/node @types/react @types/react-dom
```

**Versoes recomendadas:**
- @supabase/supabase-js: ^2.39.0
- @supabase/auth-helpers-nextjs: ^0.7.0
- zod: ^3.22.0
- zustand: ^4.4.0

### 3. Configurar Variaveis de Ambiente (10 minutos)

Atualizar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zcyoaijntzwxxuqsggit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Criar Cliente Supabase (45 minutos)

**Arquivo: `src/lib/supabase-client.ts`**
```typescript
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
```

**Arquivo: `src/lib/supabase-server.ts`**
```typescript
import { createServerClient, serializeCookieHeader } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Handle error
          }
        },
      },
    },
  )
}
```

### 5. Criar Layout Com Provedor (30 minutos)

**Arquivo: `src/app/layout.tsx`**
```typescript
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'baseconhecimento - Plataforma de Base de Conhecimento',
  description: 'Sistema corporativo de base de conhecimento com workflow de aprovacao',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

### 6. Estrutura de Rotas de Autenticacao (2 horas)

**Pasta: `src/app/(auth)`**

Criar grupo de rotas (parenteses no Next.js agrupam sem afetar URL):
- `/entrar` (login)
- `/recuperar-senha` (password reset request)
- `/atualizar-senha` (password reset completion)
- `/primeira-vez` (first login)

### 7. Implementar Pagina `/entrar` (1 hora)

**Arquivo: `src/app/(auth)/entrar/page.tsx`**

**Fluxo:**
1. Renderizar formulario com email e senha
2. Ao submeter, chamar `signInWithPassword` do Supabase
3. Se sucesso, redirecionar para `/dashboard`
4. Se erro, exibir mensagem
5. Link para "Esqueci minha senha" -> `/recuperar-senha`

**Componentes:**
- Input de email (validar com Zod)
- Input de senha (validar com Zod)
- Botao de login
- Link para recuperacao
- Mensagens de erro

### 8. Implementar Pagina `/recuperar-senha` (1 hora)

**Arquivo: `src/app/(auth)/recuperar-senha/page.tsx`**

**Fluxo:**
1. Renderizar formulario com email
2. Ao submeter, chamar `resetPasswordForEmail` do Supabase
3. Supabase envia email com link de reset (com token)
4. Exibir mensagem: "Email enviado com instrucoes"
5. Link para voltar ao `/entrar`

**Redirect URL no email:**
```
https://seu-dominio/atualizar-senha?token=xxx
```

### 9. Implementar Pagina `/atualizar-senha` (1 hora)

**Arquivo: `src/app/(auth)/atualizar-senha/page.tsx`**

**Fluxo:**
1. Usuario clica no link do email -> desembarca aqui com token
2. Supabase automaticamente autentica via token (session criada)
3. Renderizar formulario com senha nova e confirmacao
4. Ao submeter, chamar `updateUser({ password: novaSenha })`
5. Se sucesso, redirecionar para `/dashboard`

### 10. Middleware de Autenticacao (45 minutos)

**Arquivo: `src/middleware.ts`**

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}
```

### 11. Pagina Home/Dashboard Basica (30 minutos)

**Arquivo: `src/app/page.tsx` ou `src/app/(protected)/dashboard/page.tsx`**

**Fluxo:**
1. Verificar se usuario esta autenticado
2. Se sim, exibir: "Bem-vindo, [nome_usuario]!"
3. Botao de logout
4. Se nao, redirecionar para `/entrar`

### 12. Componente de Logout (20 minutos)

**Arquivo: `src/app/components/auth/LogoutButton.tsx`**

```typescript
'use client'

import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/entrar')
  }

  return (
    <button onClick={handleLogout}>
      Sair
    </button>
  )
}
```

### 13. Testes Manuais (1 hora)

**Checklist:**
- [ ] Abrir `http://localhost:3000/entrar`
- [ ] Tentar login com email invalido (exibir erro)
- [ ] Tentar login com senha errada (exibir erro)
- [ ] Login com email/senha correto (redirecionar para dashboard)
- [ ] Ver messagem "Bem-vindo"
- [ ] Clicar "Esqueci minha senha"
- [ ] Submeter email
- [ ] Abrir email no Supabase Dashboard ou tool de teste
- [ ] Clicar no link (redireciona para `/atualizar-senha`)
- [ ] Digitar nova senha e submeter
- [ ] Redireciona para dashboard
- [ ] Clicar "Sair"
- [ ] Verifica se redireciona para `/entrar`

### 14. Deploy no Vercel (30 minutos)

```bash
# Instalar CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Ou vincular ao GitHub
vercel link
git push origin main
# Vercel faz deploy automaticamente
```

**Configurar Variavel de Ambiente na Vercel:**
- Ir em Project Settings -> Environment Variables
- Adicionar as mesmas 3 variáveis do `.env.local`

**Configurar Redirect URLs no Supabase:**
- Supabase Dashboard -> Settings -> Auth -> Redirect URLs
- Adicionar:
  ```
  https://seu-dominio-vercel.vercel.app/entrar
  https://seu-dominio-vercel.vercel.app/atualizar-senha
  ```

---

## Arquivos a Serem Criados

```
src/
  lib/
    supabase-client.ts         ✓ Cliente browser
    supabase-server.ts         ✓ Cliente server
  app/
    (auth)/                    ✓ Grupo de rotas
      entrar/
        page.tsx              ✓ Pagina de login
      recuperar-senha/
        page.tsx              ✓ Pagina de reset
      atualizar-senha/
        page.tsx              ✓ Pagina de update
      layout.tsx              ✓ Layout da auth
    (protected)/
      dashboard/
        page.tsx              ✓ Dashboard home
      layout.tsx              ✓ Layout protegido
    components/
      auth/
        LogoutButton.tsx       ✓ Botao de logout
    layout.tsx                ✓ Layout raiz
    page.tsx                  ✓ Redirect para /entrar
    globals.css               ✓ Estilos globais
  middleware.ts               ✓ Middleware de auth
.env.local                    ✓ Variaveis (ja existe)
package.json                  ✓ Dependencias
```

---

## Notas Importantes

⚠️ **Seguranca:**
- Nunca commitar `.env.local`
- Usar `NEXT_PUBLIC_` apenas para valores publicos (SUPABASE_URL, ANON_KEY)
- Service Role Key NUNCA em client-side

⚠️ **Redirect URLs:**
- Configurar corretamente no Supabase
- Caso contrario, o fluxo de reset de senha nao funciona

⚠️ **Email:**
- Supabase envia emails de teste para console
- Em producao, configurar SMTP ou usar SendGrid

---

Proximo passo: FASE 2 - Criar migrations SQL do banco de dados
