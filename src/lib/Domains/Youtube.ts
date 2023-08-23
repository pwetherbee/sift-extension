export function getYoutubeContext() {
  return document.querySelector("h1");
}

export function fetchYoutubeComments() {
  const elements = document.querySelectorAll("[id=content-text]");
  return Array.from(elements).map((element) => {
    return { id: element.id, text: element.textContent };
  });
}
