/**
 * Tipos que espelham exatamente o schema Prisma e as respostas do backend.
 * Nada aqui é inventado: cada campo existe no trabalho-backend.
 */

export type Usuario = {
  id: number;
  nome: string;
  email: string;
};

export type Profile = {
  id: number;
  usuarioId: number;
  telefone: string | null;
  endereco: string | null;
  createdAt: string;
  usuario?: Usuario;
};

export type Loja = {
  id: number;
  nome: string;
  descricao: string | null;
  usuarioId: number;
};

/** Imagem da galeria (tabela ProdutoImagem). `url` é um caminho público do backend, ex.: /uploads/produtos/<uuid>.jpg */
export type ProdutoImagem = {
  id: number;
  produtoId: number;
  url: string;
  nomeOriginal: string | null;
  ordem: number;
  createdAt: string;
};

export type Produto = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  lojaId: number;
  /** Imagem principal (null = produto sem imagem) */
  imagemUrl: string | null;
  /** Galeria — vem em GET /produtos, GET /produtos/:id e GET /lojas/:id */
  imagens?: ProdutoImagem[];
};

/** GET /lojas/:id inclui os produtos da loja */
export type LojaComProdutos = Loja & { produtos: Produto[] };

export type Pedido = {
  id: number;
  usuarioId: number;
  data: string;
  valorTotal: number;
  status: string;
};

export type ItemPedido = {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
};

/** GET /pedidos/:id inclui usuário (sem senha) e itens com produto */
export type PedidoDetalhe = Pedido & {
  usuario: Usuario;
  itens: (ItemPedido & { produto: Produto })[];
};

// ---- DTOs (corpo das requisições) ----

export type LoginDto = { email: string; senha: string };
export type LoginResponse = { access_token: string };
export type CreateUsuarioDto = { nome: string; email: string; senha: string };
export type UpdateUsuarioDto = Partial<CreateUsuarioDto> & {
  /** Obrigatória para trocar e-mail ou senha */
  senhaAtual?: string;
};
/** O dono da loja vem do token — o cliente não envia usuarioId */
export type CreateLojaDto = { nome: string; descricao?: string };
export type CreateProdutoDto = {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  lojaId: number;
};
/**
 * Checkout: só produtos e quantidades. Preço, total, status e comprador
 * são definidos pelo backend (com os dados do banco).
 */
export type CreatePedidoDto = { itens: { produtoId: number; quantidade: number }[] };
/** PUT /profiles/me — o perfil é sempre do usuário do token */
export type UpdateProfileDto = { telefone?: string; endereco?: string };
