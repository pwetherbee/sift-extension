import { DomainInfo } from "@/src/types/DomainInfo";
import { RemovalConfig } from "@/src/types/RemovalConfig";
import { FilteredTextItem } from "@/src/types/TextItem";

export const YoutubeInfo: DomainInfo = {
  domain: "twitter.com",
  contextPrompt: "Filter Tweets",
};

export function getYoutubeContext() {
  return document.querySelector("h1");
}

export function fetchYoutubeComments() {
  const elements = document.querySelectorAll("[id=content-text]");

  // filter out elements that have already been filtered with data-filtered attribute

  // const filteredElements = Array.from(elements).filter((element) => {
  //   return !element.getAttribute("data-filtered");
  // });

  return Array.from(elements)
    .map((element) => {
      if (element.getAttribute("data-filtered")) return;
      return { id: element.id, text: element.textContent };
    })
    .filter((element) => element);
}

export function getYoutubeTargetNode() {
  const element = document.getElementById("page-manager");
  if (!element) {
    throw new Error("Could not find comments element");
  }
  return element;
}

export function filterYoutubeComment(
  item: FilteredTextItem,
  config: RemovalConfig
) {
  const elementId = item.textItem.id;

  // search for comment with matching text
  for (const comment of Array.from(
    document.querySelectorAll<HTMLElement>("[id=content-text]")
  )) {
    // if text matches, filter comment
    if (comment.textContent?.includes(item.textItem.text)) {
      // set isFiltered tag
      comment.setAttribute("data-filtered", "true");

      // apply filter
      if (config.hideStyle === "remove") {
        comment.style.display = item.hide ? "none" : "";
      }
      if (config.hideStyle === "blur") {
        comment.style.filter = item.hide ? "blur(5px)" : "";
        if (item.hide) {
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
    }
  }
  const element = document.getElementById(elementId);
  if (!element) return;
}
