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

export type Produto = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  lojaId: number;
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
export type UpdateUsuarioDto = Partial<CreateUsuarioDto>;
export type CreateLojaDto = { nome: string; descricao: string; usuarioId: number };
export type CreateProdutoDto = {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  lojaId: number;
};
export type CreatePedidoDto = { usuarioId: number; valorTotal: number; status: string };
export type CreateItemPedidoDto = {
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
};
export type CreateProfileDto = {
  usuarioId: number;
  telefone?: string;
  endereco?: string;
};
