import { z } from "zod";

export const TextItem = z.object({
  text: z.string(),
  id: z.string(),
});

export type TextItem = z.infer<typeof TextItem>;
