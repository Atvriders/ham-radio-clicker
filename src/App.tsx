import React, { useCallback } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './stores/useGameStore';
import StatsPanel from './components/StatsPanel';
import StationList from './components/StationList';
import PTTButton from './components/PTTButton';
import SWRMeter from './components/SWRMeter';
import SMeter from './components/SMeter';
import EventLog from './components/EventLog';
import Shop from './components/Shop';
import EventPopup from './components/EventPopup';
import { formatNumber } from './utils/format';

const App: React.FC = () => {
  useGameLoop();

  const qsos = useGameStore((s) => s.qsos);
  const qsoPerSecond = useGameStore((s) => s.qsoPerSecond);
  const save = useGameStore((s) => s.save);
  const reset = useGameStore((s) => s.reset);

  const handleSave = useCallback(() => {
    save();
  }, [save]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      reset();
    }
  }, [reset]);

  return (
    <div style={styles.wrapper}>
      {/* CRT Scanline Overlay */}
      <div style={styles.scanlineOverlay} />

      {/* Top Bar */}
      <header style={styles.topBar}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>HAM RADIO CLICKER</h1>
        </div>
        <div style={styles.statsBlock}>
          <span style={styles.statItem}>
            QSOs: <strong style={styles.statValue}>{formatNumber(qsos)}</strong>
          </span>
          <span style={styles.statItem}>
            QSO/s: <strong style={styles.statValue}>{qsoPerSecond.toFixed(1)}</strong>
          </span>
        </div>
        <div style={styles.actionBlock}>
          <button style={styles.headerBtn} onClick={handleSave}>SAVE</button>
          <button style={{ ...styles.headerBtn, ...styles.resetBtn }} onClick={handleReset}>RESET</button>
        </div>
      </header>

      {/* Main Three-Column Layout */}
      <main style={styles.main}>
        {/* Left Column */}
        <aside style={styles.leftCol}>
          <StatsPanel />
          <StationList />
        </aside>

        {/* Center Column */}
        <section style={styles.centerCol}>
          <PTTButton />
          <SWRMeter />
          <SMeter />
          <EventLog />
        </section>

        {/* Right Column */}
        <aside style={styles.rightCol}>
          <Shop />
        </aside>
      </main>

      {/* Event Popup Overlay */}
      <EventPopup />

      <style>{`
        @media (max-width: 900px) {
          main {
            flex-direction: column !important;
          }
          main > aside,
          main > section {
            width: 100% !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: 1px solid #1a2a1a;
          }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1520 50%, #0a0e1a 100%)',
  },
  scanlineOverlay: {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
    opacity: 0.5,
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px', background: '#0d1117',
    borderBottom: '1px solid #1a3a1a', zIndex: 10, flexShrink: 0,
  },
  titleBlock: { display: 'flex', alignItems: 'center', gap: '8px' },
  title: {
    margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '3px',
    color: '#33ff33',
    textShadow: '0 0 8px rgba(51,255,51,0.6), 0 0 20px rgba(51,255,51,0.3)',
  },
  statsBlock: { display: 'flex', gap: '24px', alignItems: 'center' },
  statItem: { fontSize: '13px', color: '#88aa88', letterSpacing: '1px' },
  statValue: { color: '#33ff33', fontSize: '15px', textShadow: '0 0 6px rgba(51,255,51,0.4)' },
  actionBlock: { display: 'flex', gap: '8px' },
  headerBtn: {
    padding: '4px 14px', background: '#1a2a1a', border: '1px solid #33ff33',
    color: '#33ff33', fontSize: '11px', fontFamily: 'inherit',
    letterSpacing: '2px', textTransform: 'uppercase' as const, cursor: 'pointer',
  },
  resetBtn: { borderColor: '#cc4444', color: '#cc4444', background: '#2a1a1a' },
  main: { display: 'flex', flex: 1, overflow: 'hidden' },
  leftCol: {
    width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column',
    gap: '8px', padding: '8px', overflowY: 'auto', borderRight: '1px solid #1a2a1a',
  },
  centerCol: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '12px', padding: '12px', overflowY: 'auto',
  },
  rightCol: {
    width: '360px', flexShrink: 0, display: 'flex', flexDirection: 'column',
    padding: '8px', overflowY: 'auto', borderLeft: '1px solid #1a2a1a',
  },
};

export default App;
