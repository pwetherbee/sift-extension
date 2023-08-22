export interface FilterPrompt {
  filterConfig: {
    default: string[];
    custom: {
      text: string;
      active: boolean;
    }[];
  };
}
