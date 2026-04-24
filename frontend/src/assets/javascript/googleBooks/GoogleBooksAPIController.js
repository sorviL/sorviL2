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

    async #fetchFromAPI(endpoint, { signal } = {}) {
        const url = `${this.#baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, { signal });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const message =
                    errorBody?.error?.message || `HTTP ${response.status}`;
                throw new Error(`Google Books API error: ${message}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === "AbortError") {
                return null;
            }
            if (error.message.startsWith("Google Books API error")) {
                throw error;
            }
            throw new Error(`Network error while fetching from Google Books API: ${error.message}`);
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
}
