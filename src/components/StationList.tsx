// ============================================================
// Ham Radio Clicker — Station List (Owned Stations)
// ============================================================

import React from 'react';
import { useGameStore } from '../stores/useGameStore';
import { stations } from '../data/stations';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  panel: 'rgba(10,20,30,0.95)',
  border: 'rgba(51,255,51,0.15)',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: 16,
    fontFamily: 'monospace',
    color: COLORS.green,
    overflow: 'auto',
  },
  title: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 8,
    marginBottom: 8,
  },
  emptyMsg: {
    color: 'rgba(51,255,51,0.4)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center' as const,
    padding: '16px 0',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '5px 0',
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: 13,
  },
  icon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  name: {
    flex: 1,
    color: COLORS.green,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  count: {
    color: COLORS.amber,
    fontWeight: 'bold',
    flexShrink: 0,
  },
  qps: {
    color: 'rgba(51,255,51,0.5)',
    fontSize: 11,
    flexShrink: 0,
    minWidth: 60,
    textAlign: 'right' as const,
  },
};

const StationList: React.FC = () => {
  const ownedStations = useGameStore((s) => s.stations);

  const owned = stations
    .filter((st) => (ownedStations[st.id] ?? 0) > 0)
    .sort((a, b) => a.tier - b.tier);

  return (
    <div style={styles.container}>
      <div style={styles.title}>YOUR STATIONS</div>

      {owned.length === 0 ? (
        <div style={styles.emptyMsg}>No stations yet</div>
      ) : (
        owned.map((st) => {
          const count = ownedStations[st.id] ?? 0;
          const totalQps = +(st.baseQps * count).toFixed(1);
          return (
            <div key={st.id} style={styles.row}>
              <span style={styles.icon}>{st.icon}</span>
              <span style={styles.name}>{st.name}</span>
              <span style={styles.count}>&times;{count}</span>
              <span style={styles.qps}>{totalQps} QPS</span>
            </div>
          );
        })
      )}
    </div>
  );
};

export default StationList;
