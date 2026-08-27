# Pariksha In Chrome

A Chrome extension (Manifest V3) that records network requests, console
logs, and clicks for a Pariksha PB, redacting sensitive data before it
ever leaves the browser. Recorded sessions upload straight into the
[Pariksha](https://github.com/Lintangeaa/pariksha) platform as structured
`RecordedSession`s the AI generators can turn into test cases and scripts.

A floating button (bottom-right of any page) opens a right-side panel
showing the live event stream while a recording is in progress, plus the
login/Workspace/PB picker and Start/Stop controls.

## Install

1. Download the latest release zip: [github.com/Lintangeaa/pariksha-in-chrome/releases/latest](https://github.com/Lintangeaa/pariksha-in-chrome/releases/latest)
2. Extract the zip to a folder.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select the extracted folder.

The Pariksha icon appears in the toolbar; click it to open/close the
recording panel on the current tab.

## Development

```bash
pnpm install
pnpm dev          # esbuild watch mode
pnpm build        # one-off production build → dist/
pnpm build:zip    # build + package dist/ into pariksha-in-chrome-v<version>.zip
pnpm test
pnpm typecheck
pnpm lint
```

`.env` (see `.env.example`) sets `PARIKSHA_BACKEND_URL`, inlined at build
time.
