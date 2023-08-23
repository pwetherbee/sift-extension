export function getYoutubeContext() {
  return document.querySelector('[tabindex="-1"]');
}

export function fetchYoutubeComments() {
  const elements = document.querySelectorAll('[class*="ytd-comment-renderer"]');
  return Array.from(elements).map((element) => {
    return element.textContent;
  });
}
