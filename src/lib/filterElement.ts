import { FilteredTextItem } from "../types/TextItem";
import { filterTweet } from "./Domains/Twitter";
import { filterYoutubeComment } from "./Domains/Youtube";
import getDomain from "./getDomain";

export default function filterItem(
  item: FilteredTextItem,
  filterConfig: string[]
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
