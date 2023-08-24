import { FilteredTextItem } from "@/src/types/TextItem";

export function getYoutubeContext() {
  return document.querySelector("h1");
}

export function fetchYoutubeComments() {
  const elements = document.querySelectorAll("[id=content-text]");
  return Array.from(elements).map((element) => {
    return { id: element.id, text: element.textContent };
  });
}

export function getYoutubeTargetNode() {
  return document.getElementById("comments");
}

export function filterYoutubeComment(item: FilteredTextItem, config: any) {
  const elementId = item.textItem.id;

  if (!item.hide) return;

  for (const comment of Array.from(
    document.querySelectorAll<HTMLElement>("[id=content-text]")
  )) {
    if (comment.textContent?.includes(item.textItem.text)) {
      comment.setAttribute("data-filtered", "true");
      comment.style.filter = "blur(5px)";
      comment.addEventListener("click", (e) => {
        comment.style.filter = "";
      });
      comment.addEventListener("mouseover", (e) => {
        comment.style.filter = "";
      });
      comment.addEventListener("mouseout", (e) => {
        comment.style.filter = "blur(5px)";
      });
    }
  }
  const element = document.getElementById(elementId);
  if (!element) return;
}
