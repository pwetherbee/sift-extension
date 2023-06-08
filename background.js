let controller = new AbortController();

function startObserving(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // only work for the domain twitter.com
      if (!window.location.href.includes("twitter.com")) {
        return;
      }
      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // If new nodes are added, check for new tweets
            const elements = document.querySelectorAll(
              '[data-testid="tweetText"]'
            );

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

async function queryFilter(prompt, tweets) {
  const res = await fetch("http://localhost:3000/api/filter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      tweets,
      prompt: prompt || "remove all negative sounding tweets",
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
          const promptText = result.prompt;

          const filteredTweets = await queryFilter(promptText, tweets);

          chrome.storage.local.set({ filteredTweets });

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

// Execute debounced fetch request
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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    startObserving(tabId);
  }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // Stop observing when the tab is closed
      if (window.observer) {
        window.observer.disconnect();
      }
    },
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    chrome.action.setBadgeBackgroundColor({ color: "#ddffdd" }, () => {
      chrome.action.setBadgeText({ text: request.tweets.length.toString() });
    });

    console.log("executing script");
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.fetchFilter) {
    // Store the texts in local storage
    chrome.storage.local.set({ tweets: request.tweets }, function () {});
  }
});
