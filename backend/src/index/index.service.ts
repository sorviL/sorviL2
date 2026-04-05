export interface DadosPagina {
  nome: string;
  descricao: string;
  servicos: Servico[];
  contato: Contato;
}

export interface Servico {
  titulo: string;
  descricao: string;
}

export interface Contato {
  email: string;
  telefone: string;
  endereco: string;
}

export function getDadosPagina(): DadosPagina {
  return {
    nome: "Sorvil",
    descricao: "Soluções digitais para o seu negócio",
    servicos: [
      {
        titulo: "Desenvolvimento Web",
        descricao:
          "Sites e aplicações modernas, rápidas e responsivas.",
      },
      {
        titulo: "Consultoria",
        descricao:
          "Análise e planejamento para otimizar seus processos.",
      },
      {
        titulo: "Suporte",
        descricao:
          "Acompanhamento contínuo para manter tudo funcionando.",
      },
    ],
    contato: {
      email: "contato@sorvil.com",
      telefone: "(11) 99999-0000",
      endereco: "São Paulo, SP",
    },
  };
}
