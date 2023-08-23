chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

window.removeElements = function (filteredTextItems) {
  // fetch current domain, such as twitter.com or youtube.com

  const domain = window.location.hostname;

  filteredTextItems.forEach((item) => {
    const elementId = item.textItem.id;
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
        // parentElement.style.display = item.hide ? "none" : "block";
        if (parentElement.getAttribute("data-filtered")) return;
        parentElement.style.filter = item.hide ? "blur(5px)" : "";

        // add event listener to parent element to remove blur on click
        parentElement.addEventListener("click", (e) => {
          e.stopPropagation();
          parentElement.style.filter = "";
          // add property to item to prevent it from being filtered again
          parentElement.setAttribute("data-filtered", true);
        });

        // parentElement.style.filter = 'blur(5px)';
        break;
      }
      parentElement = parentElement.parentNode;
    }
  });
};

window.grabAndFilter = function () {
  const elements = document.querySelectorAll('[data-testid="tweetText"]');

  const textItems = Array.from(elements).map((element) => {
    // look for parent element tweet to grab full context
    let parentElement = element.parentElement;
    while (parentElement) {
      if (parentElement.getAttribute("data-testid") === "tweet") {
        return { id: element.id, text: element.textContent };
      }
      parentElement = parentElement.parentElement;
    }
  });

  const contextElement = document.querySelector('[tabindex="-1"]');

  if (textItems.length > 0 && contextElement) {
    chrome.runtime.sendMessage({
      fetchFilter: true,
      textItems,
      context: contextElement.textContent,
    });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "grabAndFilter") {
    console.log("first grab and filter");
    window.grabAndFilter();
  }
});
