import { getTwitterContext } from "./Domains/Twitter";
import { getYoutubeContext } from "./Domains/Youtube";

export default function getContext(domain: string) {
  domain = domain.replace("www.", "");
  switch (domain) {
    case "twitter.com":
      return getTwitterContext();
    case "youtube.com":
      return getYoutubeContext();
    default:
      return null;
  }
}
