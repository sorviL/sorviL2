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
}
