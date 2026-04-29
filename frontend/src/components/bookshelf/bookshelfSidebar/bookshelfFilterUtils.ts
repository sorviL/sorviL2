import type { ShelfStatus, BookshelfFilter } from "../../../types/bookshelf";
import {
    ShelfStatusBadgeColor,
    SHELF_STATUS_LABEL,
    EXTRA_FILTER_LABEL,
    EXTRA_FILTER_COLOR,
    EXTRA_FILTER_ICON
} from "../../../types/bookshelf";

export function getFilterLabel(filter: BookshelfFilter): string {
    if (filter === "favorites" || filter === "reviews") return EXTRA_FILTER_LABEL[filter];
    return SHELF_STATUS_LABEL[filter as ShelfStatus];
}

export function getFilterColor(filter: BookshelfFilter): string {
    if (filter === "favorites" || filter === "reviews") return EXTRA_FILTER_COLOR[filter];
    return ShelfStatusBadgeColor[filter as ShelfStatus];
}

export function getFilterIcon(filter: BookshelfFilter): string {
    if (filter === "favorites" || filter === "reviews") return EXTRA_FILTER_ICON[filter];
    return "bookmark";
}
