// ============================================================
// Ham Radio Clicker — PTT Button Component
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';

// Random callsign generator
const PREFIXES = [
  'W3', 'K1', 'N4', 'W6', 'KA9', 'WB2', 'K7', 'N0', 'W1', 'K5',
  'JA1', 'JA3', 'VK2', 'VK3', 'G4', 'G3', 'DL1', 'DL3', 'F5', 'I2',
  'EA4', 'UA3', 'OH2', 'SM5', 'OZ1', 'PA3', 'ON4', 'HB9', 'LU1', 'PY2',
  'VE3', 'VE7', 'ZL1', 'ZS6', 'HL1', 'BV2', 'HS1', '9V1', 'YB0',
];
const SUFFIXES = [
  'ABC', 'XYZ', 'QSO', 'DXR', 'HAM', 'CQD', 'RIG', 'ANT', 'PTT', 'VFO',
  'BPF', 'AGC', 'SSB', 'CWX', 'FMR', 'DIG', 'SAT', 'EME', 'QRP', 'QRO',
  'NR', 'TK', 'WZ', 'BN', 'JF', 'LM', 'GP', 'RA', 'SV', 'KD',
];

function randomCallsign(): string {
  const p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const s = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `${p}${s}`;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
}

let floatId = 0;

export const PTTButton: React.FC = () => {
  const click = useGameStore((s) => s.click);
  const tuneSwr = useGameStore((s) => s.tuneSwr);
  const repairEquipment = useGameStore((s) => s.repairEquipment);
  const swr = useGameStore((s) => s.swr);
  const qsoPerClick = useGameStore((s) => s.qsoPerClick);
  const transmitPower = useGameStore((s) => s.transmitPower);

  const [floats, setFloats] = useState<FloatingText[]>([]);
  const [pressed, setPressed] = useState(false);
  const [tuneCooldown, setTuneCooldown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine ring color from SWR
  const getRingColor = (swrVal: number): string => {
    if (swrVal < 1.5) return '#33ff33';
    if (swrVal < 3.0) return '#ffaa00';
    if (swrVal < 5.0) return '#ff8800';
    return '#ff4444';
  };

  const ringColor = getRingColor(swr.current);

  // Handle click
  const handleClick = useCallback(() => {
    if (swr.equipmentDamaged) return;
    click();
    const amount = Math.max(1, Math.floor(qsoPerClick));
    const callsign = randomCallsign();
    const id = ++floatId;
    const x = 60 + Math.random() * 60; // random horizontal offset (px from center area)
    setFloats((prev) => [...prev, { id, text: `+${amount} ${callsign}`, x, y: 0 }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  }, [click, qsoPerClick, swr.equipmentDamaged]);

  // Spacebar trigger
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setPressed(true);
        handleClick();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setPressed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleClick]);

  // Tune button with cooldown
  const handleTune = () => {
    if (tuneCooldown) return;
    tuneSwr();
    setTuneCooldown(true);
    setTimeout(() => setTuneCooldown(false), 3000);
  };

  // --- Styles ---
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
    userSelect: 'none',
  };

  const buttonOuter: React.CSSProperties = {
    width: '192px',
    height: '192px',
    borderRadius: '50%',
    background: `radial-gradient(circle at 40% 35%, #555 0%, #222 60%, #111 100%)`,
    boxShadow: `
      0 0 0 6px ${ringColor},
      0 0 20px ${ringColor}44,
      inset 0 2px 8px rgba(255,255,255,0.08),
      0 4px 20px rgba(0,0,0,0.6)
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: swr.equipmentDamaged ? 'not-allowed' : 'pointer',
    transition: 'transform 0.08s ease, box-shadow 0.3s ease',
    transform: pressed ? 'scale(0.94)' : 'scale(1)',
    position: 'relative',
    animation: !pressed && !swr.equipmentDamaged ? 'pttIdle 2.5s ease-in-out infinite' : undefined,
  };

  const buttonInner: React.CSSProperties = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: swr.equipmentDamaged
      ? 'radial-gradient(circle at 40% 35%, #662222 0%, #331111 60%, #220000 100%)'
      : 'radial-gradient(circle at 40% 35%, #444 0%, #1a1a1a 70%, #0d0d0d 100%)',
    border: '2px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.5), inset 0 -1px 4px rgba(255,255,255,0.04)',
  };

  const pttText: React.CSSProperties = {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '32px',
    color: swr.equipmentDamaged ? '#ff4444' : '#cccccc',
    textShadow: swr.equipmentDamaged
      ? '0 0 10px #ff4444'
      : '0 0 6px rgba(255,255,255,0.15)',
    letterSpacing: '4px',
  };

  const damagedOverlay: React.CSSProperties = {
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#ff4444',
    textShadow: '0 0 8px #ff4444',
    whiteSpace: 'nowrap',
    animation: 'blownPulse 0.8s ease-in-out infinite',
  };

  const repairBtn: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: 'bold',
    padding: '8px 20px',
    background: 'linear-gradient(180deg, #442222 0%, #221111 100%)',
    color: '#ff6666',
    border: '1px solid #ff444488',
    borderRadius: '6px',
    cursor: 'pointer',
    textShadow: '0 0 6px #ff444466',
    boxShadow: '0 0 10px rgba(255,68,68,0.15)',
    transition: 'all 0.2s ease',
  };

  const tuneBtn: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px 28px',
    background: tuneCooldown
      ? 'linear-gradient(180deg, #1a1a2a 0%, #0d0d1a 100%)'
      : 'linear-gradient(180deg, #1a2a1a 0%, #0d1a0d 100%)',
    color: tuneCooldown ? '#555555' : '#33ff33',
    border: `1px solid ${tuneCooldown ? '#333333' : '#33ff3344'}`,
    borderRadius: '6px',
    cursor: tuneCooldown ? 'not-allowed' : 'pointer',
    textShadow: tuneCooldown ? 'none' : '0 0 8px #33ff3366',
    boxShadow: tuneCooldown ? 'none' : '0 0 10px rgba(51,255,51,0.1)',
    transition: 'all 0.3s ease',
    letterSpacing: '3px',
  };

  const floatStyle = (f: FloatingText): React.CSSProperties => ({
    position: 'absolute',
    left: `${f.x}px`,
    top: '40px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#33ff33',
    textShadow: '0 0 8px #33ff33, 0 0 16px #33ff3366',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    animation: 'floatUp 1.2s ease-out forwards',
    zIndex: 10,
  });

  return (
    <div style={containerStyle} ref={containerRef}>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) translateX(-50%); }
          70% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-80px) translateX(-50%); }
        }
        @keyframes blownPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pttIdle {
          0%, 100% { box-shadow: 0 0 0 6px ${ringColor}, 0 0 20px ${ringColor}44, inset 0 2px 8px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 0 6px ${ringColor}, 0 0 30px ${ringColor}66, inset 0 2px 8px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.6); }
        }
        @keyframes tuneCooldownBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>

      {/* Floating QSO text */}
      {floats.map((f) => (
        <div key={f.id} style={floatStyle(f)}>
          {f.text}
        </div>
      ))}

      {/* Damaged warning */}
      {swr.equipmentDamaged && (
        <div style={damagedOverlay}>
          ⚠ FINALS BLOWN! ⚠
        </div>
      )}

      {/* PTT Button */}
      <div
        style={buttonOuter}
        onMouseDown={() => {
          setPressed(true);
          handleClick();
        }}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
      >
        <div style={buttonInner}>
          <span style={pttText}>
            {swr.equipmentDamaged ? '!!!' : 'PTT'}
          </span>
          {!swr.equipmentDamaged && (
            <span style={{
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#666',
              marginTop: '4px',
              letterSpacing: '1px',
            }}>
              PUSH TO TALK
            </span>
          )}
        </div>
      </div>

      {/* TX Power indicator */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: '12px',
        color: (transmitPower ?? 5) <= 5 ? '#33ff33' : (transmitPower ?? 5) <= 100 ? '#ffaa00' : '#ff4444',
        textShadow: (transmitPower ?? 5) >= 500 ? '0 0 6px #ff4444' : 'none',
        letterSpacing: '2px',
        textTransform: 'uppercase' as const,
        marginTop: '-8px',
      }}>
        TX: {transmitPower ?? 5}W{(transmitPower ?? 5) <= 5 ? ' QRP' : ''}
      </div>

      {/* Repair button when damaged */}
      {swr.equipmentDamaged && (
        <button
          style={repairBtn}
          onClick={repairEquipment}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(180deg, #553333 0%, #331a1a 100%)';
            e.currentTarget.style.color = '#ff8888';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(180deg, #442222 0%, #221111 100%)';
            e.currentTarget.style.color = '#ff6666';
          }}
        >
          REPAIR FINALS ({swr.damageRepairCost} QSOs)
        </button>
      )}

      {/* Tune button */}
      <div style={{ position: 'relative' }}>
        <button
          style={tuneBtn}
          onClick={handleTune}
          disabled={tuneCooldown}
          onMouseEnter={(e) => {
            if (!tuneCooldown) {
              e.currentTarget.style.background = 'linear-gradient(180deg, #224422 0%, #112211 100%)';
            }
          }}
          onMouseLeave={(e) => {
            if (!tuneCooldown) {
              e.currentTarget.style.background = 'linear-gradient(180deg, #1a2a1a 0%, #0d1a0d 100%)';
            }
          }}
        >
          {tuneCooldown ? 'TUNING...' : 'TUNE'}
        </button>
        {tuneCooldown && (
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '0',
            height: '3px',
            background: '#33ff33',
            borderRadius: '2px',
            animation: 'tuneCooldownBar 3s linear forwards',
            boxShadow: '0 0 6px #33ff33',
          }} />
        )}
      </div>
    </div>
  );
};

export default PTTButton;
