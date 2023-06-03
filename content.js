chrome.runtime.sendMessage({
  action: "getSource",
  source: document.body.innerText,
});

window.removeElements = function (filteredTweets) {
  filteredTweets.forEach((item) => {
    const element = document.getElementById(item.tweet.id);
    if (!element) return;
    if (item.hide) {
      element.remove();
    }
  });
};
