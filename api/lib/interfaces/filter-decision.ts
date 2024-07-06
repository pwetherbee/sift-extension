import { z } from "zod";

export const FilterDescision = z.object({
  id: z.string(),
  decision: z.string(),
  hide: z.boolean(),
});

export type FilterDescision = z.infer<typeof FilterDescision>;
