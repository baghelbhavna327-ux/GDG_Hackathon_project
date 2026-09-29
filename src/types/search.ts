export type SearchResultType = 'PAGE' | 'PHC' | 'MEDICINE' | 'INVENTORY' | 'ALERT' | 'TRANSFER';

export interface SearchResultItem {
  id: string;
  title: string;
  type: SearchResultType;
  category: 'Pages' | 'PHCs' | 'Medicines' | 'Inventory' | 'Alerts' | 'Transfers';
  subtitle: string;
  badge?: string;
  route: string;
  score?: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: {
    pages: SearchResultItem[];
    phcs: SearchResultItem[];
    medicines: SearchResultItem[];
    inventory: SearchResultItem[];
    alerts: SearchResultItem[];
    transfers: SearchResultItem[];
  };
  results: SearchResultItem[];
}
