# Notification sounds

Drop a short notification tone here as `notification.mp3`.

## Constraints

- Filename **must** be `notification.mp3` (referenced from `components/NotificationWatcher.tsx`).
- Keep the file under ~50 KB for fast load.
- Duration ~0.3–0.6 seconds works best (anything longer feels jarring on burst events).
- License should be CC0 / public domain to avoid attribution debt.

## Suggested sources

- https://freesound.org/ — filter by "License: Creative Commons 0".
- https://mixkit.co/free-sound-effects/notification/ — free for personal & commercial use.
- Generate your own with any audio tool (Audacity export → MP3, 128 kbps mono is plenty).

## Behavior

The sound plays on every persistent notification (everything except `*_PROCESSING`). Volume is fixed at `0.4`. Browser autoplay policy may block the first sound until the user interacts with the page — this is handled silently in the watcher.

Users can disable the sound globally in **Settings → Notifications → "Notification sound"**.
