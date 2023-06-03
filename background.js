// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.status === "complete") {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       chrome.scripting.executeScript({
//         target: { tabId: tabs[0].id },
//         func: function () {
//           let elements = document.querySelectorAll(
//             '[data-testid="tweetText"] span'
//           );
//           let texts = Array.from(elements).map(
//             (element) => element.textContent
//           );
//           if (elements.length > 0) {
//             chrome.runtime.sendMessage({
//               executeFilter: true,
//               elements,
//               texts,
//             });
//           }
//         },
//       });
//     });
//   } else {
//     chrome.action.setBadgeText({ text: "" });
//   }
// });

function getTweets() {
  const elements = document.querySelectorAll('[data-testid="tweetText"] span');
  const texts = Array.from(elements).map((element) => element.textContent);
  if (texts.length > 0) {
    chrome.runtime.sendMessage({ executeFilter: true, texts });
  }
}

function startObserving(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // If new nodes are added, check for new tweets
            const elements = document.querySelectorAll(
              '[data-testid="tweetText"]'
            );
            const texts = Array.from(elements).map(
              (element) => element.textContent
            );
            if (texts.length > 0) {
              chrome.runtime.sendMessage({ executeFilter: true, texts });
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
      console.log(request.texts);
      chrome.action.setBadgeText({ text: request.texts.length.toString() });
    });
    console.log("executing script");
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.executeFilter) {
    // Store the texts in local storage
    chrome.storage.local.set({ texts: request.texts }, function () {
      console.log("Value is set to " + request.texts);
    });
  }
});
