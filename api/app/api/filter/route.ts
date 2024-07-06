import { filter } from "@/lib/ai";
import { FilterConfig } from "@/lib/interfaces/filter-config";
import { FilteredTextItem } from "@/lib/interfaces/filtered-text-item";
import { TextItem } from "@/lib/interfaces/text-item";

import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { text } from "stream/consumers";
import { z } from "zod";

interface ResponseData {
  response: string | undefined;
  filteredTextItems: FilteredTextItem[];
}

export const runtime = "edge";

export const POST = async (
  req: NextRequest,
  res: NextResponse<ResponseData>
) => {
  const {
    textItems,
    filterConfig,
  }: {
    textItems: TextItem[];
    filterConfig: FilterConfig;
  } = await req.json();

  console.log(textItems, filterConfig);

  if (!textItems || !filterConfig) {
    return NextResponse.json(
      {
        response: "Invalid request",
        filteredTextItems: [],
      },
      { status: 400 }
    );
  }

  try {
    textItems.forEach((item) => {
      TextItem.parse(item);
    });
    FilterConfig.parse(filterConfig);
  } catch (error) {
    console.error("Error parsing request data");
    console.error(error);
    return NextResponse.json(
      {
        response: `Error parsing request data: ${JSON.stringify(error)}`,
        filteredTextItems: [],
      },
      { status: 400 }
    );
  }

  console.log("Performing filter-text-items API call");
  console.log("filter config:", filterConfig);

  console.log("Text items:", textItems);

  const filteredTextItems = await filter(textItems, filterConfig);

  console.log("Filtered text items:", filteredTextItems);

  return NextResponse.json(
    {
      response: "Success",
      filteredTextItems,
    },
    { status: 200 }
  );
};
