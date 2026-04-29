import emptyBookshelfImage from "../../../assets/images/empty-bookshelf.png";
import "./BookshelfEmptyState.scss";

export function BookshelfEmptyState() {
    return (
        <div className="bookshelf-empty-state">
            <img
                className="bookshelf-empty-state-image"
                src={emptyBookshelfImage}
                alt="Estante vazia"
            />
            <h2 className="bookshelf-empty-state-title">Sua estante está vazia</h2>
            <p className="bookshelf-empty-state-subtitle">
                Adicione livros para começar a organizar sua coleção
            </p>
        </div>
    );
}
