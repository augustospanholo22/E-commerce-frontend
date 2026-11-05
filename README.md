# Vitrine — Frontend

Interface web do **Vitrine**, um marketplace acadêmico de lojas independentes: catálogo, páginas de produto e de loja, sacola, checkout, área do cliente (perfil e pedidos) e painel do vendedor (lojas, produtos e fotos).

Feito com **Next.js 16** (App Router, Cache Components), **React 19**, **TypeScript** e **Tailwind CSS v4**, integrado ao backend NestJS [E-commerce-Backend](https://github.com/augustospanholo22/E-commerce-Backend).

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ e npm 10+
- Backend rodando (veja o README do backend) — por padrão em `http://localhost:3000`

## Instalação e execução

```bash
npm ci                         # instala as versões exatas do package-lock.json
cp .env.example .env.local     # Windows (PowerShell): copy .env.example .env.local
npm run dev                    # http://localhost:3001
```

| Variável (`.env.local`) | Padrão | Descrição |
|---|---|---|
| `API_URL` | `http://localhost:3000` | URL do backend. Lida **só no servidor** do Next (não é `NEXT_PUBLIC_`), nunca vai para o navegador. |

Nenhum segredo fica no frontend.

| Comando | O que faz |
|---|---|
| `npm run dev` | Desenvolvimento em `http://localhost:3001` |
| `npm run build` / `npm run start` | Build de produção / executa o build |
| `npm run lint` | ESLint (regras do Next + React) |
| `npx tsc --noEmit` | Verificação de tipos (rode `npx next typegen` antes, na primeira vez) |

## Como o frontend fala com o backend

| Quem chama | Como | Arquivo |
|---|---|---|
| Server Components (páginas públicas) | `fetch(API_URL + "/produtos")` direto no servidor | `lib/server-api.ts` |
| Navegador (login, checkout, painel…) | `fetch("/api/...")` → o `rewrites` do Next repassa para `API_URL` | `lib/api.ts`, `next.config.ts` |

Assim o navegador nunca chama a porta 3000 diretamente (não depende de CORS).

### Endpoints usados

| Tela | Endpoints |
|---|---|
| Home, catálogo, lojas | `GET /produtos`, `GET /lojas`, `GET /lojas/:id` |
| Produto | `GET /produtos/:id`, `GET /lojas/:id` |
| Cadastro / login | `POST /users`, `POST /auth/login` |
| Sessão | `GET /users/me` |
| Minha conta | `PUT /users/:id` (trocar e-mail/senha exige a senha atual), `GET/PUT /profiles/me` |
| Checkout | `GET /produtos` (confere preço/estoque), `PUT /profiles/me`, `POST /pedidos` `{ itens: [{ produtoId, quantidade }] }` |
| Pedidos | `GET /pedidos`, `GET /pedidos/:id`, `PATCH /pedidos/:id/cancelar` |
| Painel do vendedor | `POST/PUT/DELETE /lojas`, `POST/PUT/DELETE /produtos`, rotas de imagens, `GET /itens-pedido` (vendas) |

O total do pedido, os preços e o estoque são calculados e validados **pelo backend**; o frontend envia apenas produtos e quantidades.

### Autenticação

- O token de `POST /auth/login` é guardado no `localStorage` e enviado como `Authorization: Bearer <token>`.
- Ao expirar (padrão 1h) ou ao receber `401`, a sessão é encerrada e o usuário é avisado.
- Páginas como Conta, Checkout e Painel redirecionam para o login — mas **quem garante a segurança é o backend**, que valida o token e o dono de cada recurso em todas as rotas.

### Segurança no frontend

- Sem `dangerouslySetInnerHTML`, sem segredos e sem variáveis `NEXT_PUBLIC_`.
- Cabeçalhos `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` e `Permissions-Policy` (`next.config.ts`).
- Mensagens de erro mostram apenas o texto retornado pela API (sem stack traces).
- **Limitação:** o JWT no `localStorage` pode ser lido por um script malicioso caso exista uma falha de XSS. A evolução recomendada é usar cookie `HttpOnly` (exige mudança no backend).

## Estrutura

```
app/                  rotas (/, /produtos, /produtos/[id], /lojas, /lojas/[id],
                      /login, /cadastro, /carrinho, /checkout, /conta, /conta/pedidos,
                      /conta/pedidos/[id], /painel)
components/ui         botões, campos, badges, modal, estados (vazio/erro/skeleton)
components/layout     header, footer, sacola lateral, providers
components/product    card, arte gerada, catálogo com filtros, painel de compra
components/store      card e arte das lojas
components/home       hero e seções da página inicial
context/              auth (JWT), cart (localStorage), toast
lib/                  clientes HTTP, tipos (espelham os DTOs), formatação, erros
```

## Identidade visual

Tema escuro, minimalista e tecnológico, com destaque em verde neon.

| Token (Tailwind) | Cor | Uso |
|---|---|---|
| `canvas` | `#171717` | fundo principal |
| `surface` | `#232323` | cards e superfícies |
| `muted` | `#B9B9B9` | textos secundários |
| `fg` | `#FFFFFF` | textos de alto contraste |
| `brand` / `on-brand` | `#A2EC34` / `#171717` | botões principais, estados ativos, indicadores |

- Toda a paleta está em `app/globals.css` (bloco `@theme`). Os componentes usam só os nomes dos tokens (`bg-surface`, `text-muted`, `bg-brand`…).
- **Tipografia:** Syne (títulos) + Geist (interface), auto-hospedadas via Fontsource.
- O neon fica restrito a ações e indicadores; seleções usam o tom suave `brand-soft`.

## Fotos dos produtos

O vendedor envia as fotos no **Painel do vendedor → Novo produto / Editar** (seção "Imagens do produto"):

- até **8 imagens** por produto, **JPG, PNG ou WebP**, até **5 MB** cada;
- prévia antes de salvar, nome e tamanho do arquivo, remover/desfazer e escolha da **imagem principal**;
- validação no navegador (formato real lido dos bytes do arquivo, tamanho e quantidade) **e** no backend.

Ao salvar, o formulário: grava os dados (JSON) → remove as imagens marcadas → envia as novas em
`multipart/form-data` (`POST /produtos/:id/imagens`, campo `imagens`) → define a principal.

O backend guarda o arquivo em `trabalho-backend/uploads/produtos/` e salva no banco só o caminho
(`/uploads/produtos/<uuid>.jpg`). O frontend exibe pelo proxy: `/api/uploads/produtos/<uuid>.jpg`
(`lib/product-images.ts`). Produtos sem foto usam a capa neutra de `components/product/product-art.tsx`,
que também é usada se um arquivo falhar ao carregar.

Capas de **loja** continuam opcionais e locais (`STORE_IMAGES` em `lib/product-images.ts`, pasta `public/lojas/`).
