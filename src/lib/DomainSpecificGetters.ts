import { getTwitterContext } from "./Domains/Twitter";
import { getYoutubeContext } from "./Domains/Youtube";
import { TwitterInfo } from "./Domains/Twitter";
import { YoutubeInfo } from "./Domains/Youtube";
import { getTwitterTargetNode } from "./Domains/Twitter";
import { getYoutubeTargetNode } from "./Domains/Youtube";
import { fetchTweets } from "./Domains/Twitter";
import { fetchYoutubeComments } from "./Domains/Youtube";
import { DomainInfo } from "../types/DomainInfo";
import {
  AmazonInfo,
  fetchAmazonReviews,
  filterAmazonReviews,
  getAmazonContext,
  getAmazonTargetNode,
} from "./Domains/Amazon";

import { RemovalConfig } from "../types/RemovalConfig";
import { FilteredTextItem, TextItem } from "../types/TextItem";
import { filterTweet } from "./Domains/Twitter";
import { filterYoutubeComment } from "./Domains/Youtube";
import getDomain from "./getDomain";

export const domainConfigs: {
  [key: string]: {
    getContext: () => Element | null;
    getTargetNode: () => Element | null;
    // convert to promise
    // getTextElements: () => ({ id: string; text: string | null } | undefined)[];
    getTextElements: () => Promise<TextItem[]>;
    filterText: (item: FilteredTextItem, filterConfig: RemovalConfig) => void;
    domainInfo: DomainInfo;
  };
} = {
  "twitter.com": {
    getContext: getTwitterContext,
    getTargetNode: getTwitterTargetNode,
    getTextElements: fetchTweets,
    filterText: filterTweet,
    domainInfo: TwitterInfo,
  },
  "youtube.com": {
    getContext: getYoutubeContext,
    getTargetNode: getYoutubeTargetNode,
    getTextElements: fetchYoutubeComments,
    filterText: filterYoutubeComment,
    domainInfo: YoutubeInfo,
  },

  "amazon.com": {
    getContext: getAmazonContext,
    getTargetNode: getAmazonTargetNode,
    getTextElements: fetchAmazonReviews,
    filterText: filterAmazonReviews,
    domainInfo: AmazonInfo,
  },
};

export function getDomainInfo(domain: string) {
  domain = domain.replace("www.", "");
  return domainConfigs[domain]?.domainInfo;
}

export function getContext(domain: string) {
  domain = domain.replace("www.", "");
  return domainConfigs[domain]?.getContext();
}

export function getTargetNode(domain: string) {
  // not sure why webpack hates doing it the normal way, but this works
  domain = domain.replace("www.", "");
  switch (domain) {
    case "twitter.com":
      return getTwitterTargetNode();
    case "youtube.com":
      return getYoutubeTargetNode();
    case "amazon.com":
      return getAmazonTargetNode();
    default:
      return null;
  }
}

export async function getTextElements(domain: string) {
  domain = domain.replace("www.", "");
  return domainConfigs[domain]?.getTextElements();
}

export default function filterItem(
  item: FilteredTextItem,
  filterConfig: RemovalConfig
) {
  let domain = getDomain();
  return domainConfigs[domain]?.filterText(item, filterConfig);
}
