import { filterConfigDefaults } from "./defaults/FilterConfigDefaults";
import { allowedDomains } from "./lib/AllowedDomains";
import { FilterConfig } from "./types/FilterConfig";

export const config: {
  allowedDomains: string[];
  apiEndpoint: string;
  filterConfigDefault: FilterConfig;
} = {
  allowedDomains: allowedDomains,
  apiEndpoint: "https://sift-backend.vercel.app/api",
  filterConfigDefault: filterConfigDefaults,
};
