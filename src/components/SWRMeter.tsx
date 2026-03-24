// ============================================================
// Ham Radio Clicker -- SWR Meter Component (Polished)
// ============================================================

import React from 'react';
import { useGameStore } from '../stores/useGameStore';

// Map SWR value (1.0 - 10.0) to needle angle (-90 to +90)
function swrToAngle(swr: number): number {
  const clamped = Math.max(1, Math.min(10, swr));
  const ratio = Math.log10(clamped) / Math.log10(10);
  return -90 + ratio * 180;
}

const SCALE_MARKS: { value: number; label: string }[] = [
  { value: 1.0, label: '1.0' },
  { value: 1.5, label: '1.5' },
  { value: 2.0, label: '2' },
  { value: 3.0, label: '3' },
  { value: 5.0, label: '5' },
  { value: 10.0, label: '10' },
];

export const SWRMeter: React.FC = () => {
  const swrCurrent = useGameStore((s) => s.swr.current);
  const upgrades = useGameStore((s) => s.upgrades);
  const hasAnalyzer = upgrades.includes('antenna_analyzer');

  const needleAngle = swrToAngle(swrCurrent);
  const isWarning = swrCurrent > 3.0;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(8, 16, 24, 0.95)',
    border: '1px solid rgba(51, 255, 51, 0.2)',
    borderRadius: '6px',
    padding: '8px',
    width: '180px',
    boxSizing: 'border-box',
    boxShadow: '0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '9px',
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
    height: 'auto',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
  };

  const readoutStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '14px',
    fontWeight: 'bold',
    color: hasAnalyzer
      ? (swrCurrent > 5 ? '#ff4444' : swrCurrent > 3 ? '#ffaa00' : '#33ff33')
      : '#555555',
    textShadow: hasAnalyzer
      ? `0 0 8px ${swrCurrent > 5 ? '#ff444488' : swrCurrent > 3 ? '#ffaa0088' : '#33ff3388'}`
      : 'none',
    marginTop: '4px',
    textAlign: 'center',
    letterSpacing: '2px',
    padding: '2px 0',
  };

  const warningStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ff4444',
    marginTop: '4px',
    animation: 'warningGlow 1.2s ease-in-out infinite',
    textAlign: 'center',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  };

  const noAnalyzerStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#666',
    marginTop: '2px',
    textAlign: 'center',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };

  // Color zone arcs
  const greenStart = swrToAngle(1.0);
  const greenEnd = swrToAngle(1.5);
  const yellowEnd = swrToAngle(3.0);
  const orangeEnd = swrToAngle(5.0);
  const redEnd = swrToAngle(10.0);

  function arcPath(startAngle: number, endAngle: number, radius: number, cx: number, cy: number): string {
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(toRad(startAngle));
    const y1 = cy + radius * Math.sin(toRad(startAngle));
    const x2 = cx + radius * Math.cos(toRad(endAngle));
    const y2 = cy + radius * Math.sin(toRad(endAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  const CX = 74;
  const CY = 78;
  const R = 62;
  const R_INNER = 54;

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes swrWarningFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      <div style={titleStyle}>SWR METER</div>

      <div style={gaugeContainer}>
        <svg width="100%" viewBox="0 0 148 82" style={{ display: 'block' }}>
          {/* Background arc */}
          <path
            d={arcPath(-90, 90, R, CX, CY)}
            fill="none"
            stroke="#1a1a2a"
            strokeWidth="9"
            strokeLinecap="butt"
          />

          {/* Green zone: 1.0 - 1.5 */}
          <path
            d={arcPath(greenStart, greenEnd, R, CX, CY)}
            fill="none"
            stroke="#33ff33"
            strokeWidth="8"
            strokeLinecap="butt"
            opacity="0.6"
          />

          {/* Yellow zone: 1.5 - 3.0 */}
          <path
            d={arcPath(greenEnd, yellowEnd, R, CX, CY)}
            fill="none"
            stroke="#ffaa00"
            strokeWidth="8"
            strokeLinecap="butt"
            opacity="0.6"
          />

          {/* Orange zone: 3.0 - 5.0 */}
          <path
            d={arcPath(yellowEnd, orangeEnd, R, CX, CY)}
            fill="none"
            stroke="#ff8800"
            strokeWidth="8"
            strokeLinecap="butt"
            opacity="0.6"
          />

          {/* Red zone: 5.0 - 10.0 */}
          <path
            d={arcPath(orangeEnd, redEnd, R, CX, CY)}
            fill="none"
            stroke="#ff4444"
            strokeWidth="8"
            strokeLinecap="butt"
            opacity="0.6"
          />

          {/* Scale markings */}
          {SCALE_MARKS.map((mark) => {
            const angle = swrToAngle(mark.value);
            const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
            const tickOuter = R + 1;
            const tickInner = R - 10;
            const labelR = R - 18;
            const x1 = CX + tickOuter * Math.cos(toRad(angle));
            const y1 = CY + tickOuter * Math.sin(toRad(angle));
            const x2 = CX + tickInner * Math.cos(toRad(angle));
            const y2 = CY + tickInner * Math.sin(toRad(angle));
            const lx = CX + labelR * Math.cos(toRad(angle));
            const ly = CY + labelR * Math.sin(toRad(angle));
            return (
              <g key={mark.label}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#33ff3388"
                  strokeWidth="1"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#33ff33"
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                  opacity="0.7"
                >
                  {mark.label}
                </text>
              </g>
            );
          })}

          {/* Needle pivot */}
          <circle cx={CX} cy={CY} r="4" fill="#333" stroke="#555" strokeWidth="1" />

          {/* Needle */}
          <line
            x1={CX}
            y1={CY}
            x2={CX + R_INNER * Math.cos(((needleAngle - 90) * Math.PI) / 180)}
            y2={CY + R_INNER * Math.sin(((needleAngle - 90) * Math.PI) / 180)}
            stroke="#ff4444"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              filter: 'drop-shadow(0 0 3px rgba(255, 68, 68, 0.6))',
            }}
          />

          {/* Center cap */}
          <circle cx={CX} cy={CY} r="3" fill="#555" />
        </svg>
      </div>

      {/* Digital readout */}
      <div style={readoutStyle}>
        {hasAnalyzer ? `SWR: ${swrCurrent.toFixed(1)}:1` : 'SWR: ???'}
      </div>

      {/* No analyzer message */}
      {!hasAnalyzer && (
        <div style={noAnalyzerStyle}>
          ANTENNA ANALYZER REQUIRED
        </div>
      )}

      {/* Warning text */}
      {isWarning && (
        <div style={warningStyle}>
          HIGH SWR
        </div>
      )}
    </div>
  );
};

export default SWRMeter;
