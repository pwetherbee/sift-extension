export interface TextItem {
  text: string;
  id: string;
}

export interface FilteredTextItem {
  textItem: TextItem;
  hide: boolean;
}
