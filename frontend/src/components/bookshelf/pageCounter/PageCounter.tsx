import "./PageCounter.scss";

interface PageCounterProps {
    totalPagesRead: number;
}

export function PageCounter({ totalPagesRead }: PageCounterProps) {
    return (
        <div className="page-counter">
            <span className="material-symbols-outlined page-counter-icon">auto_stories</span>
            <span className="page-counter-value">{totalPagesRead.toLocaleString("pt-BR")}</span>
            <span className="page-counter-label">PÁGINAS LIDAS</span>
        </div>
    );
}