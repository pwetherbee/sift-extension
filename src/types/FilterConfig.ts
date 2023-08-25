export interface FilterConfig {
  filters: {
    defaults: string[];
    custom: {
      text: string;
      active: boolean;
    }[];
  };
  strength: number;
}
