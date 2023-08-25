import { getTargetNode } from "./DomainSpecificGetters";

export function startObserving(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const domain = window.location.hostname;
      const targetNode = getTargetNode(domain);

      if (!targetNode)
        return chrome.runtime.sendMessage({ noTargetNode: true });

      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            window.debouncedGrabAndFilter();
          }
        });
      });

      // Define the target node and config
      const config = { childList: true, subtree: true };

      // Start observing the target node
      observer.observe(targetNode, config);

      // Save observer to window so it can be accessed later for cleanup
      window.observer = observer;
    },
  });
}
