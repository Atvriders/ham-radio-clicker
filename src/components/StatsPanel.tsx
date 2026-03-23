// ============================================================
// Ham Radio Clicker — Stats Panel (Left Sidebar)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { formatNumber } from '../utils/format';
import { formatSWR } from '../utils/format';

const COLORS = {
  bg: '#0a0e1a',
  green: '#33ff33',
  amber: '#ffaa00',
  blue: '#00ccff',
  red: '#ff4444',
  panel: 'rgba(10,20,30,0.95)',
  border: 'rgba(51,255,51,0.15)',
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getSWRColor(swr: number): string {
  if (swr <= 1.5) return COLORS.green;
  if (swr <= 2.5) return COLORS.amber;
  if (swr <= 3.5) return '#ff8800';
  return COLORS.red;
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
    gap: 12,
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',
  },
  title: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 8,
    marginBottom: 4,
  },
  qsoCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.green,
    textShadow: `0 0 12px ${COLORS.green}, 0 0 24px rgba(51,255,51,0.3)`,
    textAlign: 'center' as const,
    lineHeight: 1.1,
  },
  qsoLabel: {
    fontSize: 11,
    color: COLORS.amber,
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 3,
    marginTop: 2,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    padding: '4px 0',
  },
  statLabel: {
    color: 'rgba(51,255,51,0.6)',
  },
  statValue: {
    color: COLORS.green,
    fontWeight: 'bold',
  },
  divider: {
    borderTop: `1px solid ${COLORS.border}`,
    margin: '4px 0',
  },
  eventBanner: {
    background: 'rgba(255,170,0,0.1)',
    border: `1px solid ${COLORS.amber}`,
    borderRadius: 4,
    padding: 8,
    fontSize: 12,
  },
  eventName: {
    color: COLORS.amber,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventTime: {
    color: COLORS.amber,
    opacity: 0.8,
  },
};

const StatsPanel: React.FC = () => {
  const {
    qsos,
    totalClicks,
    qsoPerClick,
    qsoPerSecond,
    swr,
    activeEvent,
    startTime,
  } = useGameStore();

  const [elapsed, setElapsed] = useState(0);
  const [eventRemaining, setEventRemaining] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
      if (activeEvent) {
        setEventRemaining(Math.max(0, activeEvent.endsAt - Date.now()));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, activeEvent]);

  const swrColor = getSWRColor(swr.current);

  return (
    <div style={styles.container}>
      <div style={styles.title}>STATION STATUS</div>

      {/* QSO Count */}
      <div style={styles.qsoCount}>{formatNumber(qsos)}</div>
      <div style={styles.qsoLabel}>Total QSOs</div>

      <div style={styles.divider} />

      {/* Rates */}
      <div style={styles.statRow}>
        <span style={styles.statLabel}>QSOs/sec</span>
        <span style={styles.statValue}>{formatNumber(qsoPerSecond)}</span>
      </div>
      <div style={styles.statRow}>
        <span style={styles.statLabel}>QSOs/click</span>
        <span style={styles.statValue}>{formatNumber(qsoPerClick)}</span>
      </div>

      <div style={styles.divider} />

      {/* SWR */}
      <div style={styles.statRow}>
        <span style={styles.statLabel}>SWR</span>
        <span
          style={{
            ...styles.statValue,
            color: swrColor,
            textShadow: swr.current > 3 ? `0 0 8px ${swrColor}` : 'none',
          }}
        >
          {formatSWR(swr.current)}
        </span>
      </div>

      {/* Equipment Status */}
      <div style={styles.statRow}>
        <span style={styles.statLabel}>Equipment</span>
        <span
          style={{
            ...styles.statValue,
            color: swr.equipmentDamaged ? COLORS.red : COLORS.green,
            animation: swr.equipmentDamaged ? 'blink 0.8s infinite' : 'none',
          }}
        >
          {swr.equipmentDamaged ? 'DAMAGED' : 'OPERATIONAL'}
        </span>
      </div>

      <div style={styles.divider} />

      {/* Clicks */}
      <div style={styles.statRow}>
        <span style={styles.statLabel}>Total Clicks</span>
        <span style={styles.statValue}>{formatNumber(totalClicks)}</span>
      </div>

      {/* Time Played */}
      <div style={styles.statRow}>
        <span style={styles.statLabel}>Time Played</span>
        <span style={styles.statValue}>{formatTime(elapsed)}</span>
      </div>

      {/* Active Event */}
      {activeEvent && eventRemaining > 0 && (
        <>
          <div style={styles.divider} />
          <div style={styles.eventBanner}>
            <div style={styles.eventName}>{activeEvent.id}</div>
            <div style={styles.eventTime}>
              {formatTime(eventRemaining)} remaining
            </div>
          </div>
        </>
      )}

      {/* Inject blink keyframes */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default StatsPanel;
