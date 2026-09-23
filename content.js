const api = typeof browser !== "undefined" ? browser : chrome;

const MIN_SPEED = 0.25;
const MAX_SPEED = 8;

const clamp = (s) => Math.min(MAX_SPEED, Math.max(MIN_SPEED, s));
const clampToBrowser = (s) => Math.min(16, Math.max(0.0625, s));

let applyTimer = null;

const hasVideo = () => !!document.querySelector("video");

const applyRate = (rate) => {
  rate = clamp(rate);
  const next = clampToBrowser(rate);
  document.querySelectorAll("video").forEach((video) => {
    if (Math.abs(video.playbackRate - next) > 0.001) {
      video.playbackRate = next;
    }
  });
};

const fetchAndApply = () => {
  if (!hasVideo()) return;
  const hostname = location.hostname.replace(/^www\./, "");
  api.runtime
    .sendMessage({ action: "get_speed", hostname })
    .then((response) => {
      if (!response || !response.ok) return;
      if (response.enabled === false) {
        applyRate(1);
        return;
      }
      if (response.speed) applyRate(response.speed);
    })
    .catch(() => {});
};

const scheduleApply = () => {
  clearTimeout(applyTimer);
  applyTimer = setTimeout(fetchAndApply, 250);
};

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "apply_speed") {
    fetchAndApply();
    if (sendResponse) sendResponse({ ok: true });
  } else if (message.action === "info") {
    const video = document.querySelector("video");
    if (sendResponse) {
      sendResponse({
        hostname: location.hostname.replace(/^www\./, ""),
        hasVideo: !!video,
        rate: video ? video.playbackRate : null
      });
    }
  }
  return true;
});

api.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && (changes.settings || changes.defaultSpeed || changes.enabled)) {
    scheduleApply();
  }
});

const start = () => {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", start, { once: true });
    return;
  }
  fetchAndApply();

  const domObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches && (node.matches("video") || node.querySelector("video"))) {
          scheduleApply();
          return;
        }
      }
    }
  });
  domObserver.observe(document.body, { childList: true, subtree: true });

  const attrObserver = new MutationObserver((records) => {
    for (const record of records) {
      if (
        record.type === "attributes" &&
        record.target.matches &&
        record.target.matches("video")
      ) {
        scheduleApply();
        return;
      }
    }
  });
  attrObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["src"] });

  window.addEventListener("beforeunload", () => {
    domObserver.disconnect();
    attrObserver.disconnect();
    clearTimeout(applyTimer);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}