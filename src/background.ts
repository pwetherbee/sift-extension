import { allowedDomains } from "./lib/AllowedDomains";
import { debouncedFetch } from "./lib/api";
import { startObserving } from "./lib/observation";
import { FilteredTextItem, TextItem } from "./types/TextItem";

declare global {
  interface Window {
    removeElements: (filteredTextItems: FilteredTextItem[]) => void;
    grabAndFilter: () => void;
    debouncedGrabAndFilter: () => void;
    toggleFilter: (filterOn: boolean) => void;
    observer: MutationObserver;
  }
}

// Start the observer when the tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    // fetch current domain, not entire url
    const domain = tab.url?.replace("www.", "").split("/")[2];

    if (!allowedDomains.includes(domain || "")) {
      return console.log("not allowed domain");
    }

    console.log("observer started for domain", domain);

    startObserving(tabId);
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
});

// Stop observing when the tab is closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if ((window as any).observer) {
        (window as any).observer.disconnect();
      }
    },
  });
});

// Execute debounced fetch request to filter api
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    debouncedFetch(request.textItems);
  }
  return true;
});

// Execute filter to remove elements
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.executeFilter) {
    console.log("Removing elements");
    chrome.action.setBadgeBackgroundColor({ color: "#ddffdd" }, () => {
      chrome.action.setBadgeText({
        text: (request.filteredTextItems as FilteredTextItem[])
          .filter((filteredTextItem) => filteredTextItem.hide)
          .length.toString(),
      });
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0].id) return;
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (data) => {
          // We'll implement this function in the content script
          (window as any).removeElements(data);
        },
        args: [request.filteredTextItems],
      });
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.grabAndFilter) {
    console.log("Fetching elements");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0].id) return;
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          window.debouncedGrabAndFilter();
        },
      });
    });
  }
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0].id) return;
    for (let key in changes) {
      let storageChange = changes[key];
      if (key === "filterConfig" && namespace === "local") {
        console.warn("filter config changed");
        // Check if the value has actually changed
        if (storageChange.oldValue !== storageChange.newValue) {
          // Your prompt has changed, trigger the function
          chrome.tabs.sendMessage(tabs[0].id, { action: "grabAndFilter" });
        }
      }
    }
  });
});

// set the badge text to the number of hidden text items
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//   if (changes.filteredTextItems?.length) {
//     chrome.action.setBadgeBackgroundColor({ color: "#ddffdd" }, () => {
//       chrome.action.setBadgeText({
//         text: (changes.filteredTextItems as FilteredTextItem[])
//           .filter((filteredTextItem) => filteredTextItem.hide)
//           .length.toString(),
//       });
//     });
//   }
// });

// Local storage listeners

// turn off filter when settings.on is false
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.settings?.newValue?.on === false) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0].id) return;
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          if ((window as any).observer) {
            (window as any).observer.disconnect();
          }
          (window as any).toggleFilter(false);
        },
      });
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0].id) return;

      const domain = tabs[0].url?.replace("www.", "").split("/")[2];

      if (!allowedDomains.includes(domain || "")) {
        return console.log("not allowed domain");
      }

      console.log("observer started for domain", domain);

      startObserving(tabs[0].id);

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          (window as any).toggleFilter(true);
        },
      });
    });
  }
});

// Add text items to local storage
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    chrome.storage.local.set({ textItems: request.textItems }, function () {});
  }
});

// Error Handling
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.noTargetNode) {
    console.log("No target node found");
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message) {
    console.log(request.message);
  }
});

export {};
