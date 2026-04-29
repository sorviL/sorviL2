import type { BookshelfFilter } from "../../../types/bookshelf";
import {
    ShelfStatus as ShelfStatusValues,
    ExtraFilter as ExtraFilterValues,
    SHELF_STATUS_LABEL,
    EXTRA_FILTER_LABEL,
    EXTRA_FILTER_ICON
} from "../../../types/bookshelf";
import { BookshelfDropdown } from "./BookshelfDropdown";
import "./BookshelfSidebar.scss";

const ALL_STATUSES = Object.values(ShelfStatusValues);
const ALL_EXTRAS = Object.values(ExtraFilterValues);

interface BookshelfSidebarProps {
    activeFilter: BookshelfFilter | null;
    onFilterChange: (filter: BookshelfFilter | null) => void;
    filterCounts: Record<string, number>;
}

export function BookshelfSidebar({ activeFilter, onFilterChange, filterCounts }: BookshelfSidebarProps) {
    function handleClick(filter: BookshelfFilter) {
        onFilterChange(filter);
    }

    return (
        <div className="bookshelf-sidebar-filter">
            <div className="bookshelf-sidebar-buttons">
                <button
                    className={`bookshelf-sidebar-button bookshelf-sidebar-button-all ${activeFilter === null ? "bookshelf-sidebar-button-active" : ""}`}
                    onClick={() => onFilterChange(null)}
                >
                    <span className="material-icons bookshelf-sidebar-icon">apps</span>
                    Todos
                    <span className="bookshelf-sidebar-count">{filterCounts["all"] ?? 0}</span>
                </button>

                <div className="bookshelf-sidebar-separator" />

                {ALL_STATUSES.map((status) => (
                    <button
                        key={status}
                        className={
                            `bookshelf-sidebar-button bookshelf-sidebar-button-${status} 
                            ${activeFilter === status ? "bookshelf-sidebar-button-active" : ""}`
                        }
                        onClick={() => handleClick(status)}
                    >
                        <span className="material-icons bookshelf-sidebar-icon">bookmark</span>
                        {SHELF_STATUS_LABEL[status]}
                        <span className="bookshelf-sidebar-count">{filterCounts[status] ?? 0}</span>
                    </button>
                ))}

                <div className="bookshelf-sidebar-separator" />

                {ALL_EXTRAS.map((extra) => (
                    <button
                        key={extra}
                        className={
                            `bookshelf-sidebar-button bookshelf-sidebar-button-${extra} 
                            ${activeFilter === extra ? "bookshelf-sidebar-button-active" : ""}`
                        }
                        onClick={() => handleClick(extra)}
                    >
                        <span className="material-icons bookshelf-sidebar-icon">{EXTRA_FILTER_ICON[extra]}</span>
                        {EXTRA_FILTER_LABEL[extra]}
                        <span className="bookshelf-sidebar-count">{filterCounts[extra] ?? 0}</span>
                    </button>
                ))}
            </div>

            <BookshelfDropdown activeFilter={activeFilter} onFilterChange={onFilterChange} />
        </div>
    );
}
