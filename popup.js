const $ = (id) => document.getElementById(id);

const MIN_SPEED = 0.25;
const MAX_SPEED = 8;

const state = {
  tabId: null,
  hostname: null,
  speed: 2.5,
  siteSaved: false,
  override: false,
  enabled: true
};

const clampSpeed = (s) => Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(s) || 2.5));
const formatRate = (r) => `${parseFloat(r.toFixed(2))}x`;

let sliderTimer = null;

const render = () => {
  $("rate").textContent = formatRate(state.speed);
  $("slider").value = String(state.speed);
  const source = state.override
    ? "tab override"
    : state.siteSaved
    ? "site profile"
    : "global default";
  $("source").textContent = source;
  $("remember").checked = !!state.siteSaved;
  $("rememberLabel").textContent = state.hostname
    ? `Remember ${state.hostname}`
    : "Remember for this site";
  $("reset").disabled = !state.override;
  $("enabledToggle").checked = !!state.enabled;
  $("speedControls").classList.toggle("muted", !state.enabled);
  $("offNote").hidden = !!state.enabled;
};

const showUnavailable = () => {
  $("controls").hidden = true;
  $("unavailable").hidden = false;
};

const send = (message) =>
  chrome.runtime.sendMessage(message).catch(() => ({ ok: false }));

const sendSpeed = async (speed, scope) => {
  const res = await send({
    action: "set_speed",
    tabId: state.tabId,
    speed,
    scope,
    hostname: state.hostname
  });
  if (res && res.ok) {
    state.speed = clampSpeed(speed);
    render();
  }
};

const refresh = async () => {
  const res = await send({
    action: "get_popup_data",
    tabId: state.tabId,
    hostname: state.hostname
  });
  if (!res || !res.ok) return;
  state.hostname = res.hostname;
  state.speed = res.speed;
  state.siteSaved = res.siteSaved;
  state.override = res.override;
  state.enabled = res.enabled !== false;
  render();
};

const init = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.id == null) {
    showUnavailable();
    return;
  }
  state.tabId = tab.id;
  let hostFromPage = null;
  try {
    const info = await chrome.tabs.sendMessage(tab.id, { action: "info" });
    hostFromPage = info && info.hostname ? info.hostname : null;
  } catch {}
  const res = await send({
    action: "get_popup_data",
    tabId: tab.id,
    hostname: hostFromPage
  });
  if (!res || !res.ok || !res.hostname) {
    showUnavailable();
    return;
  }
  state.hostname = res.hostname;
  state.siteSaved = res.siteSaved;
  state.override = res.override;
  state.enabled = res.enabled !== false;
  state.speed = res.speed && res.speed > 0 ? res.speed : res.globalDefault || 2.5;
  $("site").textContent = res.hostname || "This page";
  $("controls").hidden = false;
  render();
};

document.addEventListener("DOMContentLoaded", () => {
  $("slider").addEventListener("input", () => {
    const value = clampSpeed(parseFloat($("slider").value));
    state.speed = value;
    $("rate").textContent = formatRate(value);
    clearTimeout(sliderTimer);
    sliderTimer = setTimeout(() => sendSpeed(value, "tab"), 150);
  });

  $("up").addEventListener("click", () => sendSpeed(clampSpeed(state.speed + 0.25), "tab"));
  $("down").addEventListener("click", () => sendSpeed(clampSpeed(state.speed - 0.25), "tab"));

  document.querySelectorAll(".presets button").forEach((button) => {
    button.addEventListener("click", () => {
      sendSpeed(clampSpeed(parseFloat(button.dataset.speed)), "tab");
    });
  });

  $("remember").addEventListener("change", async () => {
    if (!state.tabId) return;
    const enabled = $("remember").checked;
    await send({
      action: "toggle_site",
      tabId: state.tabId,
      enabled,
      speed: state.speed,
      hostname: state.hostname
    });
    await refresh();
  });

  $("reset").addEventListener("click", async () => {
    if (!state.tabId) return;
    const res = await send({ action: "clear_tab", tabId: state.tabId });
    if (res && res.ok) state.speed = res.speed;
    await refresh();
  });

  $("enabledToggle").addEventListener("change", async () => {
    if (!state.tabId) return;
    const enabled = $("enabledToggle").checked;
    const res = await send({ action: "toggle_enabled", enabled });
    if (res && res.ok) state.enabled = res.enabled;
    await refresh();
  });

  $("optionsLink").addEventListener("click", (event) => {
    event.preventDefault();
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
    else window.close();
  });

  init();
});