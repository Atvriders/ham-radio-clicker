import React, { useCallback, useState, useEffect } from 'react';
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
import QuizStrip from './components/QuizStrip';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';
import Chat from './components/Chat';
import { formatNumber } from './utils/format';

const MOBILE_BREAKPOINT = 900;
const CALLSIGN_KEY = 'ham-radio-clicker-callsign';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

type MobileTab = 'play' | 'stats' | 'shop' | 'log';

const TABS: { key: MobileTab; icon: string; label: string }[] = [
  { key: 'play', icon: '\u{1F4E1}', label: 'Play' },
  { key: 'stats', icon: '\u{1F4CA}', label: 'Stats' },
  { key: 'shop', icon: '\u{1F6D2}', label: 'Shop' },
  { key: 'log', icon: '\u{1F4DC}', label: 'Log' },
];

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<string | null>(() => localStorage.getItem(CALLSIGN_KEY));
  const [loginMessage, setLoginMessage] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Only run game loop when logged in
  if (loggedIn) {
    return <GameApp
      callsign={loggedIn}
      loginMessage={loginMessage}
      showLeaderboard={showLeaderboard}
      setShowLeaderboard={setShowLeaderboard}
      onLogout={() => {
        localStorage.removeItem(CALLSIGN_KEY);
        localStorage.removeItem('ham-radio-clicker-save');
        useGameStore.getState().reset();
        setLoggedIn(null);
        setLoginMessage('');
      }}
    />;
  }

  return (
    <Login onLogin={(callsign, isNew) => {
      setLoggedIn(callsign);
      setLoginMessage(isNew ? `New operator ${callsign} registered!` : `Welcome back, ${callsign}!`);
    }} />
  );
};

interface GameAppProps {
  callsign: string;
  loginMessage: string;
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  onLogout: () => void;
}

