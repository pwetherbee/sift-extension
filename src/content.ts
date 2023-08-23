import getContext from "./lib/getContext";
import getTextElements from "./lib/getTextContent";
import { FilteredTextItem } from "./types/TextItem";

declare global {
  interface Window {
    removeElements: (filteredTextItems: FilteredTextItem[]) => void;
    grabAndFilter: () => void;
    debouncedGrabAndFilter: () => void;
  }
}

function debounceHandler(func: Function, delay: number) {
  let debounceTimer: any;
  return function (this: any) {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

function grabAndFilter() {
  // fetch current domain, such as twitter.com or youtube.com
  const domain = window.location.hostname;
  const contextElement = getContext(domain);
  const textItems = getTextElements(domain).slice(0, 20);
  console.log(textItems);
  if (textItems.length > 0) {
    chrome.runtime.sendMessage({
      fetchFilter: true,
      textItems,
      context: contextElement?.textContent,
    });
  }
}

// Modules for fetching text elements

// function removeTweets() {
//   let parentElement = element.parentElement;
//   while (parentElement) {
//     if (parentElement.getAttribute("data-testid") === "tweet") {
//       return { id: element.id, text: element.textContent };
//     }
//     parentElement = parentElement.parentElement;
//   }
// }

window.removeElements = function (filteredTextItems) {
  // fetch current domain, such as twitter.com or youtube.com

  const domain = window.location.hostname;

  filteredTextItems.forEach((item) => {
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
  });
};

window.debouncedGrabAndFilter = debounceHandler(grabAndFilter, 300);

// on message from background script, grab text elements and filter

chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

export {};
