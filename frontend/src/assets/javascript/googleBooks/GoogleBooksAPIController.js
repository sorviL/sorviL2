export class GoogleBooksAPIController {
    #baseUrl = "https://www.googleapis.com/books/v1";
    #apiKey;
    #dropdownMaxResults;
    #currentAbortController = null;

    #retryableStatusCodes = new Set([429, 502, 503, 504]);

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

    #sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async #fetchFromAPI(endpoint, { signal, timeout = 10000, retries = 2 } = {}) {
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

            if (this.#retryableStatusCodes.has(response.status) && retries > 0) {
                await this.#sleep((3 - retries) * 300);
                return this.#fetchFromAPI(endpoint, { signal, timeout, retries: retries - 1 });
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message = errorBody?.error?.message || `HTTP ${response.status}`;
                throw new Error(
                    `Google Books API error (${response.status}) at ${endpoint}: ${message}`
                );
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
                try { 
                    signal.removeEventListener && signal.removeEventListener('abort', externalAbortHandler); 
                } catch (e) {}
                try { 
                    if (signal.onabort === externalAbortHandler) signal.onabort = null; 
                } catch (e) {}
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
        const publishedYear = typeof info.publishedDate === "string"
            ? info.publishedDate.slice(0, 4)
            : null;

        return {
            bookId: rawVolume.id,
            bookTitle: info.title ?? null,
            bookAuthors: info.authors ?? [],
            bookCoverImage: this.#ensureHttps(images.thumbnail),
            bookPublisher: info.publisher ?? null,
            bookPublishedYear: /^\d{4}$/.test(publishedYear ?? "") ? publishedYear : null,
            bookPageCount: info.pageCount ?? null,
        };
    }

    #sortItemsByRating(items) {
        return [...items].sort((a, b) => {
            const aInfo = a?.volumeInfo ?? {};
            const bInfo = b?.volumeInfo ?? {};

            const aAverage = typeof aInfo.averageRating === "number" ? aInfo.averageRating : -1;
            const bAverage = typeof bInfo.averageRating === "number" ? bInfo.averageRating : -1;

            if (bAverage !== aAverage) {
                return bAverage - aAverage;
            }

            const aCount = typeof aInfo.ratingsCount === "number" ? aInfo.ratingsCount : 0;
            const bCount = typeof bInfo.ratingsCount === "number" ? bInfo.ratingsCount : 0;

            if (bCount !== aCount) {
                return bCount - aCount;
            }

            const aTitle = String(aInfo.title ?? "");
            const bTitle = String(bInfo.title ?? "");
            return aTitle.localeCompare(bTitle, "pt-BR", { sensitivity: "base" });
        });
    }

    #normalizeText(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    #mergeUniqueItems(items) {
        const seenIds = new Set();
        const merged = [];

        for (const item of items) {
            const id = item?.id;
            if (!id || seenIds.has(id)) {
                continue;
            }

            seenIds.add(id);
            merged.push(item);
        }

        return merged;
    }

    #scoreQuickSearchItem(rawVolume, normalizedQuery, queryTokens) {
        const info = rawVolume?.volumeInfo ?? {};
        const normalizedTitle = this.#normalizeText(info.title);
        const normalizedAuthors = (info.authors ?? []).map((author) => this.#normalizeText(author));
        const normalizedLanguage = this.#normalizeText(info.language);

        let score = 0;

        if (normalizedTitle === normalizedQuery) {
            score += 120;
        } else if (normalizedTitle.startsWith(normalizedQuery)) {
            score += 90;
        } else if (normalizedTitle.includes(normalizedQuery)) {
            score += 65;
        }

        for (const token of queryTokens) {
            if (normalizedTitle.includes(token)) {
                score += 20;
            }

            if (normalizedAuthors.some((author) => author.includes(token))) {
                score += 5;
            }
        }

        if (normalizedLanguage === "pt" || normalizedLanguage === "pt-br") {
            score += 5;
        }

        const averageRating = typeof info.averageRating === "number" ? info.averageRating : 0;
        const ratingsCount = typeof info.ratingsCount === "number" ? info.ratingsCount : 0;
        score += averageRating * 2;
        score += Math.min(Math.log10(ratingsCount + 1) * 4, 8);

        return score;
    }

    #sortQuickSearchItems(items, query) {
        const normalizedQuery = this.#normalizeText(query);
        const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

        return [...items].sort((a, b) => {
            const scoreA = this.#scoreQuickSearchItem(a, normalizedQuery, queryTokens);
            const scoreB = this.#scoreQuickSearchItem(b, normalizedQuery, queryTokens);

            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }

            const aInfo = a?.volumeInfo ?? {};
            const bInfo = b?.volumeInfo ?? {};
            const aCount = typeof aInfo.ratingsCount === "number" ? aInfo.ratingsCount : 0;
            const bCount = typeof bInfo.ratingsCount === "number" ? bInfo.ratingsCount : 0;

            return bCount - aCount;
        });
    }

    #formatSearchResponse(data) {
        const items = this.#sortItemsByRating(data.items ?? []);

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

        const normalizedQuery = query.trim();
        const maxCandidates = Math.max(this.#dropdownMaxResults * 4, 12);

        const primaryQueryString = this.#buildQueryString({
            q: `intitle:${normalizedQuery}`,
            key: this.#apiKey,
            maxResults: maxCandidates,
            printType: "books",
            langRestrict: "pt",
            orderBy: "relevance",
        });

        const primaryData = await this.#fetchFromAPI(`/volumes?${primaryQueryString}`, { signal });

        if (primaryData === null) return null;

        let mergedItems = primaryData.items ?? [];

        if (mergedItems.length < this.#dropdownMaxResults) {
            const fallbackQueryString = this.#buildQueryString({
                q: normalizedQuery,
                key: this.#apiKey,
                maxResults: maxCandidates,
                printType: "books",
                orderBy: "relevance",
            });

            const fallbackData = await this.#fetchFromAPI(`/volumes?${fallbackQueryString}`, { signal });

            if (fallbackData === null) return null;

            mergedItems = this.#mergeUniqueItems([...(primaryData.items ?? []), ...(fallbackData.items ?? [])]);
        }

        this.#currentAbortController = null;

        const items = this.#sortQuickSearchItems(mergedItems, normalizedQuery);
        return {
            totalItems: items.length,
            books: items.slice(0, this.#dropdownMaxResults).map((item) => this.#formatDropdownItem(item)),
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
