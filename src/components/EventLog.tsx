// ============================================================
// Ham Radio Clicker — Event Log (Scrolling Terminal)
// ============================================================

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { EventLogEntry } from '../types';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  blue: '#00ccff',
  red: '#ff4444',
  panel: 'rgba(10,20,30,0.95)',
  border: 'rgba(51,255,51,0.15)',
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

const FLAVOR_MESSAGES = [
  'CQ CQ CQ de W1AW K',
  'Band noise: S3',
  '73 de K5ZD',
  'QRM on 20 meters...',
  'Checking propagation on 40m',
  'VFO drift compensated',
  'AGC holding steady',
  'Monitoring 14.074 MHz',
  'PSK31 waterfall looks clean',
  'Band opening on 15m!',
  'QSB fading on signal',
  'CW keyer speed: 25 WPM',
  'Antenna SWR looks good',
  'Calling CQ on 7.055',
  'DX cluster spot received',
  'Rig temperature nominal',
  'Checking 6m for sporadic E',
  'QRT for dinner... just kidding',
  'Logbook updated',
  'Tuning across the band...',
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
    borderRadius: 8,
    padding: 16,
    fontFamily: 'monospace',
    color: COLORS.green,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    borderBottom: `2px solid ${COLORS.green}`,
    paddingBottom: 8,
    marginBottom: 8,
  },
  logArea: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  entry: {
    fontSize: 11,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap' as const,
  },
  timestamp: {
    color: 'rgba(51,255,51,0.4)',
    marginRight: 6,
  },
};

const EventLog: React.FC = () => {
  const eventLog = useGameStore((s) => s.eventLog);
  const addLogEntry = useGameStore((s) => s.addLogEntry);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        FLAVOR_MESSAGES[Math.floor(Math.random() * FLAVOR_MESSAGES.length)];
      if (addLogEntry) {
        addLogEntry(msg, 'event');
      }
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [addLogEntry]);

  const visible = eventLog.slice(-20);

  return (
    <div style={styles.container}>
      <div style={styles.title}>QSO LOG</div>
      <div style={styles.logArea} ref={scrollRef}>
        {visible.map((entry: EventLogEntry, i: number) => {
          const age = visible.length - i;
          const opacity = Math.max(0.4, 1 - age * 0.03);
          const typeColor = TYPE_COLORS[entry.type] ?? COLORS.green;

          return (
            <div key={entry.id} style={{ ...styles.entry, opacity }}>
              <span style={styles.timestamp}>
                [{formatTimestamp(entry.timestamp)}]
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
