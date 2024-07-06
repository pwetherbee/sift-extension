import { generateObject } from "ai";

import { openai } from "@ai-sdk/openai";
import { instructions } from "./instructions";
import { TextItem } from "./interfaces/text-item";
import { z } from "zod";
import { FilteredTextItem } from "./interfaces/filtered-text-item";
import { FilterDescision } from "./interfaces/filter-decision";
import { FilterConfig } from "./interfaces/filter-config";

export async function filter(
  textItems: TextItem[],
  filterConfig: FilterConfig
): Promise<FilteredTextItem[]> {
  // object completion using ai

  const prompt = `
  ${instructions}
  ** Text Items **
  ${textItems.map((item) => item.text).join("\n")}
  ** Filter Config **
  ${JSON.stringify(filterConfig)}
  `;

  const schema = z.object({
    decisions: z.array(FilterDescision),
  });

  const { object } = await generateObject({
    model: openai("gpt-3.5-turbo"),
    prompt,
    schema,
  });

  const { decisions } = object;

  console.log("Decisions", decisions);

  const filteredTextItems = textItems.map((textItem, index) => {
    return {
      textItem,
      hide: decisions[index].hide,
    };
  });

  return filteredTextItems;
}
