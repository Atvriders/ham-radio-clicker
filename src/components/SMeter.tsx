// ============================================================
// Ham Radio Clicker -- S-Meter Component (Polished)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';

const S_LABELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', '+10', '+20', '+40', '+60'];
const S_POSITIONS = [0, 1/12, 2/12, 3/12, 4/12, 5/12, 6/12, 7/12, 8/12, 9/12, 10/12, 11/12, 1.0];

function qpsToSUnits(qps: number): number {
  if (qps <= 0) return 0;
  const logVal = Math.log10(qps + 1);
  const sUnits = logVal * 3;
  return Math.max(0, Math.min(12, sUnits));
}

function sUnitLabel(sVal: number): string {
  if (sVal <= 0) return 'S0';
  if (sVal < 8.5) {
    return `S${Math.round(Math.max(1, Math.min(9, sVal + 1)))}`;
  }
  const above = sVal - 8;
  if (above < 1.5) return 'S9';
  if (above < 2.5) return 'S9+10dB';
  if (above < 3.5) return 'S9+20dB';
  if (above < 4.5) return 'S9+40dB';
  return 'S9+60dB';
}

function sUnitToAngle(sUnit: number): number {
  const ratio = Math.max(0, Math.min(1, sUnit / 12));
  return -90 + ratio * 180;
}

export const SMeter: React.FC = () => {
  const qsoPerSecond = useGameStore((s) => s.qsoPerSecond);

  const baseSUnit = qpsToSUnits(qsoPerSecond);
  const [jitter, setJitter] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setJitter((Math.random() - 0.5) * 0.6);
    }, 150);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const displaySUnit = Math.max(0, Math.min(12, baseSUnit + jitter));
  const needleAngle = sUnitToAngle(displaySUnit);

  // SVG geometry
  const CX = 68;
  const CY = 72;
  const R = 56;
  const R_INNER = 49;

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

  function arcPath(startAngle: number, endAngle: number, radius: number): string {
    const x1 = CX + radius * Math.cos(toRad(startAngle));
    const y1 = CY + radius * Math.sin(toRad(startAngle));
    const x2 = CX + radius * Math.cos(toRad(endAngle));
    const y2 = CY + radius * Math.sin(toRad(endAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  const s9Angle = sUnitToAngle(8);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(8, 16, 24, 0.95)',
    border: '1px solid rgba(51, 255, 51, 0.2)',
    borderRadius: '6px',
    padding: '10px 12px 12px',
    width: '220px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#33ff33',
    letterSpacing: '2px',
    marginBottom: '4px',
    textShadow: '0 0 6px rgba(51,255,51,0.4)',
    textAlign: 'center',
    textTransform: 'uppercase',
  };

  const gaugeContainer: React.CSSProperties = {
    width: '100%',
    maxWidth: '200px',
    height: '112px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
  };

  const readoutStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#33ff33',
    textShadow: '0 0 8px rgba(51,255,51,0.6), 0 0 16px rgba(51,255,51,0.2)',
    marginTop: '4px',
    textAlign: 'center',
    letterSpacing: '2px',
    padding: '2px 0',
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>S METER</div>

      <div style={gaugeContainer}>
        <svg width="200" height="112" viewBox="0 0 136 76" style={{ display: 'block', margin: '0 auto' }}>
          {/* Background arc */}
          <path
            d={arcPath(-90, 90, R)}
            fill="none"
            stroke="#0a1a0a"
            strokeWidth="8"
            strokeLinecap="butt"
          />

          {/* Green phosphor arc: S1 to S9 */}
          <path
            d={arcPath(-90, s9Angle, R)}
            fill="none"
            stroke="#33ff33"
            strokeWidth="7"
            strokeLinecap="butt"
            opacity="0.35"
          />

          {/* Brighter green above S9 */}
          <path
            d={arcPath(s9Angle, 90, R)}
            fill="none"
            stroke="#33ff33"
            strokeWidth="7"
            strokeLinecap="butt"
            opacity="0.55"
          />

          {/* Scale markings */}
          {S_LABELS.map((label, i) => {
            const angle = sUnitToAngle(S_POSITIONS[i] * 12);
            const tickOuter = R + 1;
            const tickInner = R - 8;
            const labelR = R - 16;
            const x1 = CX + tickOuter * Math.cos(toRad(angle));
            const y1 = CY + tickOuter * Math.sin(toRad(angle));
            const x2 = CX + tickInner * Math.cos(toRad(angle));
            const y2 = CY + tickInner * Math.sin(toRad(angle));
            const lx = CX + labelR * Math.cos(toRad(angle));
            const ly = CY + labelR * Math.sin(toRad(angle));
            const showLabel = ['S1', 'S5', 'S9', '+20', '+60'].includes(label);
            return (
              <g key={label}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#33ff3366"
                  strokeWidth="1"
                />
                {showLabel && (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#33ff33"
                    fontSize="6"
                    fontFamily="monospace"
                    fontWeight="bold"
                    opacity="0.65"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Needle pivot */}
          <circle cx={CX} cy={CY} r="4" fill="#1a2a1a" stroke="#33ff3344" strokeWidth="1" />

          {/* Needle */}
          <line
            x1={CX}
            y1={CY}
            x2={CX + R_INNER * Math.cos(toRad(needleAngle))}
            y2={CY + R_INNER * Math.sin(toRad(needleAngle))}
            stroke="#33ff33"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              transition: 'all 0.12s linear',
              filter: 'drop-shadow(0 0 4px rgba(51, 255, 51, 0.7))',
            }}
          />

          {/* Center cap */}
          <circle cx={CX} cy={CY} r="2.5" fill="#224422" />
        </svg>
      </div>

      {/* Digital readout */}
      <div style={readoutStyle}>
        {sUnitLabel(baseSUnit)}
      </div>
    </div>
  );
};

export default SMeter;
