const api = typeof browser !== "undefined" ? browser : chrome;

const $ = (id) => document.getElementById(id);

const MIN_SPEED = 0.25;
const MAX_SPEED = 8;

let editingDomain = null;

const parseSpeed = (value) => {
  const n = parseFloat(value);
  if (!Number.isFinite(n) || n < MIN_SPEED || n > MAX_SPEED) return null;
  return Math.round(n * 100) / 100;
};

const normalizeDomain = (raw) =>
  String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];

const isValidDomain = (d) => d.length > 0 && /^[a-z0-9.-]+$/.test(d);

const flash = (id, text, isError) => {
  const el = $(id);
  el.textContent = text;
  el.className = "msg" + (isError ? " error" : "");
  if (!isError) setTimeout(() => { el.textContent = ""; }, 2500);
};

const renderList = (settings) => {
  const list = $("settingsList");
  const entries = Object.entries(settings).sort(([a], [b]) => a.localeCompare(b));
  list.innerHTML = "";

  for (const [domain, speed] of entries) {
    const li = document.createElement("li");
    li.className = "domain-item";

    const info = document.createElement("span");
    info.className = "info";
    info.appendChild(document.createTextNode(domain));
    const speedSpan = document.createElement("span");
    speedSpan.className = "speed";
    speedSpan.textContent = `${speed}x`;
    info.appendChild(speedSpan);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editButton = document.createElement("button");
    editButton.className = "edit-button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      editingDomain = domain;
      $("domain").value = domain;
      $("speed").value = speed;
      $("saveBtn").textContent = "Update";
      $("cancelBtn").hidden = false;
      $("formMsg").textContent = "";
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const next = { ...settings };
      delete next[domain];
      api.storage.sync.set({ settings: next }, () => {
        if (editingDomain === domain) {
          editingDomain = null;
          $("saveBtn").textContent = "Add";
          $("cancelBtn").hidden = true;
          $("settingsForm").reset();
        }
        renderList(next);
      });
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    li.appendChild(info);
    li.appendChild(actions);
    list.appendChild(li);
  }

  $("emptyList").hidden = entries.length > 0;
};

const loadSettings = () => {
  api.storage.sync.get(["settings", "defaultSpeed"], (data) => {
    $("defaultSpeed").value = data.defaultSpeed ?? 2.5;
    renderList(data.settings || {});
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const form = $("settingsForm");

  $("saveDefault").addEventListener("click", () => {
    const speed = parseSpeed($("defaultSpeed").value);
    if (speed == null) {
      flash("defaultMsg", `Enter a speed between ${MIN_SPEED} and ${MAX_SPEED}.`, true);
      return;
    }
    api.storage.sync.set({ defaultSpeed: speed }, () => {
      flash("defaultMsg", "Global default saved and applied to open pages.");
    });
  });

  $("cancelBtn").addEventListener("click", () => {
    editingDomain = null;
    $("saveBtn").textContent = "Add";
    $("cancelBtn").hidden = true;
    form.reset();
    $("formMsg").textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const domain = normalizeDomain($("domain").value);
    const speed = parseSpeed($("speed").value);

    if (!isValidDomain(domain)) {
      flash("formMsg", "Enter a valid domain, e.g. youtube.com.", true);
      return;
    }
    if (speed == null) {
      flash("formMsg", `Enter a speed between ${MIN_SPEED} and ${MAX_SPEED}.`, true);
      return;
    }

    api.storage.sync.get("settings", (data) => {
      const settings = data.settings || {};
      if (editingDomain && editingDomain !== domain) delete settings[editingDomain];
      settings[domain] = speed;
      api.storage.sync.set({ settings }, () => {
        editingDomain = null;
        $("saveBtn").textContent = "Add";
        $("cancelBtn").hidden = true;
        form.reset();
        renderList(settings);
        flash("formMsg", `Saved for ${domain}.`);
      });
    });
  });

  loadSettings();
});