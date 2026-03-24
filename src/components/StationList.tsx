// ============================================================
// Ham Radio Clicker -- Station List (Compact with QPS bars)
// ============================================================

import React from 'react';
import { useGameStore } from '../stores/useGameStore';
import { stations } from '../data/stations';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  panel: 'rgba(8,16,24,0.95)',
  border: 'rgba(51,255,51,0.2)',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '8px 10px',
    fontFamily: 'monospace',
    color: COLORS.green,
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 4,
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleLabel: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.4)',
    letterSpacing: 1,
  },
  emptyMsg: {
    color: 'rgba(51,255,51,0.4)',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center' as const,
    padding: '8px 0',
  },
  row: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 1,
    padding: '3px 0',
    borderBottom: `1px solid rgba(51,255,51,0.08)`,
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
  },
  icon: {
    fontSize: 12,
    width: 18,
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  name: {
    flex: 1,
    color: COLORS.green,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 10,
  },
  count: {
    color: COLORS.amber,
    fontWeight: 'bold',
    flexShrink: 0,
    fontSize: 10,
  },
  qps: {
    color: 'rgba(51,255,51,0.5)',
    fontSize: 9,
    flexShrink: 0,
    minWidth: 50,
    textAlign: 'right' as const,
  },
  barTrack: {
    height: 2,
    background: 'rgba(51,255,51,0.08)',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 1,
  },
};

const StationList: React.FC = () => {
  const ownedStations = useGameStore((s) => s.stations);
  const qsoPerSecond = useGameStore((s) => s.qsoPerSecond);

  const owned = stations
    .filter((st) => (ownedStations[st.id] ?? 0) > 0)
    .sort((a, b) => a.tier - b.tier);

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        YOUR STATIONS
        <span style={styles.titleLabel}>// {owned.length} active</span>
      </div>

      {owned.length === 0 ? (
        <div style={styles.emptyMsg}>No stations yet</div>
      ) : (
        owned.map((st) => {
          const count = ownedStations[st.id] ?? 0;
          const totalQps = +(st.baseQps * count).toFixed(1);
          const pct = qsoPerSecond > 0 ? (totalQps / qsoPerSecond) * 100 : 0;
          return (
            <div key={st.id} style={styles.row}>
              <div style={styles.rowTop}>
                <span style={styles.icon}>{st.icon}</span>
                <span style={styles.name}>{st.name}</span>
                <span style={styles.count}>x{count}</span>
                <span style={styles.qps}>{totalQps} q/s</span>
              </div>
              {/* QPS contribution bar */}
              <div style={styles.barTrack}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, pct)}%`,
                  background: pct > 50 ? COLORS.green : pct > 20 ? COLORS.amber : 'rgba(51,255,51,0.4)',
                  borderRadius: 1,
                  boxShadow: pct > 50 ? `0 0 4px ${COLORS.green}` : 'none',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default StationList;
