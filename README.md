# Speed Controller

[![Stargazers](https://img.shields.io/github/stars/i-is-evil-duck/Chromium.Vid.Speed.Controler?style=for-the-badge&logo=starship&color=C9CBFF&logoColor=D9E0EE&labelColor=302D41)](https://github.com/i-is-evil-duck/Chromium.Vid.Speed.Controler) [![Firefox Add-on](https://img.shields.io/badge/Firefox%20Add--on-Download-FF7139?style=for-the-badge&logo=firefox&logoColor=white)](https://addons.mozilla.org/en-GB/firefox/addon/universal-vid-speed-controller/)

Control the playback speed of any HTML5 video — from a toolbar popup, keyboard shortcuts, or per-site profiles.

> **Firefox edition.** The Chromium version (Chrome, Edge, Brave) lives on the [`main`](https://github.com/i-is-evil-duck/Chromium.Vid.Speed.Controler/tree/main) branch.

## Features

- **Popup controls** — live speed readout, slider (0.25x-8x), step buttons, and one-click presets
- **Per-site profiles** — remember a speed for specific domains (e.g. youtube.com)
- **Global default speed** — applied to every site without a profile
- **Global on/off toggle** — disables speed control and resets videos to normal speed
- **Keyboard shortcuts** — set speed, speed up, speed down, and reset
- **Toolbar badge** — shows the current tab's speed on the extension icon
- **Live updates** — changes apply to already-open pages without a reload

## Install

- **Firefox Add-ons** — [universal-vid-speed-controller](https://addons.mozilla.org/en-GB/firefox/addon/universal-vid-speed-controller/) (bypasses the temporary-load restrictions).
- **From source (development)**:
  1. Clone or download the `firefox` branch and extract it.
  2. Open `about:debugging#/runtime/this-firefox`.
  3. Click **Load Temporary Add-on** and select the folder's `manifest.json`.

## Usage

Click the Speed Controller icon to open the popup:

- Drag the slider, or use the **+0.25 / -0.25** and preset buttons, to change the speed for the current tab instantly.
- Toggle **Remember for this site** to save the current speed for that domain.
- **Reset tab** clears the temporary override and falls back to the site or global speed.
- The **Extension enabled** switch turns speed control on or off for all sites.

Speed resolution order: **tab override > site profile > global default**.

## Keyboard shortcuts

| Shortcut     | Action                     |
| ------------ | -------------------------- |
| Ctrl+Shift+1 | Set speed to 100%          |
| Ctrl+Shift+2 | Set speed to 135%          |
| Ctrl+Shift+3 | Set speed to 200%          |
| Ctrl+Shift+4 | Set speed to 250%          |
| assignable   | Increase speed by 0.25x    |
| assignable   | Decrease speed by 0.25x    |
| assignable   | Reset to the default speed |

Firefox allows up to 4 shortcuts with defaults. The extra commands can be assigned at `about:addons` -> Extensions -> gear icon -> **Manage Extension Shortcuts**.

## Configuration

From the popup header, open **Options** to:

- Set the global default speed.
- Add, edit, or delete per-site speeds (domain and casing normalization is automatic).

## Notes

- Works on any page with a `<video>` element.
- Requires Firefox 140 or later.
- No telemetry or data collection; no permissions beyond `storage`.