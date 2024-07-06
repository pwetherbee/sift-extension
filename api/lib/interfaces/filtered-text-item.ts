// export interface FilteredTextItem {
//     textItem: TextItem;
//     hide: boolean;
//   }

import { z } from "zod";
import { TextItem } from "./text-item";

export const FilteredTextItem = z.object({
  textItem: TextItem,
  hide: z.boolean(),
});

export type FilteredTextItem = z.infer<typeof FilteredTextItem>;
