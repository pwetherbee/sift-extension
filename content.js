chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

window.removeElements = function (filteredTweets) {
  filteredTweets.forEach((item) => {
    const elementId = item.tweet.id;
    const element = document.getElementById(elementId);
    // if (!element) return console.log("no element found for id:", elementId);
    // console.log(element);
    // element.style.display = item.hide ? "none" : "block";

    if (!element) return;

    let parentElement = element.parentNode;

    while (parentElement) {
      if (parentElement.getAttribute("data-testid") === "cellInnerDiv") {
        //or tweet
        // parentElement.removeChild()
        parentElement.style.display = item.hide ? "none" : "block";
        // parentElement.style.filter = 'blur(5px)';
        break;
      }
      parentElement = parentElement.parentNode;
    }
  });
};

window.grabAndFilter = function () {
  const tweets = Array.from(elements).map((element) => {
    // look for parent element tweet to grab full context
    let parentElement = element.parentNode;
    while (parentElement) {
      if (parentElement.getAttribute("data-testid") === "tweet") {
        return { id: element.id, text: element.textContent };
      }
      parentElement = parentElement.parentNode;
    }
  });

  const contextElement = document.querySelector('[tabindex="-1"]');

  if (tweets.length > 0) {
    chrome.runtime.sendMessage({
      fetchFilter: true,
      tweets,
      context: contextElement.textContent,
    });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "grabAndFilter") {
    window.grabAndFilter();
  }
});
