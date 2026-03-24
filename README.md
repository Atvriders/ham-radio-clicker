# Ham Radio Clicker

**[https://clicker.hamclock-reborn.org](https://clicker.hamclock-reborn.org/)**

**Click your way from a rubber duck antenna to a Deep Space Network.**

An idle/clicker game for ham radio operators (and aspiring ones). Start as a MURS user talking to random people, earn your Technician License, then climb the ladder to Extra Class while managing your SWR, dodging solar flares, and trying not to blow your finals.

---

## How It Works

You start on **MURS** (Multi-Use Radio Service) — no license needed. Click the PTT button to talk to random people (Mike, Steve, Karen...). Once you earn enough to buy your **Technician License**, you enter the world of amateur radio and start making real QSOs with callsigns.

**Click the PTT button** to make contacts manually. Buy stations to generate QSOs passively. Spend your QSOs as currency to buy upgrades, new equipment, and higher power levels. Progress through three license classes to unlock bigger and better gear.

### Core Mechanics

- **MURS → Ham Radio** -- Start on MURS (no license). Buy a Technician License to start making ham radio QSOs with real callsigns.
- **PTT Button** -- Click to transmit and make contacts. Each click earns QSOs based on your click power and upgrades.
- **Passive QSO Generation** -- Stations you own produce QSOs per second automatically.
- **SWR Management** -- Your antenna's Standing Wave Ratio drifts over time. High SWR reduces your output. Let it climb above 10.0 and you blow your finals (ouch). Tune it manually, or buy an auto-tuner.
- **Transmit Power Progression** -- Start at QRP 5W and work your way up to the FCC legal maximum of 1500W.

### License Progression

| License | Cost | Effect | Contacts | Unlocks |
|---------|------|--------|----------|---------|
| **None** | -- | -- | MURS (random names: Mike, Karen...) | Handheld, Mobile Rig |
| **Technician** | 50 QSOs | QPS x1.2 | US local VHF/UHF callsigns (WB9ABC, N3QSO) | Repeater access, entry-level upgrades, power to 50W |
| **General** | 5,000 QSOs | QPS x1.5 | US + common DX (VE, G, DL, JA, VK...) | HF privileges, Base Station, Linear Amp, Beam, POTA/SOTA, power to 500W |
| **Extra Class** | 50,000 QSOs | 3x click | Full worldwide DX (ZL, PY, HS, A6, ZS...) | All bands, Tower, Remote, EME, Contest Station, power to 1500W |

---

## Stations

12 stations to collect, from humble beginnings to intergalactic ambitions:

| # | Station | QPS | Cost | License |
|---|---------|-----|------|---------|
| 1 | Handheld (HT) | 0.1 | 15 | -- |
| 2 | Mobile Rig | 0.5 | 100 | -- |
| 3 | Base Station | 2 | 500 | General |
| 4 | Linear Amplifier | 8 | 2,500 | General |
| 5 | Beam Antenna | 25 | 10,000 | General |
| 6 | Tower + SteppIR | 80 | 50,000 | Extra |
| 7 | Remote Station | 250 | 200,000 | Extra |
| 8 | EME (Moonbounce) | 800 | 1,000,000 | Extra |
| 9 | Contest Super Station | 2,500 | 5,000,000 | Extra |
| 10 | DXCC Honor Roll Station | 8,000 | 25,000,000 | Extra |
| 11 | Satellite Ground Station | 25,000 | 100,000,000 | Extra |
| 12 | Deep Space Network | 100,000 | 500,000,000 | Extra |

Each station can be purchased multiple times. Costs increase by 15% per unit owned.

---

## Upgrades

36+ upgrades across several categories:

**Licenses** -- Technician (unlocks ham radio), General (unlocks HF), Extra Class (unlocks all bands)

**Equipment** -- Better Coax, Antenna Analyzer, Manual Tuner, Auto-Tuner (LDG), Remote Auto-Tuner, FT8 Mode, DX Cluster, QSL Card Printer, LoTW Account, Hardline Coax, Propagation Prediction Software, Contest Logger (N1MM+), SDR Panadapter, Dummy Load, CW Keyer, Repeater Access, Galactic Repeater

**Operating Activities** -- Weekly Rag Chew Net, ARES/RACES Emergency Comms, POTA Activation, SOTA Activation, Field Day Station, DXpedition, IOTA Activation, Satellite Operations

**Power Levels** -- 10W → 25W → 50W → 100W → 200W → 500W → 1000W → 1500W (sequential chain, 100W requires General, 1000W requires Extra)

---

## Achievements

25 achievements to unlock, including:

- **First QSO** -- Make your very first contact
- **Ragchewer** -- 100 total QSOs
- **Worked All States** -- 1,000 total QSOs
- **DXCC** -- 10,000 total QSOs
- **Field Day Champion** -- 1,000,000 total QSOs
- **Rubber Duck** -- Own 10 Handheld radios
- **QRO** -- Own 5 Linear Amplifiers
- **Elmer** -- Own at least one of every station type
- **SWR Nightmare** -- Survive an SWR above 9.0 (hidden)
- **Finals Blown!** -- Blow your finals for the first time
- **Maximum Legal Power** -- Unlock the 1500W power upgrade

Some achievements are hidden until you earn them. Keep playing.

---

## Random Events

Events fire every 30-90 seconds and can help or hurt your operation:

**Good news:** Solar Flare (3x QPS), 6 Meter Opening (10x QPS), Rare DX Spotted (+500 QSOs), Hamfest Bargain (50% off), ARRL Field Day (4x QPS), Contest Weekend (5x QPS), QSO Party Weekend (2x click power)

**Bad news:** Thunderstorm (SWR spike), Power Outage (no passive income), QRM Interference (halved clicks), Neighbor Complains About TVI, Propagation Blackout, Repeater Kerchunker, Antenna Icing

---

## Login & Identity

Log in with your callsign or any username. No password, no email — just your identity. Your callsign is stored in localStorage and synced to the server for cloud saves and leaderboard tracking.

No callsign? No problem — use any name or username. New player? You're automatically registered. Returning operator? Your game state is restored from the server.

## Global Leaderboard

Compete with operators worldwide. The leaderboard tracks:
- Total QSOs
- QSOs per second
- Stations owned
- Achievements unlocked
- License class

Top 50 operators displayed, refreshed every 30 seconds.

## Saving

- **Auto-save** every 30 seconds
- **Cloud save** to the server (synced on login and periodically)
- **localStorage fallback** when the server is unreachable
- Manual save button in the header

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Zustand (state management) |
| Build | Vite 5 |
| Backend | Express 4, better-sqlite3 |
| Database | SQLite (WAL mode) |
| Realtime | requestAnimationFrame game loop |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Atvriders/ham-radio-clicker.git
cd ham-radio-clicker

# Install dependencies
npm install

# Start development (frontend + backend concurrently)
npm run dev
```

The Vite dev server runs on `http://localhost:3012` with API proxy to the Express backend on port 3011.

### Production Build

```bash
npm run build
npm start
```

This builds the frontend to `dist/` and serves everything from the Express server on port 3011.

## Docker Deployment

Pre-built multi-arch images (amd64, arm64, armv7) available from GitHub Container Registry.

```bash
# Quick start with docker-compose
git clone https://github.com/Atvriders/ham-radio-clicker.git
cd ham-radio-clicker
docker compose up -d
```

Open `http://localhost:3011` in your browser.

### docker-compose.yml

```yaml
services:
  hamclicker:
    image: ghcr.io/atvriders/ham-radio-clicker:latest
    ports:
      - "3011:3011"
    volumes:
      - ./data:/app/data   # SQLite persistence
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Docker Commands

```bash
# View logs
docker logs -f hamclicker

# Update to latest
docker compose pull && docker compose up -d

# Stop
docker compose down

# Build locally instead of pulling
docker build -t ham-radio-clicker .
docker run -d -p 3011:3011 -v ./data:/app/data ham-radio-clicker
```

## Mobile Support

Fully responsive with a tabbed mobile interface (Play, Stats, Shop, Log) and a bottom navigation bar. Touch-friendly PTT button. Works on any screen size.

---

## Project Structure

```
ham-radio-clicker/
  server/
    index.js            Express + SQLite backend
  src/
    components/         React UI components
    data/
      stations.ts       12 station definitions
      upgrades.ts       30+ upgrade definitions
      achievements.ts   25 achievement definitions
      events.ts         18 random event definitions
    hooks/
      useGameLoop.ts    requestAnimationFrame game loop
    stores/
      useGameStore.ts   Zustand state management
    types/
      index.ts          TypeScript type definitions
    utils/
      format.ts         Number formatting
  data/
    hamclicker.db       SQLite database (auto-created)
```

---

73 de Ham Radio Clicker

*Built with [Claude Code](https://claude.ai/claude-code)*
