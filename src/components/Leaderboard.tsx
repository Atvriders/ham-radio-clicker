// ============================================================
// Ham Radio Clicker — Global Leaderboard
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  callsign: string;
  total_qsos: number;
  qso_per_second: number;
  stations_owned: number;
  achievements_count: number;
  license_class: string;
}

interface LeaderboardProps {
  currentCallsign: string;
  onClose: () => void;
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentCallsign, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // Network error — keep existing data
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30_000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>GLOBAL LEADERBOARD</h2>
          <button style={styles.closeBtn} onClick={onClose}>X</button>
        </div>
        <div style={styles.subtitle}>TOP OPERATORS WORLDWIDE</div>

        {loading ? (
          <div style={styles.loading}>LOADING...</div>
        ) : entries.length === 0 ? (
          <div style={styles.empty}>No operators on the board yet. Be the first!</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={{ ...styles.th, textAlign: 'left' }}>CALLSIGN</th>
                  <th style={styles.th}>QSOs</th>
                  <th style={styles.th}>QSO/s</th>
                  <th style={styles.th}>STN</th>
                  <th style={styles.th}>ACH</th>
                  <th style={{ ...styles.th, textAlign: 'left' }}>LICENSE</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isMe = entry.callsign === currentCallsign;
                  const rowStyle = isMe ? styles.rowHighlight : styles.row;
                  return (
                    <tr key={entry.callsign} style={rowStyle}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, textAlign: 'left', fontWeight: isMe ? 700 : 400 }}>
                        {entry.callsign}
                      </td>
                      <td style={styles.td}>{formatNum(entry.total_qsos)}</td>
                      <td style={styles.td}>{entry.qso_per_second.toFixed(1)}</td>
                      <td style={styles.td}>{entry.stations_owned}</td>
                      <td style={styles.td}>{entry.achievements_count}</td>
                      <td style={{ ...styles.td, textAlign: 'left' }}>{entry.license_class}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.footer}>Refreshes every 30 seconds</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000,
  },
  panel: {
    background: '#0d1117',
    border: '1px solid #1a3a1a',
    borderRadius: '4px',
    padding: '24px',
    maxWidth: '700px',
    width: '95%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 30px rgba(51,255,51,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '3px',
    color: '#33ff33',
    textShadow: '0 0 8px rgba(51,255,51,0.6)',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid #33ff33',
    color: '#33ff33',
    fontSize: '14px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '4px 10px',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '10px',
    letterSpacing: '3px',
    color: '#556655',
    marginBottom: '16px',
    marginTop: '4px',
  },
  loading: {
    color: '#33ff33',
    textAlign: 'center',
    padding: '32px',
    letterSpacing: '3px',
  },
  empty: {
    color: '#88aa88',
    textAlign: 'center',
    padding: '32px',
    fontSize: '12px',
    letterSpacing: '1px',
  },
  tableWrap: {
    overflowY: 'auto',
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    padding: '6px 8px',
    textAlign: 'right',
    color: '#88aa88',
    borderBottom: '1px solid #1a3a1a',
    fontSize: '10px',
    letterSpacing: '1px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '5px 8px',
    textAlign: 'right',
    color: '#33ff33',
    borderBottom: '1px solid #0a1a0a',
    whiteSpace: 'nowrap',
  },
  row: {
    background: 'transparent',
  },
  rowHighlight: {
    background: 'rgba(51, 255, 51, 0.08)',
    boxShadow: 'inset 0 0 10px rgba(51,255,51,0.05)',
  },
  footer: {
    marginTop: '12px',
    fontSize: '9px',
    color: '#334433',
    letterSpacing: '2px',
    textAlign: 'center',
  },
};

export default Leaderboard;
