import { DomainInfo } from "@/src/types/DomainInfo";
import { RemovalConfig } from "@/src/types/RemovalConfig";
import { FilteredTextItem } from "@/src/types/TextItem";

export const AmazonInfo: DomainInfo = {
  domain: "amazon.com",
  contextPrompt: "Filter Amazon reviews",
};

export function getAmazonContext() {
  return document.getElementById("productTitle");
}

export function fetchAmazonReviews() {
  const elements = document.querySelectorAll('[data-hook="review"]');
  return Array.from(elements)
    .map((element) => {
      if (element.getAttribute("data-filtered")) return;

      // Find the child node with attribute data-hook="review-body"
      const reviewBody = element.querySelector('[data-hook="review-body"]');
      const reviewText = reviewBody?.textContent
        ? reviewBody.textContent.trim()
        : null;

      return { id: element.id, text: reviewText };
    })
    .filter((element) => element && element.text); // Filter out null or empty texts
}

export function getAmazonTargetNode() {
  const element = document.getElementById("reviewsMedley");
  if (!element) {
    throw new Error("Could not find target node element");
  }
  return element;
}

export function filterAmazonReviews(
  item: FilteredTextItem,
  config: RemovalConfig
) {
  const elementId = item.textItem.id;
  const element = document.getElementById(elementId);
  if (!element) return;
  if (element.textContent?.includes(item.textItem.text)) {
    // set isFiltered tag
    element.setAttribute("data-filtered", "true");

    // apply filter
    if (config.hideStyle === "remove") {
      element.style.display = item.hide ? "none" : "";
    }
    if (config.hideStyle === "blur") {
      element.style.filter = item.hide ? "blur(5px)" : "";
      if (item.hide) {
        element.addEventListener("click", (e) => {
          element.style.filter = "";
        });
        element.addEventListener("mouseover", (e) => {
          element.style.filter = "";
        });
        element.addEventListener("mouseout", (e) => {
          element.style.filter = "blur(5px)";
        });
      }
    }
  }
}
