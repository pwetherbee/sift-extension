import { DomainInfo } from "@/src/types/DomainInfo";
import { RemovalConfig } from "@/src/types/RemovalConfig";
import { FilteredTextItem } from "@/src/types/TextItem";

export const TwitterInfo: DomainInfo = {
  domain: "twitter.com",
  contextPrompt: "Filter Tweets",
};

export function getTwitterTargetNode() {
  return document.getElementById("react-root");
}

export function getTwitterContext() {
  return document.querySelector('[tabindex="-1"]');
}

export function fetchTweets() {
  const elements = document.querySelectorAll('[data-testid="tweetText"]');
  return Array.from(elements).map((element) => {
    let parentElement = element.parentElement;
    while (parentElement) {
      if (parentElement.getAttribute("data-testid") === "tweet") {
        return { id: element.id, text: element.textContent };
      }
      parentElement = parentElement.parentElement;
    }
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
      parentElement.style.filter = item.hide ? "blur(5px)" : "";
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
