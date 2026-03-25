// ============================================================
// Ham Radio Clicker — Research Panel Component
// ============================================================

import React from 'react';
import { useGameStore } from '../stores/useGameStore';
import { RESEARCH } from '../data/research';
import { formatNumber } from '../utils/format';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  blue: '#00ccff',
  red: '#ff4444',
  panel: 'rgba(8,16,24,0.95)',
  border: 'rgba(51,255,51,0.2)',
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  propagation: { label: 'PROPAGATION', color: '#ff9900' },
  digital: { label: 'DIGITAL', color: '#00ccff' },
  rf_engineering: { label: 'RF ENGINEERING', color: '#ff44ff' },
  operations: { label: 'OPERATIONS', color: '#44ff44' },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatTimeRemaining(endsAt: number): string {
  const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  return formatDuration(remaining);
}

const ResearchPanel: React.FC = () => {
  const qsos = useGameStore((s) => s.qsos);
  const activeResearch = useGameStore((s) => s.activeResearch);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const startResearch = useGameStore((s) => s.startResearch);

  // Force re-render every second for progress bar
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['propagation', 'digital', 'rf_engineering', 'operations'] as const;

  const getEffectLabel = (effect: string, value: number): string => {
    switch (effect) {
      case 'qps_mult': return `QPS x${value}`;
      case 'click_mult': return `Click x${value}`;
      case 'swr_reduction': return `SWR -${value}`;
      case 'quality_bonus': return `Quality +${value}`;
      case 'prestige_discount': return `Prestige -${(value * 100).toFixed(0)}%`;
      default: return '';
    }
  };

  return (
    <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Active research banner */}
      {activeResearch && (() => {
        const res = RESEARCH.find((r) => r.id === activeResearch.id);
        if (!res) return null;
        const now = Date.now();
        const total = activeResearch.endsAt - activeResearch.startedAt;
        const elapsed = Math.min(now - activeResearch.startedAt, total);
        const pct = total > 0 ? (elapsed / total) * 100 : 100;

        return (
          <div style={{
            border: '1px solid rgba(0,204,255,0.4)',
            borderRadius: 4,
            padding: '8px 10px',
            background: 'rgba(0,204,255,0.05)',
          }}>
            <div style={{
              fontSize: 10,
              color: COLORS.blue,
              fontWeight: 'bold',
              marginBottom: 4,
              fontFamily: 'monospace',
            }}>
              RESEARCHING: {res.icon} {res.name}
            </div>
            <div style={{
              width: '100%',
              height: 8,
              background: 'rgba(0,204,255,0.1)',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 4,
            }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00ccff, #00ffcc)',
                borderRadius: 4,
                transition: 'width 1s linear',
              }} />
            </div>
            <div style={{
              fontSize: 9,
              color: 'rgba(0,204,255,0.7)',
              fontFamily: 'monospace',
              textAlign: 'right',
            }}>
              {formatTimeRemaining(activeResearch.endsAt)} remaining
            </div>
          </div>
        );
      })()}

      {/* Research items by category */}
      {categories.map((cat) => {
        const items = RESEARCH.filter((r) => r.category === cat);
        const catInfo = CATEGORY_LABELS[cat];

        return (
          <div key={cat}>
            <div style={{
              fontSize: 9,
              fontWeight: 'bold',
              color: catInfo.color,
              letterSpacing: 1.5,
              fontFamily: 'monospace',
              marginBottom: 4,
              paddingBottom: 2,
              borderBottom: `1px solid ${catInfo.color}33`,
            }}>
              {catInfo.label}
            </div>

            {items.map((res) => {
              const isCompleted = completedResearch.includes(res.id);
              const isActive = activeResearch?.id === res.id;
              const prereqMet = !res.requires || completedResearch.includes(res.requires);
              const canAfford = qsos >= res.cost;
              const canStart = !activeResearch && prereqMet && canAfford && !isCompleted;
              const isLocked = !prereqMet && !isCompleted;

              const requiresName = res.requires
                ? RESEARCH.find((r) => r.id === res.requires)?.name ?? res.requires
                : '';

              return (
                <div
                  key={res.id}
                  style={{
                    border: `1px solid ${
                      isCompleted ? 'rgba(51,255,51,0.3)' :
                      isActive ? 'rgba(0,204,255,0.3)' :
                      isLocked ? 'rgba(255,68,68,0.15)' :
                      canStart ? 'rgba(51,255,51,0.25)' :
                      'rgba(51,255,51,0.1)'
                    }`,
                    borderRadius: 4,
                    padding: '6px 8px',
                    marginBottom: 4,
                    background: isCompleted ? 'rgba(51,255,51,0.03)' :
                      isActive ? 'rgba(0,204,255,0.03)' :
                      'transparent',
                    opacity: isLocked ? 0.35 : isCompleted ? 0.7 : 1,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginBottom: 2,
                  }}>
                    <span style={{ fontSize: 12 }}>
                      {isCompleted ? '\u2705' : isLocked ? '\u{1F512}' : res.icon}
                    </span>
                    <span style={{
                      flex: 1,
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: isCompleted ? 'rgba(51,255,51,0.6)' : COLORS.green,
                      fontFamily: 'monospace',
                    }}>
                      {res.name}
                    </span>
                    <span style={{
                      fontSize: 9,
                      color: COLORS.blue,
                      fontFamily: 'monospace',
                    }}>
                      {getEffectLabel(res.effect, res.value)}
                    </span>
                  </div>

                  <div style={{
                    fontSize: 9,
                    color: 'rgba(255,170,0,0.5)',
                    lineHeight: 1.3,
                    marginBottom: 3,
                    fontFamily: 'monospace',
                  }}>
                    {res.description}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    {!isCompleted && !isActive && (
                      <span style={{
                        fontSize: 10,
                        color: canAfford ? COLORS.amber : '#885500',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                      }}>
                        {formatNumber(res.cost)} QSOs
                      </span>
                    )}
                    {!isCompleted && !isActive && (
                      <span style={{
                        fontSize: 9,
                        color: 'rgba(51,255,51,0.4)',
                        fontFamily: 'monospace',
                      }}>
                        {formatDuration(res.duration)}
                      </span>
                    )}
                    {isCompleted && (
                      <span style={{
                        fontSize: 9,
                        color: 'rgba(51,255,51,0.5)',
                        fontFamily: 'monospace',
                      }}>
                        COMPLETED
                      </span>
                    )}
                    {isActive && (
                      <span style={{
                        fontSize: 9,
                        color: COLORS.blue,
                        fontFamily: 'monospace',
                      }}>
                        IN PROGRESS
                      </span>
                    )}
                    {isLocked && !isCompleted ? (
                      <span style={{
                        fontSize: 9,
                        color: COLORS.red,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                      }}>
                        Req: {requiresName}
                      </span>
                    ) : !isCompleted && !isActive ? (
                      <button
                        disabled={!canStart}
                        style={{
                          background: canStart ? 'rgba(51,255,51,0.12)' : 'transparent',
                          border: `1px solid ${canStart ? COLORS.green : 'rgba(51,255,51,0.15)'}`,
                          color: canStart ? COLORS.green : 'rgba(51,255,51,0.2)',
                          fontFamily: 'monospace',
                          fontSize: 9,
                          padding: '2px 8px',
                          borderRadius: 3,
                          cursor: canStart ? 'pointer' : 'not-allowed',
                          fontWeight: 'bold',
                          letterSpacing: 1,
                        }}
                        onClick={() => canStart && startResearch(res.id)}
                      >
                        START
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ResearchPanel;
