# Speed Controller

<img alt="Stargazers" src="https://img.shields.io/github/stars/i-is-evil-duck/Chromium.Vid.Speed.Controler?style=for-the-badge&logo=starship&color=C9CBFF&logoColor=D9E0EE&labelColor=302D41">

## Speed Controller
Control the playback speed of any HTML5 video — from a toolbar popup, keyboard shortcuts, or per-site profiles.

> **Chromium edition.** The Firefox version is on the [`firefox`](https://github.com/i-is-evil-duck/Chromium.Vid.Speed.Controler/tree/firefox) branch and is listed on [Firefox Add-ons](https://addons.mozilla.org/en-GB/firefox/addon/universal-vid-speed-controller/).

## Features

- **Popup controls** — live speed readout, slider (0.25x-8x), step buttons, and one-click presets
- **Per-site profiles** — remember a speed for specific domains (e.g. youtube.com)
- **Global default speed** — applied to every site without a profile
- **Global on/off toggle** — disables speed control and resets videos to normal speed
- **Keyboard shortcuts** — set speed, speed up, speed down, and reset
- **Toolbar badge** — shows the current tab's speed on the extension icon
- **Live updates** — changes apply to already-open pages without a reload

## Downloads

Download the pre-built extension from the [releases](https://github.com/i-is-evil-duck/Chromium.Vid.Speed.Controler/releases) page, or load unpacked from source below.

| Platform | File |
|----------|------|
| Chromium | `chromium-vid-speed-controller.zip` |
| Firefox | `firefox` branch / [Firefox Add-ons](https://addons.mozilla.org/en-GB/firefox/addon/universal-vid-speed-controller/) |

## Installation

1. Download the repo as a ZIP and extract it, or `git clone` it.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the folder containing `manifest.json`.

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

Chrome allows at most 4 predefined shortcuts. The extra commands can be assigned at `chrome://extensions/shortcuts`.

## Configuration

From the popup header, open **Options** to:

- Set the global default speed.
- Add, edit, or delete per-site speeds (domain and casing normalization is automatic).

## Notes

- Works on any page with a `<video>` element.
- Requires a Chromium-based browser (Chrome, Edge, Brave, Opera, etc.).
- No telemetry or data collection; no permissions beyond `storage`.

## Views

<img src="https://count.getloli.com/get/@VidSpeedController?theme=rule34" />