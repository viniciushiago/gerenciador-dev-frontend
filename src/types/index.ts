export interface Estado {
  id: number;
  nome: string;
  uf: string;
  cidades?: Cidade[];
}

export interface Cidade {
  id: number;
  nome: string;
  estadoId: number;
}

export interface Linguagem {
  id: number;
  nome: string;
  tipo: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface Desenvolvedor {
  id: number;
  nome: string;
  email: string;
  senioridade: string;
  cidadeId: number;
  observacoes?: string;
  linguagens: Linguagem[];
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}