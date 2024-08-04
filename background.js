const API_ENDPOINT = "http://localhost:3001/secure/ai";

const getSummary = (content, callback) => {
  const encodedContent = encodeURIComponent(content);

  fetch(API_ENDPOINT + "/summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: "Please summarize the below uri encoded content. \n\n" + content }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (callback && typeof callback === "function") {
        callback(data);
      }
    })
    .catch((error) => {
      console.error("Error: " + error);
      if (callback && typeof callback === "function") {
        callback({ summary: "Error fetching summary." });
      }
    });
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarizeText",
    title: "AI Summary",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarizeText") {
    const selectedText = info.selectionText;

    console.log("Selected Text: " + selectedText);

    getSummary(selectedText, (data) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (summary) => {
          const summaryElement = document.createElement("div");
          summaryElement.style.position = "fixed";
          summaryElement.style.bottom = "10px";
          summaryElement.style.right = "10px";
          summaryElement.style.backgroundColor = "white";
          summaryElement.style.border = "1px solid black";
          summaryElement.style.padding = "10px";
          summaryElement.style.zIndex = 10000;
          summaryElement.innerText = summary;
          document.body.appendChild(summaryElement);
        },
        args: [data.message],
      });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeEmail") {
    const selectedText = request.emailContent;

    console.log("Selected Email Content: " + selectedText);

    getSummary(selectedText, (data) => {
      sendResponse({ summary: data.message });
    });

    return true; // Will respond asynchronously.
  }
});
