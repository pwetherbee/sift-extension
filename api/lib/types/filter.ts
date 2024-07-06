export interface TextItem {
  text: string;
  id: string;
}

export interface FilteredTextItem {
  textItem: TextItem;
  hide: boolean;
}

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
