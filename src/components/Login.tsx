// ============================================================
// Ham Radio Clicker — Login Screen
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';

interface LoginProps {
  onLogin: (callsign: string, isNew: boolean) => void;
}

const CALLSIGN_KEY = 'ham-radio-clicker-callsign';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [callsign, setCallsign] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const doLogin = useCallback(async (cs: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callsign: cs }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem(CALLSIGN_KEY, data.callsign);
      onLogin(data.callsign, data.isNew);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      setLoading(false);
    }
  }, [onLogin]);

  // Auto-login if callsign exists in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CALLSIGN_KEY);
    if (saved) {
      doLogin(saved);
    } else {
      setLoading(false);
    }
  }, [doLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = callsign.trim();
    if (!trimmed) {
      setError('Enter your callsign');
      return;
    }
    doLogin(trimmed);
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.scanlineOverlay} />
        <div style={styles.container}>
          <div style={styles.loadingText}>CONNECTING...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.scanlineOverlay} />
      <div style={styles.container}>
        <h1 style={styles.title}>HAM RADIO CLICKER</h1>
        <div style={styles.subtitle}>OPERATOR LOGIN</div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>ENTER YOUR CALLSIGN OR USERNAME</label>
          <input
            type="text"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value.toUpperCase())}
            placeholder="W1AW"
            style={styles.input}
            autoFocus
            maxLength={15}
          />

          <div style={styles.altHint}>
            No callsign? Use any name or username
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>
            LOG IN
          </button>
        </form>

        <div style={styles.hint}>
          Your callsign or username is your identity. No password needed.
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    background: '#0d1117',
    border: '1px solid #1a3a1a',
    borderRadius: '4px',
    boxShadow: '0 0 30px rgba(51,255,51,0.1)',
    maxWidth: '400px',
    width: '90%',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '3px',
    color: '#33ff33',
    textShadow: '0 0 8px rgba(51,255,51,0.6), 0 0 20px rgba(51,255,51,0.3)',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '12px',
    letterSpacing: '4px',
    color: '#88aa88',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  label: {
    fontSize: '11px',
    letterSpacing: '2px',
    color: '#88aa88',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#0a0e1a',
    border: '1px solid #33ff33',
    color: '#33ff33',
    fontSize: '20px',
    fontFamily: 'inherit',
    letterSpacing: '4px',
    textAlign: 'center',
    textTransform: 'uppercase',
    outline: 'none',
    boxSizing: 'border-box',
  },
  altHint: {
    fontSize: '10px',
    color: '#ffaa00',
    letterSpacing: '1px',
    opacity: 0.7,
  },
  error: {
    color: '#cc4444',
    fontSize: '12px',
    letterSpacing: '1px',
  },
  button: {
    padding: '10px 32px',
    background: '#1a2a1a',
    border: '1px solid #33ff33',
    color: '#33ff33',
    fontSize: '14px',
    fontFamily: 'inherit',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.2s',
  },
  hint: {
    marginTop: '24px',
    fontSize: '10px',
    color: '#556655',
    letterSpacing: '1px',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: '16px',
    color: '#33ff33',
    letterSpacing: '4px',
    textShadow: '0 0 8px rgba(51,255,51,0.6)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

export default Login;
