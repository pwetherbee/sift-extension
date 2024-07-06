import { filterConfigDefaults } from "./defaults/FilterConfigDefaults";
import filterItem, {
  getContext,
  getTextElements,
} from "./lib/domain-specific-getters";
import { FilteredTextItem } from "./types/TextItem";

declare global {
  interface Window {
    removeElements: (filteredTextItems: FilteredTextItem[]) => void;
    grabAndFilter: () => void;
    debouncedGrabAndFilter: () => void;
    toggleFilter: (filterOn: boolean) => void;
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

async function grabAndFilter() {
  // if settings.on === false, return

  const settings = await chrome.storage.local.get("settings");

  if (!settings.settings?.on)
    return chrome.runtime.sendMessage({
      message: "Filtering is off",
    });

  // fetch current domain, such as x.com or youtube.com
  const domain = window.location.hostname;
  const contextElement = getContext(domain);
  const textItems = (await getTextElements(domain))?.slice(0, 20);

  if (!contextElement || !textItems)
    return console.log("No context element or text items");

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

  // create a css class called 'sift-filter' that applies a blur filter
  window.toggleFilter(true);
};

window.toggleFilter = function (filterOn: boolean) {
  // edit existing css class called 'sift-filter' that applies a blur filter
  if (filterOn) {
    const style = document.createElement("style");
    style.innerHTML = `
      .sift-filter {
        filter: blur(5px);
      }
    `;
    document.head.appendChild(style);
  } else {
    const style = document.createElement("style");
    style.innerHTML = `
      .sift-filter {
        filter: none;
      }
    `;
    document.head.appendChild(style);
  }
};

window.debouncedGrabAndFilter = debounceHandler(grabAndFilter, 300);

// on message from background script, grab text elements and filter

chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

chrome.storage.local.get("filterConfig", (filterConfig) => {
  if (!filterConfig.filterConfig) return console.log("No filter config");
  chrome.storage.local.set({
    filterConfig: filterConfigDefaults,
  });
});

export {};
