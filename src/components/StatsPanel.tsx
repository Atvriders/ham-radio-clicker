// ============================================================
// Ham Radio Clicker -- Stats Panel (Left Sidebar - Polished)
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
  panel: 'rgba(8,16,24,0.95)',
  border: 'rgba(51,255,51,0.2)',
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

function getBandFromUpgrades(upgrades: string[]): string {
  const hasExtra = upgrades.includes('extra_class_license');
  const hasGeneral = upgrades.includes('general_license');
  const hasTech = upgrades.includes('technician_license');
  if (hasExtra) return '160m-70cm';
  if (hasGeneral) return '80m-2m';
  if (hasTech) return '6m/2m/70cm';
  return 'MURS';
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '10px 12px',
    fontFamily: 'monospace',
    color: COLORS.green,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    boxSizing: 'border-box',
    overflow: 'auto',
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 6,
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleLabel: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.4)',
    letterSpacing: 1,
  },
  qsoCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.green,
    textShadow: `0 0 12px ${COLORS.green}, 0 0 24px rgba(51,255,51,0.3)`,
    textAlign: 'center' as const,
    lineHeight: 1.1,
    padding: '4px 0 2px',
  },
  qsoLabel: {
    fontSize: 9,
    color: COLORS.amber,
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginTop: 0,
    marginBottom: 4,
  },
  section: {
    padding: '6px 0',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11,
    padding: '3px 0',
    lineHeight: 1.4,
  },
  statLabel: {
    color: 'rgba(51,255,51,0.5)',
    fontSize: 10,
  },
  statValue: {
    color: COLORS.green,
    fontWeight: 'bold',
    fontSize: 11,
  },
  divider: {
    borderTop: `1px solid rgba(51,255,51,0.1)`,
    margin: '4px 0',
  },
  sessionTimer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    padding: '5px 0',
    borderTop: `1px solid rgba(51,255,51,0.1)`,
    marginTop: 4,
  },
  sessionLabel: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  sessionValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blue,
    textShadow: '0 0 6px rgba(0,204,255,0.3)',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  eventBanner: {
    background: 'rgba(255,170,0,0.08)',
    border: `1px solid ${COLORS.amber}44`,
    borderRadius: 3,
    padding: '4px 6px',
    fontSize: 10,
  },
  eventName: {
    color: COLORS.amber,
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 10,
  },
  eventTime: {
    color: COLORS.amber,
    opacity: 0.8,
    fontSize: 10,
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
    transmitPower,
    upgrades,
    achievements,
    eventLog,
  } = useGameStore();

  const hasLicense = upgrades.includes('technician_license');
  const currentBand = getBandFromUpgrades(upgrades);

  const [elapsed, setElapsed] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [eventRemaining, setEventRemaining] = useState(0);
  const [sessionStart] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
      setSessionElapsed(Date.now() - sessionStart);
      if (activeEvent) {
        setEventRemaining(Math.max(0, activeEvent.endsAt - Date.now()));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, activeEvent, sessionStart]);

  const swrColor = getSWRColor(swr.current);

  // Find last QSO contact from event log
  const lastQso = eventLog.find((e) => e.type === 'qso');
  const lastContact = lastQso ? lastQso.message.replace(/^.*\]\s*/, '').substring(0, 20) : '---';

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        STATION STATUS
        <span style={styles.titleLabel}>// PANEL A</span>
      </div>

      {/* QSO Count - Prominent */}
      <div style={styles.qsoCount}>{formatNumber(qsos)}</div>
      <div style={styles.qsoLabel}>Total QSOs</div>

      <div style={styles.divider} />

      {/* Mode & Band section */}
      <div style={styles.section}>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>MODE</span>
          <span
            style={{
              ...styles.statValue,
              color: hasLicense ? COLORS.green : COLORS.amber,
              fontSize: 10,
            }}
          >
            {hasLicense ? 'AMATEUR' : 'MURS'}
          </span>
        </div>

        <div style={styles.statRow}>
          <span style={styles.statLabel}>BAND</span>
          <span style={{ ...styles.statValue, color: COLORS.blue, fontSize: 10 }}>
            {currentBand}
          </span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Rates section */}
      <div style={styles.section}>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>QSOs/sec</span>
          <span style={styles.statValue}>{formatNumber(qsoPerSecond)}</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>QSOs/click</span>
          <span style={styles.statValue}>{formatNumber(qsoPerClick)}</span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Equipment section */}
      <div style={styles.section}>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>SWR</span>
          <span
            style={{
              ...styles.statValue,
              color: swrColor,
              textShadow: swr.current > 3 ? `0 0 6px ${swrColor}` : 'none',
            }}
          >
            {formatSWR(swr.current)}
          </span>
        </div>

        <div style={styles.statRow}>
          <span style={styles.statLabel}>EQUIP</span>
          <span
            style={{
              ...styles.statValue,
              color: swr.equipmentDamaged ? COLORS.red : COLORS.green,
              animation: swr.equipmentDamaged ? 'blink 0.8s infinite' : 'none',
              fontSize: 10,
            }}
          >
            {swr.equipmentDamaged ? 'DAMAGED' : 'OK'}
          </span>
        </div>

        <div style={styles.statRow}>
          <span style={styles.statLabel}>TX PWR</span>
          <span
            style={{
              ...styles.statValue,
              color: (transmitPower ?? 5) <= 5
                ? COLORS.green
                : (transmitPower ?? 5) <= 100
                  ? COLORS.amber
                  : COLORS.red,
              fontSize: 10,
            }}
          >
            {(transmitPower ?? 5)}W
            {(transmitPower ?? 5) <= 5 ? ' (QRP)' : (transmitPower ?? 5) <= 100 ? ' (LP)' : (transmitPower ?? 5) >= 1500 ? ' (HP MAX)' : ' (HP)'}
          </span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Activity section */}
      <div style={styles.section}>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>LAST QSO</span>
          <span style={{ ...styles.statValue, color: COLORS.amber, fontSize: 9, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lastContact}
          </span>
        </div>

        <div style={styles.statRow}>
          <span style={styles.statLabel}>CLICKS</span>
          <span style={styles.statValue}>{formatNumber(totalClicks)}</span>
        </div>

        <div style={styles.statRow}>
          <span style={styles.statLabel}>ON AIR</span>
          <span style={{ ...styles.statValue, color: COLORS.blue }}>{formatTime(elapsed)}</span>
        </div>

        <div style={styles.statRow}>
          <span style={styles.statLabel}>AWARDS</span>
          <span style={{
            ...styles.statValue,
            color: '#ffd700',
            textShadow: achievements.length > 0 ? '0 0 6px rgba(255,215,0,0.4)' : 'none',
          }}>
            {achievements.length}
          </span>
        </div>
      </div>

      {/* Session Timer */}
      <div style={styles.sessionTimer}>
        <span style={styles.sessionLabel}>SHIFT</span>
        <span style={styles.sessionValue}>{formatTime(sessionElapsed)}</span>
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
