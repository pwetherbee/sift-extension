import { config } from "../config";
import { FilterConfig } from "../types/FilterConfig";
import { TextItem } from "../types/TextItem";

export async function queryFilter(
  filterConfig: FilterConfig,
  textItems: TextItem[]
) {
  if (!textItems?.length) return console.log("No text items to filter");
  const res = await fetch(config.apiEndpoint + "/filter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      textItems,
      filterConfig: filterConfig
        ? {
            ...filterConfig,
            filters: {
              ...filterConfig?.filters,
              custom: filterConfig?.filters?.custom.filter(
                (customFilter) => customFilter.active
              ),
            },
          }
        : {},
    }),
    // signal: controller.signal,
  });

  const data = await res.json();

  if (!(data.response === "Success")) {
    console.error("Error in response");
    return console.error(data);
  }
  return data.filteredTextItems;
}

let lastCallTime = 0;

export async function debouncedFetch(textItems: TextItem[]) {
  const now = Date.now();

  if (now - lastCallTime >= 5000) {
    lastCallTime = now;
    console.log("fetching api");

    // Put your fetch call here inside setTimeout,
    // so it's delayed by 1000 milliseconds
    setTimeout(async () => {
      try {
        console.log("fetching data");
        const filterConfig = await chrome.storage.local.get("filterConfig");
        console.log(filterConfig);

        //
        if (!((filterConfig.filterConfig?.filters as any) instanceof Object)) {
          // clear storage
          chrome.storage.local.clear();
        }

        if (!filterConfig.filterConfig) return console.log("No filter config");

        const filteredTextItems = await queryFilter(
          filterConfig.filterConfig as FilterConfig,
          textItems
        );

        chrome.storage.local.set({ filteredTextItems });

        if (!filteredTextItems) {
          return;
        }

        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (!tabs[0].id) return;
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (data) => {
                // We'll implement this function in the content script
                (window as any).removeElements(data);
              },
              args: [filteredTextItems],
            });
          }
        );
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Fetch operation aborted");
        } else {
          console.error("error incoming");
          console.error(error);
          chrome.storage.local.clear();
        }
      }
    }, 1000);
  } else {
    console.log("Skipping fetch due to rate limit");
  }
}
