import { z } from "zod";

export const FilterConfig = z.object({
  filters: z.object({
    default: z.array(z.string()),
    custom: z.array(z.string()),
  }),
  strength: z.number(),
});

export type FilterConfig = z.infer<typeof FilterConfig>;
