import { RemovalConfig } from "../types/RemovalConfig";
import { FilteredTextItem } from "../types/TextItem";
import { filterTweet } from "./Domains/Twitter";
import { filterYoutubeComment } from "./Domains/Youtube";
import getDomain from "./getDomain";

export default function filterItem(
  item: FilteredTextItem,
  filterConfig: RemovalConfig
) {
  const domain = getDomain();
  switch (domain) {
    case "twitter.com":
      return filterTweet(item, filterConfig);
    case "youtube.com":
      return filterYoutubeComment(item, filterConfig);
    default:
      return false;
  }
}
