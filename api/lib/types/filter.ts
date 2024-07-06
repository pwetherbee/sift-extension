import { FilteredTextItem } from "../interfaces/filtered-text-item";

export interface Data {
  response: string | undefined;
  filteredTextItems: FilteredTextItem[];
}

export interface FilterConfig {
  filters: {
    default: string[];
    custom: string[];
  };
  strength: number;
}
