# Vitrine — frontend do e-commerce

Frontend em **Next.js 16** (App Router, Cache Components) + **Tailwind CSS v4**, integrado ao backend NestJS do repositório `trabalho-backend`.

## Como rodar

```bash
# 1) backend (pasta trabalho-backend) — porta 3000
npm run start:dev

# 2) frontend (esta pasta) — porta 3001
npm install          # instala lucide-react e as fontes (Fraunces/Geist)
npm run dev          # http://localhost:3001
```

A URL da API fica em `.env.local` (modelo em `.env.example`):

```
API_URL=http://localhost:3000
```

## Como o frontend fala com o backend

O backend **não habilita CORS**, então o navegador nunca chama a porta 3000 diretamente:

| Quem chama | Como | Arquivo |
|---|---|---|
| Server Components (páginas públicas) | `fetch(API_URL + "/produtos")` direto no Node | `lib/server-api.ts` |
| Navegador (login, checkout, painel…) | `fetch("/api/produtos")` → o `rewrites` do Next repassa para `API_URL` | `lib/api.ts`, `next.config.ts` |

### Endpoints usados (todos reais)

| Tela | Endpoints |
|---|---|
| Home, catálogo, lojas | `GET /produtos`, `GET /lojas`, `GET /lojas/:id` |
| Produto | `GET /produtos/:id`, `GET /lojas/:id` |
| Cadastro / login | `POST /users`, `POST /auth/login` |
| Sessão (nome do usuário) | `GET /users/:id` — o id vem do campo `sub` do JWT, pois não existe `/me` |
| Perfil | `PUT /users/:id`, `GET /profiles`, `POST /profiles`, `PUT /profiles/:id` |
| Checkout | `GET /produtos` (confere preço/estoque), `POST /pedidos`, `POST /itens-pedido` |
| Pedidos | `GET /pedidos` (filtrado pelo usuário), `GET /pedidos/:id`, `PUT /pedidos/:id` (cancelar) |
| Painel do vendedor | `POST/PUT/DELETE /lojas`, `POST/PUT/DELETE /produtos`, `GET /itens-pedido` (vendas) |

### Autenticação JWT

- O token de `POST /auth/login` é salvo no `localStorage` e enviado como `Authorization: Bearer <token>` nas rotas protegidas.
- O token expira em **1h** (configuração do backend): o frontend faz logout automático na expiração ou ao receber um `401`.
- `context/auth.tsx` lê o token com `useSyncExternalStore` (fica sincronizado entre abas).

## Limitações do backend (tratadas no frontend, sem alterar o backend)

1. **Sem CORS** → proxy via `rewrites`.
2. **Sem `/me`** → id do usuário lido do JWT.
3. **`GET /pedidos` e `GET /profiles` retornam dados de todos os usuários** → o frontend filtra pelo usuário logado. ⚠️ Isso é uma falha de segurança que deve ser corrigida no backend (filtrar pelo `request.user.sub`).
4. **Checkout não é transacional e não baixa estoque** → o pedido é criado e depois cada item; o status fica `PENDENTE`. Nenhum pagamento é simulado.
5. **Produto não tem imagem nem categoria** → cada produto recebe uma capa ilustrada gerada em SVG a partir do id e do nome (`components/product/product-art.tsx`); as lojas funcionam como "coleções".
6. **E-mail duplicado e exclusões com chave estrangeira retornam 500** → mensagens amigáveis no cadastro e no painel.

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
