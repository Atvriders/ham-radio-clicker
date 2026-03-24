// ============================================================
// Ham Radio Clicker -- Event Log (Fills center column - Polished)
// ============================================================

import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { EventLogEntry } from '../types';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  blue: '#00ccff',
  red: '#ff4444',
  panel: 'rgba(8,16,24,0.95)',
  border: 'rgba(51,255,51,0.2)',
};

const TYPE_COLORS: Record<string, string> = {
  qso: COLORS.green,
  event: COLORS.amber,
  purchase: COLORS.blue,
  swr: '#ffcc00',
  achievement: '#ffd700',
  damage: COLORS.red,
  milestone: '#ffd700',
  warning: COLORS.red,
};

// Flavor messages split by license level
const MURS_FLAVOR = [
  'Scanning MURS channels...',
  'Radio check, radio check',
  'Charging batteries...',
  'Testing the antenna',
  'Listening on channel 3',
];

const TECH_FLAVOR = [
  'Your signal is 59 into the repeater',
  'Checking 6m for sporadic E',
  'VFO drift compensated',
  'AGC holding steady',
  'QSB fading on signal',
  'Antenna SWR looks good',
  'Rig temperature nominal',
  'Logbook updated',
  'Tuning across the band...',
  'QRT for dinner... just kidding',
  'Time to check the SWR on that new antenna',
];

const GENERAL_FLAVOR = [
  'CQ CQ CQ de W1AW K',
  'Band noise: S3',
  '73 de K5ZD',
  'QRM on 20 meters...',
  'Checking propagation on 40m',
  'Monitoring 14.074 MHz',
  'PSK31 waterfall looks clean',
  'Band opening on 15m!',
  'CW keyer speed: 25 WPM',
  'Calling CQ on 7.055',
  'DX cluster spot received',
  'QRZ? QRZ? de W1AW',
  'The pileup on 20m is insane right now',
  'Checking into the net on 7.290...',
  'Copy, you\'re 5 by 9 into Omaha. QSL?',
  '73 and good DX!',
  'Heard a new DXCC entity on 15m!',
  'Band is dead... switching to 40m',
  'Someone\'s splatter is 10 kHz wide',
];

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '6px 8px',
    fontFamily: 'monospace',
    color: COLORS.green,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    minHeight: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${COLORS.green}66`,
    paddingBottom: 4,
    marginBottom: 4,
    flexShrink: 0,
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    textShadow: `0 0 6px rgba(51,255,51,0.3)`,
  },
  entryCount: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.4)',
    letterSpacing: 1,
  },
  clearBtn: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: 'rgba(51,255,51,0.35)',
    background: 'transparent',
    border: '1px solid rgba(51,255,51,0.15)',
    borderRadius: 2,
    padding: '1px 6px',
    cursor: 'pointer',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    transition: 'all 0.2s ease',
  },
  logArea: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minHeight: 0,
  },
  entry: {
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
    padding: '1px 4px',
    borderRadius: 2,
  },
  entryEven: {
    background: 'rgba(51,255,51,0.015)',
  },
  entryOdd: {
    background: 'transparent',
  },
  timestamp: {
    color: 'rgba(51,255,51,0.3)',
    marginRight: 4,
    fontSize: 9,
    letterSpacing: 0.5,
  },
};

const EventLog: React.FC = () => {
  const eventLog = useGameStore((s) => s.eventLog);
  const addLogEntry = useGameStore((s) => s.addLogEntry);
  const clearEventLog = useGameStore((s) => s.clearEventLog);
  const upgrades = useGameStore((s) => s.upgrades);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build flavor messages based on license level
  const hasTech = upgrades.includes('technician_license');
  const hasGeneral = upgrades.includes('general_license');

  let flavorPool: string[];
  if (!hasTech) {
    flavorPool = MURS_FLAVOR;
  } else if (!hasGeneral) {
    flavorPool = [...MURS_FLAVOR, ...TECH_FLAVOR];
  } else {
    flavorPool = [...TECH_FLAVOR, ...GENERAL_FLAVOR];
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventLog]);

  // Periodic flavor messages
  useEffect(() => {
    const interval = setInterval(() => {
      const msg =
        flavorPool[Math.floor(Math.random() * flavorPool.length)];
      if (addLogEntry) {
        addLogEntry(msg, 'event');
      }
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [addLogEntry]);

  const handleClear = useCallback(() => {
    clearEventLog();
  }, [clearEventLog]);

  const visible = eventLog.slice(0, 30).reverse();

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div style={styles.titleLeft}>
          <span style={styles.title}>QSO LOG</span>
          <span style={styles.entryCount}>{eventLog.length} entries</span>
        </div>
        <button
          style={styles.clearBtn}
          onClick={handleClear}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(51,255,51,0.7)';
            e.currentTarget.style.borderColor = 'rgba(51,255,51,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(51,255,51,0.35)';
            e.currentTarget.style.borderColor = 'rgba(51,255,51,0.15)';
          }}
        >
          CLR
        </button>
      </div>
      <div style={styles.logArea} ref={scrollRef}>
        {visible.map((entry: EventLogEntry, i: number) => {
          const age = visible.length - i;
          const opacity = Math.max(0.4, 1 - age * 0.02);
          const typeColor = TYPE_COLORS[entry.type] ?? COLORS.green;
          const isEven = i % 2 === 0;

          return (
            <div key={entry.id} style={{
              ...styles.entry,
              ...(isEven ? styles.entryEven : styles.entryOdd),
              opacity,
            }}>
              <span style={styles.timestamp}>
                {formatTimestamp(entry.timestamp)}
              </span>
              <span style={{ color: typeColor }}>{entry.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventLog;
