const api = typeof browser !== "undefined" ? browser : chrome;

const DEFAULT_SPEED = 2.5;
const MIN_SPEED = 0.25;
const MAX_SPEED = 8;

const round = (n) => Math.round(n * 100) / 100;
const validSpeed = (s) =>
  typeof s === "number" && Number.isFinite(s) && s >= MIN_SPEED && s <= MAX_SPEED;
const clamp = (s) => Math.min(MAX_SPEED, Math.max(MIN_SPEED, s));
const tabKey = (tabId) => `tabSpeed_${tabId}`;
const hostCache = new Map();

const isEnabled = async () => {
  const data = await api.storage.sync.get("enabled");
  return data.enabled !== false;
};

const getSettings = async () => {
  const data = await api.storage.sync.get(["settings", "defaultSpeed"]);
  return {
    settings: data.settings || {},
    defaultSpeed: validSpeed(data.defaultSpeed) ? data.defaultSpeed : DEFAULT_SPEED
  };
};

const getHostname = async (tabId) => {
  try {
    const tab = await api.tabs.get(tabId);
    if (!tab || !tab.url) return null;
    let host;
    try {
      host = new URL(tab.url).hostname;
    } catch {
      return null;
    }
    if (host.startsWith("www.")) host = host.slice(4);
    return host || null;
  } catch {
    return null;
  }
};

const setHostname = (tabId, hostname) => {
  if (hostname) hostCache.set(tabId, hostname);
};

const getTabHostname = async (tabId, provided) => {
  if (provided) {
    setHostname(tabId, provided);
    return provided;
  }
  const cached = hostCache.get(tabId);
  if (cached) return cached;
  const host = await getHostname(tabId);
  if (host) hostCache.set(tabId, host);
  return host;
};

const resolveSpeed = async (tabId) => {
  if (tabId == null) return DEFAULT_SPEED;
  const local = await api.storage.local.get(tabKey(tabId));
  const override = local[tabKey(tabId)];
  if (validSpeed(override)) return override;
  const { settings, defaultSpeed } = await getSettings();
  const host = await getTabHostname(tabId);
  if (host && validSpeed(settings[host])) return settings[host];
  return defaultSpeed;
};

const setOverride = (tabId, speed) =>
  api.storage.local.set({ [tabKey(tabId)]: clamp(speed) });

const clearOverride = (tabId) => api.storage.local.remove(tabKey(tabId));

const applyToTab = (tabId) => {
  api.tabs.sendMessage(tabId, { action: "apply_speed" }).catch(() => {});
};

const updateBadge = async (tabId) => {
  try {
    const [active] = await api.tabs.query({ active: true, currentWindow: true });
    if (!active || active.id !== tabId) return;
    if (!(await isEnabled())) {
      await api.action.setBadgeText({ tabId, text: "" });
      return;
    }
    const speed = await resolveSpeed(tabId);
    const label = String(parseFloat(speed.toFixed(2)));
    await api.action.setBadgeText({ tabId, text: label });
    await api.action.setBadgeBackgroundColor({ tabId, color: "#0b57d0" });
  } catch {}
};

const handleMessage = async (message, sender) => {
  switch (message.action) {
    case "get_speed": {
      const tabId = sender.tab && sender.tab.id;
      if (tabId == null) return { ok: false };
      setHostname(tabId, message.hostname);
      const speed = await resolveSpeed(tabId);
      updateBadge(tabId).catch(() => {});
      return { ok: true, speed, enabled: await isEnabled() };
    }

    case "get_popup_data": {
      const tabId = message.tabId;
      if (tabId == null) return { ok: false };
      const host = await getTabHostname(tabId, message.hostname);
      const { settings, defaultSpeed } = await getSettings();
      const siteSpeed = host && validSpeed(settings[host]) ? settings[host] : null;
      const local = await api.storage.local.get(tabKey(tabId));
      const override = validSpeed(local[tabKey(tabId)]);
      const speed = await resolveSpeed(tabId);
      return {
        ok: host != null,
        hostname: host,
        siteSaved: siteSpeed != null,
        siteSpeed,
        globalDefault: defaultSpeed,
        override,
        speed,
        enabled: await isEnabled()
      };
    }

    case "set_speed": {
      const { tabId, speed, scope } = message;
      if (tabId == null || !validSpeed(speed)) return { ok: false };
      if (scope === "global") {
        await api.storage.sync.set({ defaultSpeed: speed });
      } else if (scope === "site") {
        const host = await getTabHostname(tabId, message.hostname);
        if (!host) return { ok: false };
        const { settings } = await getSettings();
        settings[host] = speed;
        await api.storage.sync.set({ settings });
        await clearOverride(tabId);
      } else {
        await setOverride(tabId, speed);
      }
      applyToTab(tabId);
      updateBadge(tabId).catch(() => {});
      return { ok: true };
    }

    case "clear_tab": {
      const tabId = message.tabId;
      if (tabId == null) return { ok: false };
      await clearOverride(tabId);
      applyToTab(tabId);
      updateBadge(tabId).catch(() => {});
      return { ok: true, speed: await resolveSpeed(tabId) };
    }

    case "toggle_site": {
      const { tabId, enabled, speed } = message;
      if (tabId == null || !validSpeed(speed)) return { ok: false };
      const host = await getTabHostname(tabId, message.hostname);
      if (!host) return { ok: false };
      const { settings } = await getSettings();
      if (enabled) settings[host] = speed;
      else delete settings[host];
      await api.storage.sync.set({ settings });
      await clearOverride(tabId);
      applyToTab(tabId);
      updateBadge(tabId).catch(() => {});
      return { ok: true, siteSaved: enabled };
    }

    case "toggle_enabled": {
      const enabled = message.enabled === true;
      await api.storage.sync.set({ enabled });
      const [tab] = await api.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id != null) {
        applyToTab(tab.id);
        updateBadge(tab.id).catch(() => {});
      }
      return { ok: true, enabled };
    }

    default:
      return { ok: false };
  }
};

const handleListener = async (message, sender) => {
  try {
    return await handleMessage(message, sender);
  } catch (error) {
    return { ok: false, error: String(error) };
  }
};

api.runtime.onMessage.addListener(handleListener);

api.commands.onCommand.addListener(async (command) => {
  if (!(await isEnabled())) return;
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.id == null) return;
  const current = await resolveSpeed(tab.id);
  let target;
  switch (command) {
    case "set_speed_100":
      target = 1;
      break;
    case "set_speed_135":
      target = 1.35;
      break;
    case "set_speed_200":
      target = 2;
      break;
    case "set_speed_250":
      target = 2.5;
      break;
    case "speed_up":
      target = clamp(round(current + 0.25));
      break;
    case "speed_down":
      target = clamp(round(current - 0.25));
      break;
    case "reset_speed":
      await clearOverride(tab.id);
      applyToTab(tab.id);
      updateBadge(tab.id).catch(() => {});
      return;
    default:
      return;
  }
  await setOverride(tab.id, target);
  applyToTab(tab.id);
  updateBadge(tab.id).catch(() => {});
});

api.tabs.onRemoved.addListener((tabId) => {
  hostCache.delete(tabId);
  clearOverride(tabId);
});

api.tabs.onActivated.addListener(({ tabId }) => updateBadge(tabId).catch(() => {}));

api.storage.onChanged.addListener(async (changes, area) => {
  if (area === "sync" && (changes.settings || changes.defaultSpeed || changes.enabled)) {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id != null) updateBadge(tab.id).catch(() => {});
  }
});