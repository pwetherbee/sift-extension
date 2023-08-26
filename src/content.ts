import filterItem, {
  getContext,
  getTextElements,
} from "./lib/domainSpecificGetters";
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

  chrome.runtime.sendMessage({
    message: `Context element is ${contextElement}, text items are ${textItems}`,
  });

  if (textItems.length > 0) {
    chrome.runtime.sendMessage({
      fetchFilter: true,
      textItems,
      context: contextElement?.textContent,
    });
  }
}

window.removeElements = function (filteredTextItems) {
  // fetch current domain, such as twitter.com or youtube.com
  filteredTextItems.forEach((item) =>
    filterItem(item, {
      hideStyle: "blur",
    })
  );
};

window.debouncedGrabAndFilter = debounceHandler(grabAndFilter, 300);

// on message from background script, grab text elements and filter

chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

export {};
