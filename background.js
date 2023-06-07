import axios from "axios";

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
              // chrome.runtime.sendMessage({
              //   grabbingTweets: true,
              //   tweets,
              // });
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

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.fetchFilter) {
    try {
      const res = await fetch("http://localhost:3000/api/filter", {
        method: "POST", // Assuming you want to send a POST request
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Add any other headers here if necessary, e.g., "Authorization": "Bearer YOUR_TOKEN"
        },
        body: JSON.stringify({
          tweets: foundTweets,
          prompt: promptText,
        }),
      });

      const data = await res.json();

      setFilteredTweets(data.filteredTweets);

      chrome.runtime.sendMessage({
        executeFilter: true,
        filteredTweets: data.filteredTweets,
      });
    } catch (error) {
      console.error(error);
    }
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.executeFilter) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: function (data) {
          // We'll implement this function in the content script

          window.removeElements(data);
        },
        args: [request.filteredTweets],
      });
    });
  }
});
