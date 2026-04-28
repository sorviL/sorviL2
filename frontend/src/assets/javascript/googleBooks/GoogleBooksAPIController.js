export class GoogleBooksAPIController {
    #baseUrl = "https://www.googleapis.com/books/v1";
    #apiKey;
    #dropdownMaxResults;
    #currentAbortController = null;

    constructor(dropdownMaxResults = 5) {
        const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

        if (!key) {
            throw new Error(
                "Google Books API key is missing. Set VITE_GOOGLE_BOOKS_API_KEY in your .env file."
            );
        }

        this.#apiKey = key;
        this.#dropdownMaxResults = dropdownMaxResults;
    }

    #buildQueryString(params) {
        const filtered = Object.entries(params).filter(
            ([, value]) => value !== undefined && value !== null && value !== ""
        );

        return new URLSearchParams(filtered).toString();
    }

    async #fetchFromAPI(endpoint, { signal, timeout = 10000 } = {}) {
        const url = `${this.#baseUrl}${endpoint}`;

        const controller = new AbortController();
        let externalAbortHandler = null;
        if (signal) {
            externalAbortHandler = () => controller.abort();
            try {
                signal.addEventListener && signal.addEventListener('abort', externalAbortHandler);
            } catch (e) {
                try { signal.onabort = externalAbortHandler; } catch (e2) {}
            }
        }

        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, { signal: controller.signal });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message = errorBody?.error?.message || `HTTP ${response.status}`;
                throw new Error(`Google Books API error: ${message}`);
            }

            return await response.json();
        } catch (error) {
            if (error && error.name === "AbortError") {
                return null;
            }
            if (error && typeof error.message === 'string' && error.message.startsWith("Google Books API error")) {
                throw error;
            }
            throw new Error(`Network error while fetching from Google Books API: ${error?.message ?? String(error)}`);
        } finally {
            clearTimeout(timeoutId);
            if (signal && externalAbortHandler) {
                try { signal.removeEventListener && signal.removeEventListener('abort', externalAbortHandler); } catch (e) {}
                try { if (signal.onabort === externalAbortHandler) signal.onabort = null; } catch (e) {}
            }
        }
    }

    #extractISBN(identifiers, type) {
        if (!Array.isArray(identifiers)) return null;

        const match = identifiers.find((id) => id.type === type);
        return match?.identifier ?? null;
    }

    #ensureHttps(url) {
        if (!url) return null;
        return url.replace(/^http:\/\//i, "https://");
    }

    #formatVolumeData(rawVolume) {
        const info = rawVolume.volumeInfo ?? {};
        const identifiers = info.industryIdentifiers;
        const images = info.imageLinks ?? {};

        return {
            bookId: rawVolume.id,
            bookTitle: info.title ?? null,
            bookSubtitle: info.subtitle ?? null,
            bookAuthors: info.authors ?? [],
            bookPublisher: info.publisher ?? null,
            bookPublishedDate: info.publishedDate ?? null,
            bookDescription: info.description ?? null,
            bookPageCount: info.pageCount ?? null,
            bookCategories: info.categories ?? [],
            bookAverageRating: info.averageRating ?? null,
            bookRatingsCount: info.ratingsCount ?? null,
            bookLanguage: info.language ?? null,
            bookIsbn10: this.#extractISBN(identifiers, "ISBN_10"),
            bookIsbn13: this.#extractISBN(identifiers, "ISBN_13"),
            bookCoverImage: this.#ensureHttps(images.thumbnail),
            bookSmallCoverImage: this.#ensureHttps(images.smallThumbnail),
            bookPreviewLink: this.#ensureHttps(info.previewLink),
            bookInfoLink: this.#ensureHttps(info.infoLink),
        };
    }

    #formatDropdownItem(rawVolume) {
        const info = rawVolume.volumeInfo ?? {};
        const images = info.imageLinks ?? {};

        return {
            bookId: rawVolume.id,
            bookTitle: info.title ?? null,
            bookAuthors: info.authors ?? [],
            bookCoverImage: this.#ensureHttps(images.thumbnail),
        };
    }

    #formatSearchResponse(data) {
        const items = data.items ?? [];

        return {
            totalItems: data.totalItems ?? 0,
            books: items.map((item) => this.#formatVolumeData(item)),
        };
    }

    async #executeSearch(queryTerm, options = {}) {
        const {
            maxResults,
            startIndex,
            orderBy,
            langRestrict,
        } = options;

        const queryString = this.#buildQueryString({
            q: queryTerm,
            key: this.#apiKey,
            maxResults,
            startIndex,
            orderBy,
            langRestrict,
            printType: "books",
        });

        const data = await this.#fetchFromAPI(`/volumes?${queryString}`);
        return this.#formatSearchResponse(data);
    }

    async searchBooks(query, options = {}) {
        if (!query?.trim()) {
            throw new Error("Search query cannot be empty.");
        }

        return this.#executeSearch(query.trim(), options);
    }

    async searchByTitle(title, options = {}) {
        if (!title?.trim()) {
            throw new Error("Title cannot be empty.");
        }

        return this.#executeSearch(`intitle:${title.trim()}`, options);
    }

    async searchByAuthor(author, options = {}) {
        if (!author?.trim()) {
            throw new Error("Author name cannot be empty.");
        }

        return this.#executeSearch(`inauthor:${author.trim()}`, options);
    }

    async searchByISBN(isbn) {
        if (!isbn?.trim()) {
            throw new Error("ISBN cannot be empty.");
        }

        const sanitized = isbn.trim().replace(/[-\s]/g, "");
        return this.#executeSearch(`isbn:${sanitized}`, { maxResults: 1 });
    }

    async searchByCategory(category, options = {}) {
        if (!category?.trim()) {
            throw new Error("Category cannot be empty.");
        }

        return this.#executeSearch(`subject:${category.trim()}`, options);
    }

    async getBookDetails(volumeId, options = {}) {
        if (!volumeId?.trim()) {
            throw new Error("Volume ID cannot be empty.");
        }

        const { timeout = 10000 } = options;
        const queryString = this.#buildQueryString({ key: this.#apiKey });
        const data = await this.#fetchFromAPI(`/volumes/${volumeId.trim()}?${queryString}`, { timeout });

        if (data === null) {
            throw new Error("Request aborted or timed out.");
        }

        return this.#formatVolumeData(data);
    }

    async quickSearch(query) {
        if (!query?.trim()) {
            throw new Error("Search query cannot be empty.");
        }

        this.#currentAbortController?.abort();
        this.#currentAbortController = new AbortController();
        const { signal } = this.#currentAbortController;

        const queryString = this.#buildQueryString({
            q: query.trim(),
            key: this.#apiKey,
            maxResults: this.#dropdownMaxResults,
            printType: "books",
            projection: "lite",
        });

        const data = await this.#fetchFromAPI(`/volumes?${queryString}`, { signal });

        this.#currentAbortController = null;

        if (data === null) return null;

        const items = data.items ?? [];
        return {
            totalItems: data.totalItems ?? 0,
            books: items.map((item) => this.#formatDropdownItem(item)),
        };
    }

    cancelPendingSearch() {
        this.#currentAbortController?.abort();
        this.#currentAbortController = null;
    }

    get baseUrl() {
        return this.#baseUrl;
    }
}
