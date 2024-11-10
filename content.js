const DEFAULT_SPEED = 2.5;  // Default speed for the site

const applySpeed = (speed) => {
  const videos = document.querySelectorAll("video");
  videos.forEach(video => {
    video.playbackRate = speed;
  });
};

// Flag to indicate whether the page is about to be unloaded
let isUnloading = false;

// Function to handle applying the appropriate speed to the current tab
const setVideoSpeed = () => {
  // Avoid sending a message if the tab is about to unload
  if (isUnloading) {
    return;
  }

  // Send a message to background.js to get the current speed for this tab
  chrome.runtime.sendMessage({ action: "get_speed" }, (response) => {
    if (response && response.speed !== undefined) {
      const speed = response.speed || DEFAULT_SPEED;
      applySpeed(speed);
    } else {
      console.warn("Failed to retrieve speed, using default.");
      applySpeed(DEFAULT_SPEED);
    }
  });
};

// Apply speed when page is loaded or DOM is mutated
setVideoSpeed();

// Monitor for changes to the page (e.g., dynamically loaded videos)
const observer = new MutationObserver(setVideoSpeed);
observer.observe(document.body, { childList: true, subtree: true });

// Clean up when the page is about to be unloaded
window.addEventListener('beforeunload', () => {
  isUnloading = true; // Flag indicating that the page is unloading
  observer.disconnect(); // Stop observing mutations
});
