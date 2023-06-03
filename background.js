chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: async () => {
          console.log("getting job details div");
          var jobDetailsDiv = document.getElementById("job-details");
          if (jobDetailsDiv) {
            const response = await chrome.runtime.sendMessage({
              foundJobDescription: true,
            });
          }
        },
      })
      .then(() => {});
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.foundJobDescription) {
    chrome.action.setBadgeBackgroundColor({ color: [255, 0, 0, 150] }, () => {
      console.log("call back text");
      chrome.action.setBadgeText({ text: "1" });
    });
    console.log("executing script");
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.executeAIGen) {
    executeAIGen(request.jobDescription, sender).then(() => {
      console.log("done");
    });
  }
});

async function executeAIGen(jobDescription, sender) {
  try {
    const res = await fetch("http://localhost:3000/api/edit-default-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobDescription,
      }),
    });
    const data = await res.json();
    console.log(data);
    // execute script that sets the text area to the data
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: function (data) {
        chrome.storage.local.set({ message: data.message });
        document.getElementById("generated-resume-text").textContent =
          data.message;
      },
      args: [data],
    });
  } catch (error) {
    console.log(error);
  }
}
