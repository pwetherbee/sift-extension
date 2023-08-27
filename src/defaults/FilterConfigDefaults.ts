import { FilterConfig } from "../types/FilterConfig";

export const filterConfigDefaults: FilterConfig = {
  filters: {
    custom: [],
    defaults: ["No Spam", "No Hate Speech", "No Racism"],
  },
  strength: 5,
};
