import { getTwitterTargetNode } from "./Domains/Twitter";
import { getYoutubeTargetNode } from "./Domains/Youtube";

export default function getTargetNode(domain: string) {
  domain = domain.replace("www.", "");
  switch (domain) {
    case "twitter.com":
      return getTwitterTargetNode();
    case "youtube.com":
      return getYoutubeTargetNode();
    default:
      return null;
  }
}
