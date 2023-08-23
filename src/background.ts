import { allowedDomains } from "./lib/AllowedDomains";
import { FilterPrompt } from "./types/FilterPrompt";
import { FilteredTextItem, TextItem } from "./types/TextItem";
declare global {
  interface Window {
    removeElements: (filteredTextItems: FilteredTextItem[]) => void;
    grabAndFilter: () => void;
    debouncedGrabAndFilter: () => void;
    observer: MutationObserver;
  }
}

function startObserving(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // console.log("mutation observed");
            // If new nodes are added, check for new text items
            // send message to content script to grab and filter
            // chrome.runtime.sendMessage({
            //   action: "grabAndFilter",
            // });
            // debouncedGrabAndFilter();
            window.debouncedGrabAndFilter();
          }
        });
      });

      // Define the target node and config
      const targetNode = document.getElementById("react-root");
      const config = { childList: true, subtree: true };

      // Start observing the target node
      if (targetNode) {
        observer.observe(targetNode, config);
      }

      // Save observer to window so it can be accessed later for cleanup
      window.observer = observer;
    },
  });
}

async function queryFilter(filters: FilterPrompt, textItems: TextItem[]) {
  const res = await fetch("http://localhost:3000/api/filter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      textItems,
      filters,
    }),
    // signal: controller.signal,
  });

  const data = await res.json();

  if (!(data.response === "Success")) {
    console.error("Error in response");
    return;
  }
  return data.filteredTextItems;
}

let lastCallTime = 0;

async function debouncedFetch(textItems: TextItem[]) {
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
        const filteredTextItems = await queryFilter(
          {
            filterConfig: filterConfig.filterConfig,
          },
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

        console.log("sent message");
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Fetch operation aborted");
        } else {
          console.error("error incoming");
          console.error(error);
        }
      }
    }, 1000);
  } else {
    console.log("Skipping fetch due to rate limit");
  }
}

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

// Start the observer when the tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    // Call startObserving only if the URL is in the allowed domains

    // fetch current domain, not entire url, aka www.twitter.com/home -> twitter.com

    const domain = tab.url?.replace("www.", "").split("/")[2];

    console.log(tab.url);

    if (!allowedDomains.includes(domain || "")) {
      return console.log("not allowed domain");
    }

    console.log("observer started for domain", domain);

    startObserving(tabId);
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
});

// get current tab
// async function getCurrentTab() {
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }

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

// set the badge text to the number of hidden text items
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.filteredTextItems) {
    chrome.action.setBadgeBackgroundColor({ color: "#ddffdd" }, () => {
      chrome.action.setBadgeText({
        text: (changes.filteredTextItems as FilteredTextItem[])
          .filter((filteredTextItem) => filteredTextItem.hide)
          .length.toString(),
      });
    });
  }
});

// on page load, run window.debouncedGrabAndFilter();
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   chrome.scripting.executeScript({
//     target: { tabId },
//     func: () => {
//       if (changeInfo.status === "complete" && tab.active) {
//         // Call startObserving only if the URL is in the allowed domains
//         const domain = tab.url?.replace("www.", "").split("/")[2];

//         console.log(tab.url);

//         if (!allowedDomains.includes(domain || "")) {
//           return console.log("not allowed domain");
//         }
//         window.debouncedGrabAndFilter();
//       }
//     },
//   });
// });

// set the badge text to the number of textItems
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.fetchFilter) {
//     chrome.action.setBadgeBackgroundColor({ color: "#ddffdd" }, () => {
//       chrome.action.setBadgeText({ text: request.textItems.length.toString() });
//     });

//     console.log("executing script");
//   }
// });

// Store the texts in local storage
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    chrome.storage.local.set({ textItems: request.textItems }, function () {});
  }
});

export {};
