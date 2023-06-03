function startObserving(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // If new nodes are added, check for new tweets
            const elements = document.querySelectorAll('[data-testid="tweet"]');
            // const uniqueIds = Array.from(elements).map((element) => element.id);
            // const texts = Array.from(elements).map(
            //   (element) => element.textContent
            // );

            // zip up the ids and texts
            // const tweets = uniqueIds.map((id, index) => {
            //   return { id, text: texts[index] };
            // });

            const tweets = Array.from(elements).map((element) => {
              return { id: element.id, text: element.textContent };
            });

            if (tweets.length > 0) {
              chrome.runtime.sendMessage({
                executeFilter: true,
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
  if (request.executeFilter) {
    chrome.action.setBadgeBackgroundColor({ color: "#ddffdd" }, () => {
      console.log("call back text");
      console.log(request.tweets);
      chrome.action.setBadgeText({ text: request.tweets.length.toString() });
    });
    console.log("executing script");
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.executeFilter) {
    // Store the texts in local storage
    chrome.storage.local.set({ tweets: request.tweets }, function () {
      console.log("Value is set to " + request.tweets);
    });
  }
});
