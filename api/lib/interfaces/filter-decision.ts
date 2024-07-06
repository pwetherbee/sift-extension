import { z } from "zod";

export const FilterDescision = z.object({
  id: z.string(),
  reason: z.string(),
  hide: z.boolean(),
});

export type FilterDescision = z.infer<typeof FilterDescision>;
