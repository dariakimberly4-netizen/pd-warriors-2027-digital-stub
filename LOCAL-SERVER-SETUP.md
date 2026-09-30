# PD Warriors 2027 — Shared Local Server Setup

This mode is for the actual event system, not a prototype.

It keeps the approved locked login design and locked Attendee Registration design. Only the data layer changes.

## What it does

One Windows laptop becomes the master database for the event.

All staff phones connect to the same hotspot / local Wi-Fi and open the address printed by the laptop, for example:

`http://192.168.137.1:8787`

Internet or mobile load is not required while the devices remain on the same local network.

Registration, QR Release, Snack, Lunch, Raffle and Admin then use the same database.

## One-time laptop preparation

1. Download or clone this repository to the Windows laptop.
2. Install the current Node.js LTS version.
3. Double-click `START-PDW-SERVER.bat`.
4. Windows Firewall may ask for permission. Allow Node.js on **Private networks**.
5. The black server window will display one or more phone addresses.
6. Keep the server window open.

No npm install is required. The server uses only built-in Node.js modules.

## Before connecting staff phones

On the laptop, open:

`http://localhost:8787`

The first device that opens the local server initializes the shared database from its current event data.

For the real event, prepare the FINAL masterlist on the Admin/laptop first before allowing staff phones to use the server.

## Staff phones

1. Connect every staff phone to the same hotspot / Wi-Fi as the laptop.
2. Turn mobile data off for the test.
3. Open the exact address shown by the server, such as `http://192.168.137.1:8787`.
4. Log in using the assigned role.
5. Each role sees only its permitted screens.

Updates are polled automatically about every 1.5 seconds.

## Shared operations

When connected to the local server:

- Check-In is stored on the laptop.
- Snack / Lunch / Raffle claims are stored on the laptop.
- Duplicate claims are decided by the laptop database.
- Companions cannot claim Raffle.
- New attendees receive IDs from the laptop so two Registration devices do not create the same ID.
- Registration edits are saved centrally.
- Raffle draw is performed centrally.
- Other connected roles receive the updated state automatically.

## If the local server temporarily disconnects

The currently open page keeps a local emergency copy.

Actions made during a temporary disconnection are saved locally and marked for synchronization. When the server becomes reachable again, the app merges those records back into the shared database.

Important: if the laptop/server is completely down, do not refresh the local-server page. A phone cannot reload `http://<laptop-ip>:8787` while the laptop is unreachable.

For a full emergency fallback, prepare the existing GitHub Pages/PWA on every phone before the event. That independent copy can still be used if the shared laptop fails, then its JSON backup can be merged later.

## Data and automatic backups

The laptop stores the shared database in:

`local-data/pdw2027-shared-state.json`

Automatic rotating backups are written to:

`local-data/backups/`

The server keeps up to approximately 60 recent automatic backup files.

Do not delete the `local-data` folder during the event.

## Event-day test

Before January 16:

1. Connect the exact laptop and staff phones to the chosen hotspot/network.
2. Start the local server.
3. Turn internet/mobile data off.
4. Check in one test Patient.
5. Confirm another phone sees the Check-In.
6. Claim Snack.
7. Confirm Lunch sees the same attendee and Snack already claimed.
8. Test a Companion at Raffle and confirm Raffle is rejected.
9. Disconnect one station briefly, make one test action, reconnect, and confirm synchronization.
10. Restart only after exporting/backing up the test data.

## Locked design rule

Do not alter the approved v17 login design or approved v21 Attendee Registration design unless the project owner explicitly requests an unlock/redesign.
