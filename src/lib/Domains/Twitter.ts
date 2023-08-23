export function getTwitterContext() {
  return document.querySelector('[tabindex="-1"]');
}

export function fetchTweets() {
  const elements = document.querySelectorAll('[data-testid="tweetText"]');
  return Array.from(elements).map((element) => {
    let parentElement = element.parentElement;
    while (parentElement) {
      if (parentElement.getAttribute("data-testid") === "tweet") {
        return { id: element.id, text: element.textContent };
      }
      parentElement = parentElement.parentElement;
    }
  });
}
