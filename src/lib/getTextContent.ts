import { fetchTweets } from "./Domains/Twitter";
import { fetchYoutubeComments } from "./Domains/Youtube";

export default function getTextElements(domain: string) {
  domain = domain.replace("www.", "");
  switch (domain) {
    case "twitter.com":
      return fetchTweets();
    case "youtube.com":
      return fetchYoutubeComments();
    default:
      return [];
  }
}
