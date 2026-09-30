# PD Warriors Philippines — GET TOGETHER 2027 Offline Digital Stub

GitHub-ready offline-first PWA for attendee QR passes, Snack/Lunch/Raffle claiming, duplicate prevention, lost-QR recovery, raffle eligibility, and multi-device backup/merge.

## Demo staff accounts
- Gen / `PDW2027!`
- Bot / `PDW2027!`
- Kim / `PDW2027!`

> These are demo-only credentials stored in front-end code. Replace with a stronger authentication model before production use.

## Rules
- Patient / PD Warrior: Snack ✓ Lunch ✓ Raffle ✓
- Companion: Snack ✓ Lunch ✓ Raffle ✕
- One person = one unique QR
- One claim per entitlement
- Companions are excluded from the raffle automatically

## Offline use
1. Publish on GitHub Pages over HTTPS.
2. Open the site once while online.
3. Install / Add to Home Screen.
4. Open it once after installation.
5. Test in airplane mode before event day.

QR generation uses QRCode.js. The service worker attempts to cache it during installation so passes remain available offline after the first successful online load.

## Multi-device offline workflow
Each station can run independently. Export JSON from Snack, Lunch, Registration, etc. Import those JSON files into the Admin device; the app merges checked-in status, earliest claim timestamps, audit logs, and raffle winners.

## GitHub Pages
Upload all files to the repository root, then enable **Settings → Pages → Deploy from branch → main / root**.
