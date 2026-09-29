import { SearchResponse, SearchResultItem } from '../types/search';
import { authService } from './authService';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5000/api';

const RECENT_SEARCHES_KEY = 'healthchain_recent_searches';

export const searchService = {
  /**
   * Execute live search query with abort signal support
   */
  async search(query: string, signal?: AbortSignal): Promise<SearchResultItem[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(trimmed)}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
        credentials: 'include',
        signal
      });

      if (!response.ok) {
        throw new Error(`Search API returned status ${response.status}`);
      }

      const result: SearchResponse = await response.json();
      return result.results || [];
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled by a newer keystroke; silently return empty
        return [];
      }
      console.warn('Search query warning:', err.message);
      return [];
    }
  },

  /**
   * Safe local storage management for recent searches
   */
  getRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveRecentSearch(term: string): void {
    try {
      const trimmed = term.trim();
      if (!trimmed || trimmed.length < 2) return;
      const current = this.getRecentSearches().filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...current].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Storage unavailable or disabled
    }
  },

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Storage unavailable
    }
  }
};
