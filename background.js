chrome.commands.onCommand.addListener((command) => {
    let speed;
  
    // Set speed based on the command
    switch (command) {
      case "set_speed_100":
        speed = 1.0;
        break;
      case "set_speed_135":
        speed = 1.35;
        break;
      case "set_speed_200":
        speed = 2.0;
        break;
      case "set_speed_250":
        speed = 2.5;
        break;
    }
  
    if (speed !== undefined) {
      // Get the active tab and apply speed specifically to it
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id; // Use optional chaining to avoid issues if tabs[0] is undefined
  
        if (tabId) {
          // Store the speed specifically for the tab
          chrome.storage.local.set({ [`tabSpeed_${tabId}`]: speed }, () => {
            // Send a message to content.js to apply the speed change to the video
            chrome.tabs.sendMessage(tabId, { action: "set_speed", speed: speed }, (response) => {
              if (chrome.runtime.lastError) {
                console.warn("Could not send message to content script. Tab may be closed.");
              }
            });
          });
        }
      });
    }
  });
  
  // Listen for requests from content scripts to get or set the speed
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "get_speed") {
      const tabId = sender.tab?.id;
  
      if (tabId) {
        // Return the stored speed for this tab
        chrome.storage.local.get([`tabSpeed_${tabId}`], (data) => {
          sendResponse({ speed: data[`tabSpeed_${tabId}`] || 2.5 }); // Default speed is 2.5 if not set
        });
  
        // Ensure the response is sent asynchronously
        return true;
      }
    }
  });
  