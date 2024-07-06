import { generateObject } from "ai";
import { FilterConfig } from "./types/filter";
import { openai } from "@ai-sdk/openai";
import { instructions } from "./instructions";
import { TextItem } from "./interfaces/text-item";
import { z } from "zod";
import { FilteredTextItem } from "./interfaces/filtered-text-item";
import { FilterDescision } from "./interfaces/filter-decision";

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

  const schema = z.array(FilterDescision);

  const { object: filterDecisions } = await generateObject({
    model: openai("gpt-3.5-turbo"),
    prompt,
    schema,
  });

  const filteredTextItems = textItems.map((textItem, index) => {
    return {
      textItem,
      hide: filterDecisions[index].hide,
    };
  });

  return filteredTextItems;
}
