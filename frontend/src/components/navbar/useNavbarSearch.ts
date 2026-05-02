import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleBooksAPIController } from "../../assets/javascript/googleBooks/GoogleBooksAPIController";
import type { NavbarSearchResult, UseNavbarSearchState, UseNavbarSearchActions } from "./navbar.types";

const googleBooksApi = new GoogleBooksAPIController();

function getSearchErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
        return "Não foi possível buscar livros agora.";
    }

    const message = error.message.toLowerCase();

    if (message.includes("api key is missing")) {
        return "A busca está sem chave da API do Google Books.";
    }

    if (message.includes("403") || message.includes("quota") || message.includes("rate limit")) {
        return "A busca está temporariamente limitada pela API. Tente novamente em instantes.";
    }

    if (message.includes("503") || message.includes("service unavailable")) {
        return "O serviço de busca está instável no momento. Tente novamente em instantes.";
    }

    if (message.includes("network error")) {
        return "Falha de rede ao buscar livros. Verifique sua conexão.";
    }

    return "Não foi possível buscar livros agora.";
}

export function useNavbarSearch(): UseNavbarSearchState & UseNavbarSearchActions {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<NavbarSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRequestIdRef = useRef(0);

    useEffect(() => {
        const normalizedQuery = searchQuery.trim();

        googleBooksApi.cancelPendingSearch();

        if (!normalizedQuery) {
            setSearchResults([]);
            setSearchError(null);
            setIsSearching(false);
            setIsSearchOpen(false);
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setIsSearchOpen(true);

        const currentRequestId = searchRequestIdRef.current + 1;
        searchRequestIdRef.current = currentRequestId;

        const debounceId = window.setTimeout(async () => {
            try {
                const result = await googleBooksApi.quickSearch(normalizedQuery);

                if (searchRequestIdRef.current !== currentRequestId) {
                    return;
                }

                setSearchResults((result?.books ?? []).slice(0, 5));
            } catch (error) {
                if (searchRequestIdRef.current !== currentRequestId) {
                    return;
                }

                if (import.meta.env.DEV) {
                    console.error("[NavbarSearch] quickSearch failed", {
                        query: normalizedQuery,
                        error,
                    });
                }

                setSearchResults([]);
                setSearchError(getSearchErrorMessage(error));
            } finally {
                if (searchRequestIdRef.current === currentRequestId) {
                    setIsSearching(false);
                }
            }
        }, 250);

        return () => {
            window.clearTimeout(debounceId);
            googleBooksApi.cancelPendingSearch();
        };
    }, [searchQuery]);

    const handleBookSelect = useCallback(
        (bookId: string) => {
            setSearchQuery("");
            setSearchResults([]);
            setIsSearchOpen(false);
            navigate(`/book/${bookId}`);
        },
        [navigate]
    );

    return {
        searchQuery,
        searchResults,
        isSearching,
        searchError,
        isSearchOpen,
        setSearchQuery,
        setIsSearchOpen,
        handleBookSelect
    };
}
