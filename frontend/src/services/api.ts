export interface Servico {
  titulo: string;
  descricao: string;
}

export interface Contato {
  email: string;
  telefone: string;
  endereco: string;
}

export interface DadosPagina {
  nome: string;
  descricao: string;
  servicos: Servico[];
  contato: Contato;
}

export async function fetchDadosPagina(): Promise<DadosPagina> {
  const res = await fetch("/api");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
