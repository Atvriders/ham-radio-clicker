// ============================================================
// Ham Radio Clicker -- PTT Button Component (Compact)
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { randomLocalCallsign, randomDomesticDxCallsign, randomWorldwideCallsign, randomMursName } from '../data/events';

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
  const upgrades = useGameStore((s) => s.upgrades);
  const hasTech = upgrades.includes('technician_license');
  const hasGeneral = upgrades.includes('general_license');
  const hasExtra = upgrades.includes('extra_class_license');

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

    // Pick random item from array
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    // Power category tag
    const pwr = transmitPower ?? 5;
    const pwrTag = pwr <= 5 ? 'QRP' : pwr <= 100 ? 'LP' : 'HP';

    let band: string;
    let contactName: string;
    if (!hasTech) {
      band = pick(['MURS']);
      contactName = randomMursName();
    } else if (!hasGeneral) {
      band = pick(['2m', '70cm', '6m']);
      contactName = randomLocalCallsign();
    } else if (!hasExtra) {
      band = pick(['2m', '70cm', '6m', '20m', '40m', '15m', '10m', '80m']);
      contactName = ['2m', '70cm', '6m'].includes(band) ? randomLocalCallsign() : randomDomesticDxCallsign();
    } else {
      band = pick(['2m', '70cm', '6m', '20m', '40m', '15m', '10m', '80m', '160m', '30m', '17m', '12m', '60m']);
      contactName = ['2m', '70cm', '6m'].includes(band) ? randomLocalCallsign() : randomWorldwideCallsign();
    }

    const id = ++floatId;
    const x = 40 + Math.random() * 60;
    setFloats((prev) => [...prev, { id, text: `+${amount} [${band} ${pwrTag}] ${contactName}`, x, y: 0 }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  }, [click, qsoPerClick, swr.equipmentDamaged, hasTech, hasGeneral, hasExtra]);

  // Spacebar trigger
  useEffect(() => {
    const isTyping = () => {
      const tag = document.activeElement?.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA';
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isTyping()) {
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
    gap: '6px',
    position: 'relative',
    userSelect: 'none',
    padding: '8px 12px',
    minWidth: '220px',
    overflow: 'hidden',
  };

  const buttonOuter: React.CSSProperties = {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: `radial-gradient(circle at 40% 35%, #555 0%, #222 60%, #111 100%)`,
    boxShadow: `
      0 0 0 4px ${ringColor},
      0 0 14px ${ringColor}44,
      inset 0 2px 8px rgba(255,255,255,0.08),
      0 4px 16px rgba(0,0,0,0.6)
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
    width: '140px',
    height: '140px',
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
    letterSpacing: '3px',
  };

  const damagedOverlay: React.CSSProperties = {
    position: 'absolute',
    top: '-24px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#ff4444',
    textShadow: '0 0 8px #ff4444',
    whiteSpace: 'nowrap',
    animation: 'blownPulse 0.8s ease-in-out infinite',
  };

  const repairBtn: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '4px 12px',
    background: 'linear-gradient(180deg, #442222 0%, #221111 100%)',
    color: '#ff6666',
    border: '1px solid #ff444488',
    borderRadius: '4px',
    cursor: 'pointer',
    textShadow: '0 0 6px #ff444466',
    boxShadow: '0 0 10px rgba(255,68,68,0.15)',
    transition: 'all 0.2s ease',
  };

  const tuneBtn: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: 'bold',
    padding: '6px 20px',
    background: tuneCooldown
      ? 'linear-gradient(180deg, #1a1a2a 0%, #0d0d1a 100%)'
      : 'linear-gradient(180deg, #1a2a1a 0%, #0d1a0d 100%)',
    color: tuneCooldown ? '#555555' : '#33ff33',
    border: `1px solid ${tuneCooldown ? '#333333' : '#33ff3344'}`,
    borderRadius: '4px',
    cursor: tuneCooldown ? 'not-allowed' : 'pointer',
    textShadow: tuneCooldown ? 'none' : '0 0 8px #33ff3366',
    boxShadow: tuneCooldown ? 'none' : '0 0 10px rgba(51,255,51,0.1)',
    transition: 'all 0.3s ease',
    letterSpacing: '2px',
  };

  const floatStyle = (f: FloatingText): React.CSSProperties => ({
    position: 'absolute',
    left: `${f.x}px`,
    top: '20px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '13px',
    color: '#33ff33',
    textShadow: '0 0 8px #33ff33, 0 0 16px #33ff3366',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    animation: 'floatUp 1.2s ease-out forwards',
    zIndex: 10,
  });

  const txPower = transmitPower ?? 5;

  return (
    <div style={containerStyle} ref={containerRef}>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) translateX(-50%); }
          70% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-60px) translateX(-50%); }
        }
        @keyframes blownPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pttIdle {
          0%, 100% { box-shadow: 0 0 0 4px ${ringColor}, 0 0 14px ${ringColor}44, inset 0 2px 8px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.6); }
          50% { box-shadow: 0 0 0 4px ${ringColor}, 0 0 24px ${ringColor}66, inset 0 2px 8px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.6); }
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
          FINALS BLOWN!
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
              fontSize: '12px',
              color: hasTech ? '#666' : '#aa8800',
              marginTop: '3px',
              letterSpacing: '2px',
            }}>
              {hasTech ? 'HAM' : 'MURS'}
            </span>
          )}
        </div>
      </div>

      {/* TX Power + Tune row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: '13px',
          color: txPower <= 5 ? '#33ff33' : txPower <= 100 ? '#ffaa00' : '#ff4444',
          textShadow: txPower >= 500 ? '0 0 6px #ff4444' : 'none',
          letterSpacing: '1px',
        }}>
          TX:{txPower}W{txPower <= 5 ? ' QRP' : ''}
        </span>
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
          REPAIR ({swr.damageRepairCost} QSOs)
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
            bottom: '-4px',
            left: '0',
            height: '2px',
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
