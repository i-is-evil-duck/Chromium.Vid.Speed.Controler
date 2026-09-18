# Speed Controller

<img alt="Stargazers" src="https://img.shields.io/github/stars/i-is-evil-duck/Chromium.Vid.Speed.Controler?style=for-the-badge&logo=starship&color=C9CBFF&logoColor=D9E0EE&labelColor=302D41">

A lightweight Manifest V3 browser extension for Firefox that controls HTML5 video playback speed — from a popup, with keyboard shortcuts, or with per-site profiles.

## Features

- **Popup controls** — live speed readout, slider (0.25x-8x), step buttons, and one-click presets
- **Per-site profiles** — remember a speed for specific domains (e.g. youtube.com)
- **Global default speed** — applied to every site without a profile
- **Global on/off toggle** — disables speed control and resets videos to normal speed
- **Keyboard shortcuts** — set speed, speed up, speed down, and reset
- **Toolbar badge** — shows the current tab's speed on the extension icon
- **Live updates** — changes apply to already-open pages without a reload

## Installation

### Temporarily (for development)

1. Download the repo as a ZIP and extract it, or `git clone` it (use the `firefox` branch).
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on** and select the folder's `manifest.json`.

### Permanently

Package the extension as an `.xpi` (zip the contents of the repo and rename to `.xpi`), then drag it into Firefox, or publish it on [addons.mozilla.org](https://addons.mozilla.org).

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
- Requires Firefox 140 or later (Manifest V3).
- The `main` branch is the Chromium version of this extension.