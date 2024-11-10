document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("settingsForm");
    const settingsList = document.getElementById("settingsList");
    const domainInput = document.getElementById("domain");
    const speedInput = document.getElementById("speed");
    let editingDomain = null;
  
    // Load saved settings and display them
    chrome.storage.sync.get("settings", (data) => {
      const settings = data.settings || {};
      updateSettingsList(settings);
    });
  
    // Handle form submit to save or update a setting
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const domain = domainInput.value.trim();
      const speed = parseFloat(speedInput.value);
  
      if (domain && speed) {
        chrome.storage.sync.get("settings", (data) => {
          const settings = data.settings || {};
  
          // If editing, remove the old entry
          if (editingDomain && editingDomain !== domain) {
            delete settings[editingDomain];
          }
  
          // Update or add the new setting
          settings[domain] = speed;
          chrome.storage.sync.set({ settings }, () => {
            updateSettingsList(settings);
            form.reset();
            editingDomain = null;
          });
        });
      }
    });
  
    // Update the displayed list of saved settings
    function updateSettingsList(settings) {
      settingsList.innerHTML = "";
  
      for (const [domain, speed] of Object.entries(settings)) {
        const li = document.createElement("li");
        li.className = "domain-item";
  
        // Display domain and speed
        const info = document.createElement("span");
        info.textContent = `${domain}: ${speed}x`;
  
        // Edit button
        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Edit";
        editButton.onclick = () => {
          domainInput.value = domain;
          speedInput.value = speed;
          editingDomain = domain;
        };
  
        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => {
          delete settings[domain];
          chrome.storage.sync.set({ settings }, () => {
            updateSettingsList(settings);
          });
        };
  
        // Append info and buttons to list item
        li.appendChild(info);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        settingsList.appendChild(li);
      }
    }
  });
  