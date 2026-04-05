import "./Card.css";

interface CardProps {
  titulo: string;
  descricao: string;
}

export function Card({ titulo, descricao }: CardProps) {
  return (
    <div className="card">
      <h3>{titulo}</h3>
      <p>{descricao}</p>
    </div>
  );
}
