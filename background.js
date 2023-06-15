let controller = new AbortController();

function grabAndFilter() {
  const elements = document.querySelectorAll('[data-testid="tweetText"]');

  const tweets = Array.from(elements).map((element) => {
    return { id: element.id, text: element.textContent };
  });

  if (tweets.length > 0) {
    chrome.runtime.sendMessage({
      fetchFilter: true,
      tweets,
    });
  }
}

function startObserving(tabId) {
  // if domain is not twitter.com, return
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      function grabAndFilter() {
        const elements = document.querySelectorAll('[data-testid="tweetText"]');

        const tweets = Array.from(elements).map((element) => {
          return { id: element.id, text: element.textContent };
        });

        if (tweets.length > 0) {
          chrome.runtime.sendMessage({
            fetchFilter: true,
            tweets,
          });
        }
      }
      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // If new nodes are added, check for new tweets
            grabAndFilter();
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

async function queryFilter(filters, tweets) {
  const res = await fetch("http://localhost:3000/api/filter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      tweets,
      filters,
    }),
    // signal: controller.signal,
  });

  const data = await res.json();

  if (!data.response === "Success") {
    console.error("Error in response");
    return;
  }
  return data.filteredTweets;
}

function debouncedFetch(tweets) {
  chrome.storage.local.get(["lastCallTime"], function (result) {
    const lastCallTime = result.lastCallTime || 0;
    const now = Date.now();

    if (now - lastCallTime >= 1000) {
      chrome.storage.local.set({ lastCallTime: now });
      console.log("fetching api");

      // Put your fetch call here inside setTimeout,
      // so it's delayed by 1000 milliseconds
      setTimeout(async () => {
        try {
          console.log("fetching data");
          const result = await chrome.storage.local.get("prompt");
          const filterConfig = await chrome.storage.local.get("filterConfig");

          const filteredTweets = await queryFilter(filterConfig, tweets);

          chrome.storage.local.set({ filteredTweets });

          if (!filteredTweets) {
            return;
          }

          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: (data) => {
                  // We'll implement this function in the content script
                  window.removeElements(data);
                },
                args: [filteredTweets],
              });
            }
          );

          console.log("sent message");
        } catch (error) {
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
  });
}

// Execute debounced fetch request to filter api
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    debouncedFetch(request.tweets);
  }
  return true;
});

// Execute filter to remove elements
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.executeFilter) {
    console.log("Removing elements");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (data) => {
          // We'll implement this function in the content script
          window.removeElements(data);
        },
        args: [request.filteredTweets],
      });
    });
  }
});

// Start the observer when the tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    // Check the URL of the updated tab
    if (!tab.url.includes("twitter.com")) {
      return;
    }

    // Call startObserving only if the URL is for twitter.com
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

// receive the grabAndFilter message
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "grabAndFilter") {
//     console.warn("message received");
//   }
// });

// Stop observing when the tab is closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (window.observer) {
        window.observer.disconnect();
      }
    },
  });
});

// set the badge text to the number of tweets
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    chrome.action.setBadgeBackgroundColor({ color: "#ddffdd" }, () => {
      chrome.action.setBadgeText({ text: request.tweets.length.toString() });
    });

    console.log("executing script");
  }
});

// Store the texts in local storage
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    chrome.storage.local.set({ tweets: request.tweets }, function () {});
  }
});
