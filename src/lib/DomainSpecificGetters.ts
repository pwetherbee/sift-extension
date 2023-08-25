import { getTwitterContext } from "./Domains/Twitter";
import { getYoutubeContext } from "./Domains/Youtube";
import { TwitterInfo } from "./Domains/Twitter";
import { YoutubeInfo } from "./Domains/Youtube";
import { getTwitterTargetNode } from "./Domains/Twitter";
import { getYoutubeTargetNode } from "./Domains/Youtube";
import { fetchTweets } from "./Domains/Twitter";
import { fetchYoutubeComments } from "./Domains/Youtube";
import { DomainInfo } from "../types/DomainInfo";

const domainConfigs: {
  [key: string]: {
    getContext: () => Element | null;
    getTargetNode: () => Element | null;
    getTextElements: () => ({ id: string; text: string | null } | undefined)[];
    domainInfo: DomainInfo;
  };
} = {
  "twitter.com": {
    getContext: getTwitterContext,
    getTargetNode: getTwitterTargetNode,
    getTextElements: fetchTweets,
    domainInfo: TwitterInfo,
  },
  "youtube.com": {
    getContext: getYoutubeContext,
    getTargetNode: getYoutubeTargetNode,
    getTextElements: fetchYoutubeComments,
    domainInfo: YoutubeInfo,
  },
};

export function getContext(domain: string) {
  domain = domain.replace("www.", "");
  return domainConfigs[domain]?.getContext();
}

export function getDomainInfo(domain: string) {
  domain = domain.replace("www.", "");
  return domainConfigs[domain]?.domainInfo;
}

export function getTargetNode(domain: string) {
  domain = domain.replace("www.", "");
  return domainConfigs[domain]?.getTargetNode();
}

export function getTextElements(domain: string) {
  domain = domain.replace("www.", "");
  return domainConfigs[domain]?.getTextElements();
}
