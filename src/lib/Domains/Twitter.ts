import { DomainInfo } from "@/src/types/DomainInfo";
import { RemovalConfig } from "@/src/types/RemovalConfig";
import { FilteredTextItem } from "@/src/types/TextItem";
import { getSHA256Hash } from "../hash";

export const TwitterInfo: DomainInfo = {
  domain: "x.com",
  contextPrompt: "Filter Tweets",
};

export function getTwitterTargetNode() {
  return document.getElementById("react-root");
}

export function getTwitterContext() {
  return document.querySelector('[tabindex="-1"]');
}

export async function fetchTweets() {
  const elements = document.querySelectorAll('[data-testid="tweetText"]');

  const filterConfig = await chrome.storage.local.get("filterConfig");

  // sha 256 hash of filterConfig
  const filterConfigHash = await getSHA256Hash(JSON.stringify(filterConfig));

  // filter out tweets that have already been filtered
  const filteredElements = Array.from(elements).filter((element) => {
    return (
      (element as any).getAttribute("data-filterHash") !== filterConfigHash
    );
  });

  filteredElements.forEach((element) => {
    // apply filterHash attribute to each element
    (element as any).setAttribute("data-filterHash", filterConfigHash);
  });

  return filteredElements.map((element) => {
    let parentElement = element.parentElement;
    while (parentElement) {
      if (parentElement.getAttribute("data-testid") === "tweet") {
        return { id: element.id, text: element.textContent || "" };
      }
      parentElement = parentElement.parentElement;
    }
    return {
      id: element.id,
      text: element.textContent,
    };
  });
}

export function filterTweet(item: FilteredTextItem, config: RemovalConfig) {
  const elementId = item.textItem.id;
  const element = document.getElementById(elementId);
  if (!element) return;

  let parentElement = element.parentElement;

  while (parentElement) {
    if (parentElement.getAttribute("data-testid") === "cellInnerDiv") {
      if (parentElement.getAttribute("data-filtered")) return;
      // parentElement.style.filter = item.hide ? "blur(5px)" : "";
      // add class to element called 'sift-filter'
      if (item.hide) parentElement.classList.add("sift-filter");
      parentElement.addEventListener("click", (e) => {
        e.stopPropagation();
        (parentElement as any).style.filter = "";
        // add property to item to prevent it from being filtered again
        (parentElement as any).setAttribute("data-filtered", true);
      });
      break;
    }
    (parentElement as any) = parentElement.parentNode;
  }
}
