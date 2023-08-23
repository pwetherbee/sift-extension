import { getTwitterContext } from "./Domains/Twitter";

export default function getContext(domain: string) {
  domain = domain.replace("www.", "");
  switch (domain) {
    case "twitter.com":
      return getTwitterContext();
    default:
      return null;
  }
}
