import "./BookshelfSkeleton.scss";

const SKELETON_CARDS = 12;

export function BookshelfSkeleton() {
    return (
        <div className="bookshelf-skeleton">
            <div className="bookshelf-skeleton-grid">
                {Array.from({ length: SKELETON_CARDS }, (_, i) => (
                    <div key={i} className="bookshelf-skeleton-card">
                        <div className="bookshelf-skeleton-cover" />
                        <div className="bookshelf-skeleton-title" />
                        <div className="bookshelf-skeleton-author" />
                        <div className="bookshelf-skeleton-stars" />
                    </div>
                ))}
            </div>
        </div>
    );
}