const GameApp: React.FC<GameAppProps> = ({ callsign, loginMessage, showLeaderboard, setShowLeaderboard, onLogout }) => {
  useGameLoop();

  const qsos = useGameStore((s) => s.qsos);
  const qsoPerSecond = useGameStore((s) => s.qsoPerSecond);

  const save = useGameStore((s) => s.save);
  const reset = useGameStore((s) => s.reset);
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<MobileTab>('play');
  const [showWelcome, setShowWelcome] = useState(!!loginMessage);

  // Auto-dismiss welcome message
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const handleSave = useCallback(() => {
    save();
  }, [save]);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      reset();
    }
  }, [reset]);

  // Mobile layout
  if (isMobile) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.scanlineOverlay} />

        {showWelcome && loginMessage && (
          <div style={styles.welcomeBanner}>{loginMessage}</div>
        )}

        {/* Top Bar -- mobile stacked */}
        <header style={styles.topBarMobile} className="mobile-topbar">
          <div style={styles.titleBlockMobile} className="title-block">
            <h1 style={styles.titleMobile}>HAM RADIO CLICKER</h1>
          </div>
          <div style={styles.statsBlockMobile} className="stats-block">
            <span style={styles.statItem}>
              QSOs: <strong style={styles.statValue}>{formatNumber(qsos)}</strong>
            </span>
            <span style={styles.statItem}>
              QSO/s: <strong style={styles.statValue}>{qsoPerSecond.toFixed(1)}</strong>
            </span>
          </div>
          <div style={styles.callsignBlockMobile}>
            <span style={styles.callsignLabel}>{callsign}</span>
          </div>
          <div style={styles.actionBlockMobile} className="action-block">
            <button style={styles.headerBtn} onClick={handleSave}>SAVE</button>
            <button style={styles.headerBtn} onClick={() => setShowLeaderboard(true)}>LB</button>
            <button style={{ ...styles.headerBtn, ...styles.logoutBtn }} onClick={onLogout}>OUT</button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="mobile-content" style={styles.mobileContent}>
          {activeTab === 'play' && (
            <section style={styles.mobileSection}>
              <PTTButton />
              <SWRMeter />
              <SMeter />
            </section>
          )}
          {activeTab === 'stats' && (
            <section style={styles.mobileSection}>
              <StatsPanel />
              <StationList />
            </section>
          )}
          {activeTab === 'shop' && (
            <section style={styles.mobileSection}>
              <Shop />
            </section>
          )}
          {activeTab === 'log' && (
            <section style={styles.mobileSection}>
              <EventLog />
            </section>
          )}
        </div>

        {/* Bottom Tab Bar */}
        <nav className="mobile-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`mobile-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="mobile-tab-icon">{tab.icon}</span>
              <span className="mobile-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <EventPopup />
        {showLeaderboard && (
          <Leaderboard currentCallsign={callsign} onClose={() => setShowLeaderboard(false)} />
        )}
        <Chat callsign={callsign} isMobile={true} />
      </div>
    );
  }

  // Desktop layout — 3 columns
  return (
    <div style={styles.wrapper}>
      {/* CRT Scanline Overlay */}
      <div style={styles.scanlineOverlay} />

      {showWelcome && loginMessage && (
        <div style={styles.welcomeBanner}>{loginMessage}</div>
      )}

      {/* Top Bar — full width */}
      <header style={styles.topBar}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>HAM RADIO CLICKER</h1>
        </div>
        <div style={styles.statsBlock}>
          <span style={styles.statItem}>
            QSOs: <strong style={styles.statValue}>{formatNumber(qsos)}</strong>
          </span>
          <span style={styles.statDivider} />
          <span style={styles.statItem}>
            QSO/s: <strong style={styles.statValue}>{qsoPerSecond.toFixed(1)}</strong>
          </span>
        </div>
        <div style={styles.actionBlock}>
          <span style={styles.callsignLabel}>{callsign}</span>
          <button style={styles.headerBtn} onClick={handleSave}>SAVE</button>
          <button style={styles.headerBtn} onClick={() => setShowLeaderboard(true)}>LEADERBOARD</button>
          <button style={{ ...styles.headerBtn, ...styles.logoutBtn }} onClick={onLogout}>LOG OUT</button>
          <button style={{ ...styles.headerBtn, ...styles.resetBtn }} onClick={handleReset}>RESET</button>
        </div>
      </header>

      {/* Main Three-Column Layout */}
      <main style={styles.main}>
        {/* LEFT column: StatsPanel + StationList */}
        <aside style={styles.leftCol}>
          <StatsPanel />
          <StationList />
        </aside>

        {/* CENTER column: Instruments + EventPopup + EventLog */}
        <section style={styles.centerCol}>
          {/* Row 1: PTT + Meters side by side */}
          <div style={styles.centerInstrumentRow}>
            <PTTButton />
            <SWRMeter />
            <SMeter />
          </div>
          {/* Quiz Strip */}
          <QuizStrip />
          {/* Inline EventPopup (when active) */}
          <EventPopup inline />
          {/* EventLog fills remaining space */}
          <div style={styles.centerLogArea}>
            <EventLog />
          </div>
        </section>

        {/* RIGHT column: Shop */}
        <aside style={styles.rightCol}>
          <Shop />
        </aside>
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard currentCallsign={callsign} onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Chat */}
      <Chat callsign={callsign} />
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

  // Welcome banner
  welcomeBanner: {
    position: 'fixed',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #0d1117 0%, #111822 100%)',
    border: '1px solid #33ff33',
    color: '#33ff33',
    padding: '10px 28px',
    fontSize: '13px',
    letterSpacing: '2px',
    zIndex: 6000,
    textShadow: '0 0 6px rgba(51,255,51,0.4)',
    boxShadow: '0 0 20px rgba(51,255,51,0.15), inset 0 0 30px rgba(51,255,51,0.03)',
    whiteSpace: 'nowrap',
    borderRadius: '4px',
  },

  // Callsign display
  callsignLabel: {
    color: '#ffcc00',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px',
    textShadow: '0 0 6px rgba(255,204,0,0.4)',
    padding: '2px 8px',
    background: 'rgba(255,204,0,0.06)',
    borderRadius: '3px',
    border: '1px solid rgba(255,204,0,0.15)',
  },

  // Desktop top bar
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '4px 12px',
    height: '36px',
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #111822 0%, #0d1117 100%)',
    borderBottom: '1px solid #1a3a1a', zIndex: 10, flexShrink: 0,
    flexWrap: 'wrap', gap: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  titleBlock: { display: 'flex', alignItems: 'center', gap: '8px' },
  title: {
    margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '3px',
    color: '#33ff33',
    textShadow: '0 0 8px rgba(51,255,51,0.6), 0 0 20px rgba(51,255,51,0.3)',
  },
  statsBlock: { display: 'flex', gap: '20px', alignItems: 'center' },
  statItem: { fontSize: '12px', color: '#88aa88', letterSpacing: '1px' },
  statValue: { color: '#33ff33', fontSize: '14px', textShadow: '0 0 6px rgba(51,255,51,0.4)' },
  statDivider: {
    width: '1px',
    height: '16px',
    background: 'rgba(51,255,51,0.2)',
  },
  actionBlock: { display: 'flex', gap: '6px', alignItems: 'center' },
  headerBtn: {
    padding: '4px 14px', background: 'linear-gradient(180deg, #1e2e1e 0%, #1a2a1a 100%)',
    border: '1px solid #33ff33',
    color: '#33ff33', fontSize: '10px', fontFamily: 'inherit',
    letterSpacing: '2px', textTransform: 'uppercase' as const, cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.2s ease',
  },
  resetBtn: {
    borderColor: '#cc4444', color: '#cc4444',
    background: 'linear-gradient(180deg, #2a1a1a 0%, #221515 100%)',
  },
  logoutBtn: {
    borderColor: '#aa8833', color: '#aa8833',
    background: 'linear-gradient(180deg, #2a2a1a 0%, #222215 100%)',
  },

  // Desktop 3-column layout
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftCol: {
    width: '240px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '2px',
    overflowY: 'auto',
    borderRight: '1px solid rgba(51,255,51,0.1)',
    background: 'rgba(0,0,0,0.15)',
  },
  centerCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '2px',
    overflow: 'hidden',
    minWidth: 0,
  },
  centerInstrumentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '4px',
    flexShrink: 0,
    flexWrap: 'wrap',
    padding: '2px 0',
  },
  centerLogArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: '150px',
  },
  rightCol: {
    width: '380px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '2px',
    overflowY: 'auto',
    borderLeft: '1px solid rgba(51,255,51,0.1)',
    background: 'rgba(0,0,0,0.15)',
  },

  // Mobile top bar
  topBarMobile: {
    position: 'relative',
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
    padding: '6px 10px',
    background: 'linear-gradient(180deg, #111822 0%, #0d1117 100%)',
    borderBottom: '1px solid #1a3a1a', zIndex: 10, flexShrink: 0,
    gap: '2px',
  },
  titleBlockMobile: {
    width: '100%', display: 'flex', justifyContent: 'center',
  },
  titleMobile: {
    margin: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '2px',
    color: '#33ff33',
    textShadow: '0 0 8px rgba(51,255,51,0.6), 0 0 20px rgba(51,255,51,0.3)',
  },
  statsBlockMobile: {
    width: '100%', display: 'flex', justifyContent: 'center', gap: '12px',
  },
  callsignBlockMobile: {
    width: '100%', display: 'flex', justifyContent: 'center',
  },
  actionBlockMobile: {
    position: 'absolute' as const, right: '8px', top: '6px',
    display: 'flex', gap: '4px',
  },

  // Mobile content
  mobileContent: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '56px',
  },
  mobileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 8px',
    width: '100%',
  },
};

export default App;
