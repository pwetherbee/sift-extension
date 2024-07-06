import { filterConfigDefaults } from "./defaults/FilterConfigDefaults";
import { allowedDomains } from "./lib/AllowedDomains";
import { FilterConfig } from "./types/FilterConfig";

export const config: {
  allowedDomains: string[];
  apiEndpoint: string;
  filterConfigDefault: FilterConfig;
} = {
  allowedDomains: allowedDomains,
  apiEndpoint: "http://localhost:4040/api",
  filterConfigDefault: filterConfigDefaults,
};
