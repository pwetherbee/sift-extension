export interface TextItem {
  text: string | null;
  id: string;
}

export interface FilteredTextItem {
  textItem: TextItem;
  hide: boolean;
}
