document.getElementById("summarizeEmail").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getEmailContent" }, (response) => {
      if (response.emailContent) {
        chrome.runtime.sendMessage({ action: "summarizeEmail", emailContent: response.emailContent }, (response) => {
          document.getElementById("summary").innerText = response.summary;
        });
      }
    });
  });
});

document.getElementById("summarizeText").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getSelectedText,
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          chrome.runtime.sendMessage({ action: "summarizeText", textContent: results[0].result }, (response) => {
            document.getElementById("summary").innerText = response.summary;
          });
        }
      }
    );
  });
});

function getSelectedText() {
  return window.getSelection().toString();
}
