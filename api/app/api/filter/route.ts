import { TextItem, FilterConfig, FilteredTextItem } from "@/lib/types/filter";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

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

  if (!textItems || !filterConfig) {
    return NextResponse.json(
      {
        response: "Invalid request",
        filteredTextItems: [],
      },
      { status: 400 }
    );
  }

  console.log("Performing filter-text-items API call");
  console.log("filter config:", filterConfig);

  console.log("Text items:", textItems);

  return NextResponse.json(
    {
      response: "Success",
      filteredTextItems: [],
    },
    { status: 200 }
  );
};
