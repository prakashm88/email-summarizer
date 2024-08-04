// Function to inject the "AI Summary" button into Gmail
const injectAISummaryButton = () => {
  const existingButton = document.getElementById("ai-summary-button");
  if (existingButton) {
    return; // Button already exists, do not add it again
  }

  const targetElement = document.querySelector(".AO");
  if (targetElement) {
    const aiSummaryButton = document.createElement("button");
    aiSummaryButton.id = "ai-summary-button";
    aiSummaryButton.innerText = "AI Summary";
    aiSummaryButton.style.position = "absolute";
    aiSummaryButton.style.top = "10px";
    aiSummaryButton.style.right = "10px";
    aiSummaryButton.style.zIndex = 10000;
    aiSummaryButton.style.backgroundColor = "#007bff";
    aiSummaryButton.style.color = "#ffffff";
    aiSummaryButton.style.border = "none";
    aiSummaryButton.style.padding = "10px";
    aiSummaryButton.style.cursor = "pointer";

    aiSummaryButton.addEventListener("click", () => {
      const emailContent = getEmailContent();
      if (emailContent) {
        chrome.runtime.sendMessage({ action: "summarizeEmail", emailContent: emailContent }, (response) => {
          showAISummaryOverlay(response.summary);
        });
      }
    });

    targetElement.prepend(aiSummaryButton);
  }
};

// Function to extract email content from Gmail's DOM
const getEmailContent = () => {
  const emailContentElement = document.querySelector(".AO"); // Selector for the email body content
  return emailContentElement ? emailContentElement.innerText : "";
};

// Function to create and show the AI Summary overlay
const showAISummaryOverlay = (summary) => {
  // Remove existing overlay if present
  const existingOverlay = document.getElementById("ai-summary-overlay");
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay elements
  const overlay = document.createElement("div");
  overlay.id = "ai-summary-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  overlay.style.zIndex = 10000;
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const content = document.createElement("div");
  content.style.backgroundColor = "white";
  content.style.padding = "20px";
  content.style.borderRadius = "10px";
  content.style.maxWidth = "500px";
  content.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

  const title = document.createElement("h2");
  title.innerText = "AI Summary";
  title.style.marginTop = "0";

  const summaryText = document.createElement("p");
  summaryText.innerText = summary;

  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";
  closeButton.style.marginTop = "20px";
  closeButton.style.padding = "10px";
  closeButton.style.backgroundColor = "#007bff";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";

  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  // Append elements
  content.appendChild(title);
  content.appendChild(summaryText);
  content.appendChild(closeButton);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
};

// Inject the "AI Summary" button when the content script is loaded
injectAISummaryButton();

// Observe changes in the Gmail DOM to inject the button when necessary
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      injectAISummaryButton();
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getEmailContent") {
    const emailContent = getEmailContent();
    sendResponse({ emailContent: emailContent });
  }
});
