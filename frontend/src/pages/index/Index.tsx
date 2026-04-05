import { useEffect, useState } from "react";
import { fetchDadosPagina } from "../../services/api";
import type { DadosPagina } from "../../services/api";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import "./Index.css";

export function IndexPage() {
  const [dados, setDados] = useState<DadosPagina | null>(null);

  useEffect(() => {
    fetchDadosPagina().then(setDados).catch(console.error);
  }, []);

  if (!dados) return null;

  return (
    <>
      <header className="header">
        <nav>
          <span className="logo">{dados.nome}</span>
          <ul>
            <li><a href="#servicos">Serviços</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <h1>{dados.descricao}</h1>
        <p>
          Transformamos ideias em produtos digitais que funcionam de verdade.
          Do planejamento à entrega, cuidamos de cada etapa.
        </p>
        <div className="hero-actions">
          <Button href="#contato">Fale conosco</Button>
          <Button href="#servicos" variant="outline">Ver serviços</Button>
        </div>
      </section>

      <section id="servicos" className="servicos">
        <h2>Nossos serviços</h2>
        <div className="servicos-grid">
          {dados.servicos.map((s) => (
            <Card key={s.titulo} titulo={s.titulo} descricao={s.descricao} />
          ))}
        </div>
      </section>

      <section id="contato" className="contato">
        <h2>Contato</h2>
        <div className="contato-info">
          <p>{dados.contato.email}</p>
          <p>{dados.contato.telefone}</p>
          <p>{dados.contato.endereco}</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 {dados.nome}. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
