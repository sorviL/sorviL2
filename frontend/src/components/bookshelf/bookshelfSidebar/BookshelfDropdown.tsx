import { useState, useRef, useEffect } from "react";
import type { BookshelfFilter } from "../../../types/bookshelf";
import {
    ShelfStatus as ShelfStatusValues,
    ExtraFilter as ExtraFilterValues,
    ShelfStatusBadgeColor,
    SHELF_STATUS_LABEL,
    EXTRA_FILTER_COLOR,
    EXTRA_FILTER_ICON,
    EXTRA_FILTER_LABEL
} from "../../../types/bookshelf";
import { getFilterLabel, getFilterColor, getFilterIcon } from "./bookshelfFilterUtils";

const ALL_STATUSES = Object.values(ShelfStatusValues);
const ALL_EXTRAS = Object.values(ExtraFilterValues);

interface BookshelfDropdownProps {
    activeFilter: BookshelfFilter | null;
    onFilterChange: (filter: BookshelfFilter | null) => void;
    filterCounts: Record<string, number>;
}

export function BookshelfDropdown({ activeFilter, onFilterChange, filterCounts }: BookshelfDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(filter: BookshelfFilter | null) {
        onFilterChange(filter);
        setIsOpen(false);
    }

    const triggerLabel = activeFilter ? getFilterLabel(activeFilter) : "Todas as categorias";
    const triggerColor = activeFilter ? getFilterColor(activeFilter) : "var(--color-text-primary)";
    const triggerIcon = activeFilter ? getFilterIcon(activeFilter) : "bookmark";

    return (
        <div className="bookshelf-sidebar-dropdown" ref={ref}>
            <button
                className="bookshelf-sidebar-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{ color: triggerColor }}
            >
                <span className="material-icons bookshelf-sidebar-icon">{triggerIcon}</span>
                {triggerLabel}
                <span className="material-icons bookshelf-sidebar-dropdown-arrow">
                    {isOpen ? "expand_less" : "expand_more"}
                </span>
            </button>
            {isOpen && (
                <div className="bookshelf-sidebar-dropdown-menu">
                    <button
                        className={`bookshelf-sidebar-dropdown-item ${activeFilter === null ? "bookshelf-sidebar-dropdown-item-active" : ""}`}
                        onClick={() => handleSelect(null)}
                    >
                        Todas as categorias
                        <span className="bookshelf-sidebar-dropdown-count">{filterCounts["all"] ?? 0}</span>
                    </button>
                    {ALL_STATUSES.map((status) => (
                        <button
                            key={status}
                            className={`bookshelf-sidebar-dropdown-item ${activeFilter === status ? "bookshelf-sidebar-dropdown-item-active" : ""}`}
                            style={{ color: ShelfStatusBadgeColor[status] }}
                            onClick={() => handleSelect(status)}
                        >
                            <span className="material-icons bookshelf-sidebar-icon">bookmark</span>
                            {SHELF_STATUS_LABEL[status]}
                        </button>
                    ))}
                    <div className="bookshelf-sidebar-dropdown-separator" />
                    {ALL_EXTRAS.map((extra) => (
                        <button
                            key={extra}
                            className={`bookshelf-sidebar-dropdown-item ${activeFilter === extra ? "bookshelf-sidebar-dropdown-item-active" : ""}`}
                            style={{ color: EXTRA_FILTER_COLOR[extra] }}
                            onClick={() => handleSelect(extra)}
                        >
                            <span className="material-icons bookshelf-sidebar-icon">{EXTRA_FILTER_ICON[extra]}</span>
                            {EXTRA_FILTER_LABEL[extra]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
