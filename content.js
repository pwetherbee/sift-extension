chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

// window.removeElements = function (filteredTweets) {
//   filteredTweets.forEach((item) => {
//     const element = document.getElementById(item.tweet.id);

//     if (!element) return;
//     if (item.hide) {
//       element.remove();
//     }
//   });
// };

window.removeElements = function (filteredTweets) {
  filteredTweets.forEach((item) => {
    if (item.hide) {
      const elementId = item.tweet.id;
      const element = document.getElementById(elementId);

      if (!element) return;

      let parentElement = element.parentNode;

      while (parentElement) {
        if (parentElement.getAttribute("data-testid") === "tweet") {
          parentElement.remove();
          break;
        }
        parentElement = parentElement.parentNode;
      }
    }
  });
};
