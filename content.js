chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

window.removeElements = function (filteredTweets) {
  filteredTweets.forEach((item) => {
    if (item.hide) {
      const elementId = item.tweet.id;
      const element = document.getElementById(elementId);

      if (!element) return;

      let parentElement = element.parentNode;

      while (parentElement) {
        if (parentElement.getAttribute("data-testid") === "tweet") {
          // parentElement.removeChild()
          parentElement.style.display = "none";
          // parentElement.style.filter = 'blur(5px)';
          break;
        } else {
          // remove display=none from parentElement
          parentElement.style.display = "";
        }
        parentElement = parentElement.parentNode;
      }
    }
  });
};

window.grabAndFilter = function () {
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
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "grabAndFilter") {
    window.grabAndFilter();
  }
});
