# Ham Radio Clicker

**[https://clicker.hamclock-reborn.org](https://clicker.hamclock-reborn.org/)**

An idle/clicker game for ham radio operators and aspiring ones. Start on MURS/FRS talking to random people with no license, earn your Technician ticket, then climb the ladder through General to Extra Class -- all while managing your SWR, dodging solar flares, upgrading your station, and prestiging for multipliers. Click PTT, buy gear, make QSOs, repeat.

---

## Core Mechanics

- **MURS/FRS Start** -- Begin on MURS (CH1-CH5) and FRS (CH1-CH22) with no license. Contacts are random first names (Mike, Karen, Steve...).
- **License Progression** -- Buy Technician, General, and Extra Class licenses to unlock ham radio callsigns, HF bands, DX contacts, and higher-tier gear.
- **PTT Clicking** -- Click the PTT button to make contacts. Each click earns QSOs based on click power, multipliers, and SWR penalty.
- **Passive QPS** -- Stations you own generate QSOs per second automatically.
- **SWR Management** -- Your antenna's Standing Wave Ratio drifts over time. High SWR reduces output. Above 10.0, you blow your finals. Tune manually or buy an auto-tuner.
- **Transmit Power** -- Start at QRP 5W, progress through 8 power levels up to the FCC legal maximum of 1500W.
- **Prestige System** -- Reset your progress for a permanent QSO earnings multiplier that stacks with every prestige level.

---

## License Progression

| License | Cost | Effect | Contacts | Unlocks |
|---------|------|--------|----------|---------|
| **None** | -- | -- | MURS/FRS random names | Handheld, Mobile Rig |
| **Technician** | 50 QSOs | QPS x1.2 | US VHF/UHF callsigns (WB9ABC, N3QSO) | Repeater access, entry-level upgrades, 9 VHF/UHF/microwave bands |
| **General** | 5,000 QSOs | QPS x1.5 | US + common DX (VE, G, DL, JA, VK...) | HF privileges, Base Station, Beam, POTA/SOTA, 9 HF bands |
| **Extra Class** | 50,000 QSOs | 3x click power | Full worldwide DX (ZL, PY, HS, A6, ZS...) | All band segments, Tower, Remote, EME, Contest Station |

---

## Stations (12)

| # | Station | QPS | Cost | License |
|---|---------|-----|------|---------|
| 1 | Handheld (HT) | 0.1 | 15 | -- |
| 2 | Mobile Rig | 0.5 | 100 | -- |
| 3 | Base Station | 2 | 500 | General |
| 4 | Linear Amplifier | 8 | 2,500 | General |
| 5 | Beam Antenna | 30 | 10,000 | General |
| 6 | Tower + SteppIR | 120 | 50,000 | Extra |
| 7 | Remote Station | 400 | 200,000 | Extra |
| 8 | EME (Moonbounce) | 2,200 | 1,000,000 | Extra |
| 9 | Contest Super Station | 11,000 | 5,000,000 | Extra |
| 10 | DXCC Honor Roll Station | 55,000 | 25,000,000 | Extra |
| 11 | Satellite Ground Station | 220,000 | 100,000,000 | Extra |
| 12 | Deep Space Network | 1,100,000 | 500,000,000 | Extra |

Each station can be purchased multiple times. Cost increases by 15% per unit owned.

---

## Shop Categories (10 tabs, 82 upgrades total)

### RADIOS -- 12 stations
See the station table above. From a 5-watt HT to a planetary-scale antenna array.

### ANTENNAS -- 7 upgrades
Rubber Duck, J-Pole, Yagi, Hex Beam, Log Periodic, Stacked Array, Dipole Farm. QPS multipliers from x1.1 to x3.0.

### AMPS -- 13 upgrades
8 power levels (10W through 1500W FCC legal max) plus QRP Kit, Mobile Amplifier, Desktop Amplifier, Legal Limit Amplifier, and LDMOS Solid-State Amp. QPS and click multipliers stacking up to x7.0.

### MODES -- 13 upgrades
FM Repeater, SSB, CW, FT8, CW Keyer, FT4, WSPR, VarAC, JS8Call, RTTY, SSTV, Winlink, Packet Radio. QPS and click multipliers from x1.1 to x3.0.

### BANDS -- 18 upgrades
**Technician (9 bands):** 2m, 70cm, 6m, 10m, 23cm, 13cm, 9cm, 5cm, 3cm. VHF/UHF plus microwave bands up to 10 GHz.
**General (9 bands):** 15m, 20m, 40m, 80m, 160m, 60m, 30m, 17m, 12m. Full HF access.
QPS multipliers from x1.1 to x2.0.

### GEAR -- 15 upgrades
Better Coax, Antenna Analyzer, Manual Tuner, Auto-Tuner (LDG), DX Cluster, QSL Card Printer, LoTW Account, Hardline Coax, Propagation Prediction Software, Remote Auto-Tuner, Contest Logger (N1MM+), SDR Panadapter, Dummy Load, Repeater Access, Galactic Repeater.

### ACTIVITIES -- 8 upgrades
Weekly Rag Chew Net, ARES/RACES Emergency Comms, POTA Activation, SOTA Activation, Field Day Station, DXpedition, IOTA Activation, Satellite Operations.

### EVENTS -- 5 upgrades
Coffee Boost (2x click/30s), Propagation Report (3x QPS/20s), Contest Weekend (5x QPS/30s), Band Opening (10x QPS/15s), DXpedition Pileup (+1000 QSOs instant). Consumable temporary boosts.

### AWARDS
Achievement showcase with progress tracking.

### PRESTIGE
Reset for permanent multiplier. See Prestige System below.

---

## Prestige System

Reset your progress for a permanent earnings multiplier.

- **Cost formula:** `100 * 2^level` total QSOs required (100, 200, 400, 800...)
- **Multiplier formula:** `1 + (level * 0.5)` -- so level 1 = 1.5x, level 2 = 2.0x, level 3 = 2.5x, etc.
- **Keeps:** Licenses, achievements, total QSOs, callsign, prestige stats
- **Resets:** Current QSOs, all non-license upgrades, stations, SWR, transmit power

---

## Achievements (24)

| Achievement | Condition |
|-------------|-----------|
| First QSO | 1 total QSO |
| Technician | 50 QSOs |
| Ragchewer | 100 QSOs |
| Worked All States | 1,000 QSOs |
| General Class | 5,000 QSOs |
| Silent Key Memorial | 7,500 QSOs |
| DXCC | 10,000 QSOs |
| POTA Hunter | 25,000 QSOs |
| 5 Band DXCC | 50,000 QSOs |
| Extra Class Operator | 50,000 QSOs |
| Honor Roll | 100,000 QSOs |
| DX Chaser | 150,000 QSOs |
| Kilowatt Club | 175,000 QSOs |
| Extra Class | 200,000 QSOs |
| Contester | 500,000 QSOs |
| Maximum Legal Power | 750,000 QSOs |
| Field Day Champion | 1,000,000 QSOs |
| QRP Hero | 2,000 QSOs |
| Rubber Duck | Own 10 Handhelds |
| QRO | Own 5 Linear Amplifiers |
| Elmer | Own one of every station type |
| Worked All Bands | Own one of every station type (hidden) |
| Finals Blown! | Blow your finals |
| Lid | SWR above 7.0 (hidden) |
| SWR Nightmare | SWR above 9.0 (hidden) |

---

## Random Events (19)

Events fire every 30-90 seconds.

**Positive:** Solar Flare (3x QPS), 6 Meter Opening (10x QPS), Sporadic E Opening (5x QPS), ARRL Field Day (4x QPS), Contest Weekend (5x QPS), POTA Pileup (3x QPS), QSO Party Weekend (2x click), Rare DX Spotted (+500 QSOs), DXpedition Spotted (+1000 QSOs), Packet Radio Revival (+200 QSOs), Hamfest Bargain (50% off), Antenna Raising Party (SWR reduction)

**Negative:** Thunderstorm (SWR spike), Antenna Icing (SWR spike), Power Outage (no passive), Propagation Blackout (no passive), QRM Interference (0.5x click), Neighbor Complains About TVI (0.5x click), Repeater Kerchunker (0.3x click)

---

## Login and Identity

Log in with your callsign or any username. No password, no email. Your identity is stored in localStorage and synced to the server for cloud saves and leaderboard tracking. New players are auto-registered; returning operators get their game state restored.

## Global Leaderboard

Top 50 operators ranked by total QSOs, QPS, stations owned, achievements, and license class. Live online/offline indicators with green pulse dots. Refreshes every 30 seconds.

## Live Chat

WebSocket-based ephemeral chat between online operators. Messages are temporary -- not stored on the server, lost on page reload. Shows who is online with green indicators.

## QSO Log

Real-time log with license-based band, mode, and power tags:

- **No license:** `[MURS CH3 QRP] Contact with Mike (+1.0)` or `[FRS CH14 QRP] Contact with Steve (+1.0)`
- **Technician:** `[2m FM QRP] VHF QSO with WB9ABC (+1.0)`
- **General:** `[20m FT8 HP] QSO with DL5ABC (+1.0)`
- **Extra:** `[17m CW HP] DX QSO with ZL2QSO (+1.0)`

## Saving

- Auto-save every 30 seconds
- Cloud save synced on login and periodically
- localStorage fallback when server is unreachable
- Manual save button in the header

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Zustand |
| Build | Vite 5 |
| Backend | Express 4, better-sqlite3 |
| Database | SQLite (WAL mode) |
| Realtime | WebSocket (chat + leaderboard), requestAnimationFrame game loop |

## Quick Start

```bash
git clone https://github.com/Atvriders/ham-radio-clicker.git
cd ham-radio-clicker
npm install
npm run dev
```

Vite dev server on `http://localhost:3012` with API proxy to Express backend on port 3011.

### Production Build

```bash
npm run build
npm start
```

Builds frontend to `dist/` and serves from Express on port 3011.

## Docker Deployment

Pre-built multi-arch images (amd64, arm64, armv7) from GitHub Container Registry.

```yaml
# docker-compose.yml
services:
  hamclicker:
    image: ghcr.io/atvriders/ham-radio-clicker:latest
    ports:
      - "3011:3011"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
docker compose up -d          # Start
docker compose pull && docker compose up -d  # Update
docker logs -f hamclicker     # Logs
docker compose down           # Stop
```

## Mobile Support

Fully responsive with tabbed mobile interface (Play, Stats, Shop, Log) and bottom navigation bar. Touch-friendly PTT button. Works on any screen size.

---

## Project Structure

```
ham-radio-clicker/
  server/
    index.js            Express + SQLite + WebSocket server
  src/
    components/
      PTTButton.tsx     Main click target with floating callsigns
      SWRMeter.tsx      Animated SVG SWR gauge
      SMeter.tsx        Signal strength meter
      StatsPanel.tsx    Station status with live stats
      StationList.tsx   Owned stations with QPS bars
      Shop.tsx          Equipment rack (10 tabs: stations/upgrades/achievements/prestige)
      EventLog.tsx      QSO log with band/mode info
      EventPopup.tsx    Random event notifications
      Chat.tsx          WebSocket ephemeral chat
      Login.tsx         Callsign/username login
      Leaderboard.tsx   Global rankings with online status
    data/
      stations.ts       12 station definitions
      upgrades.ts       82 upgrades across 10 categories
      achievements.ts   24 achievement definitions
      events.ts         19 random events + callsign generators
    hooks/
      useGameLoop.ts    requestAnimationFrame game loop
    stores/
      useGameStore.ts   Zustand state (SWR, physics, prestige, save/load)
    types/
      index.ts          TypeScript type definitions
    utils/
      format.ts         Number/SWR/time formatting
  data/
    hamclicker.db       SQLite database (auto-created)
```

---

73 de Ham Radio Clicker

*Built with [Claude Code](https://claude.ai/claude-code)*
