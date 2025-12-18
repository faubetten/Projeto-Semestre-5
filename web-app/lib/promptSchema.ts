export interface ParsedPrompt {
  location: string | null;
  dateFrom: string | null; // YYYY-MM-DD
  dateTo: string | null;   // YYYY-MM-DD
  category: string | null;
  mode: 'online' | 'offline' | 'hybrid' | null;
  all: boolean;
  search: string | null;
}
