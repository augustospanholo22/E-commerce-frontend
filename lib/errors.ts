/**
 * Erro padronizado para respostas da API.
 * O NestJS devolve erros no formato:
 *   { statusCode: 400, message: "texto" | ["texto 1", "texto 2"], error: "Bad Request" }
 */
export class ApiError extends Error {
  status: number;
  messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? "Erro inesperado");
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
  }
}

/** Traduz as mensagens padrão do class-validator para algo amigável. */
const TRADUCOES: [RegExp, string][] = [
  [/email must be an email/i, "Informe um e-mail válido."],
  [/senha must be longer than or equal to 6/i, "A senha precisa ter pelo menos 6 caracteres."],
  [/(\w+) should not be empty/i, "Preencha todos os campos obrigatórios."],
  [/(\w+) must be a number/i, "Informe um número válido."],
  [/(\w+) must be an integer/i, "Informe um número inteiro."],
  [/Unique constraint failed/i, "Este registro já existe."],
  [/File too large/i, "Cada imagem pode ter no máximo 5 MB."],
  [/Too many files/i, "Envie no máximo 8 imagens por vez."],
  [/Unexpected field/i, "Campo de arquivo inválido."],
];

export function friendlyMessage(msg: string): string {
  for (const [re, txt] of TRADUCOES) if (re.test(msg)) return txt;
  return msg;
}

export function parseNestError(status: number, body: unknown): ApiError {
  let messages: string[] = [];
  if (body && typeof body === "object" && "message" in body) {
    const m = (body as { message: unknown }).message;
    if (Array.isArray(m)) messages = m.map(String);
    else if (typeof m === "string") messages = [m];
  }
  // Limite de tentativas (login/cadastro) — a mensagem padrão vem em inglês
  if (status === 429) messages = ["Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente."];
  if (messages.length === 0) {
    messages = [
      status === 500
        ? "O servidor não conseguiu concluir a operação."
        : status === 404
          ? "Recurso não encontrado."
          : `Erro ${status} na requisição.`,
    ];
  }
  return new ApiError(status, [...new Set(messages.map(friendlyMessage))]);
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.messages.join(" ");
  if (err instanceof TypeError) return "Não foi possível conectar à API. Verifique se o backend está rodando.";
  if (err instanceof Error) return err.message;
  return "Erro inesperado.";
}
