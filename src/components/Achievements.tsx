// ============================================================
// Ham Radio Clicker — Achievements Grid
// ============================================================

import React, { useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { achievements as achievementData } from '../data/achievements';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  blue: '#00ccff',
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
  },
  count: {
    fontSize: 12,
    color: COLORS.amber,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 8,
  },
  badge: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
    minHeight: 70,
    textAlign: 'center' as const,
  },
  badgeUnlocked: {
    background: 'rgba(51,255,51,0.05)',
    borderColor: 'rgba(51,255,51,0.3)',
  },
  badgeLocked: {
    background: 'rgba(128,128,128,0.05)',
    borderColor: 'rgba(128,128,128,0.2)',
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeIconLocked: {
    fontSize: 24,
    marginBottom: 4,
    filter: 'grayscale(100%) brightness(0.4)',
  },
  badgeName: {
    fontSize: 9,
    lineHeight: 1.2,
    color: COLORS.green,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badgeNameLocked: {
    fontSize: 9,
    lineHeight: 1.2,
    color: 'rgba(128,128,128,0.5)',
  },
  tooltip: {
    position: 'absolute' as const,
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#111820',
    border: `1px solid ${COLORS.green}`,
    borderRadius: 4,
    padding: '8px 10px',
    fontSize: 11,
    color: COLORS.green,
    zIndex: 100,
    pointerEvents: 'none' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
    marginBottom: 6,
    maxWidth: 220,
    whiteSpace: 'normal' as const,
  },
  tooltipName: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: COLORS.green,
  },
  tooltipDesc: {
    color: 'rgba(51,255,51,0.7)',
    marginBottom: 3,
  },
  tooltipFlavor: {
    color: COLORS.amber,
    fontStyle: 'italic',
    fontSize: 10,
  },
};

const Achievements: React.FC = () => {
  const unlockedIds = useGameStore((s) => s.achievements);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const unlockedCount = unlockedIds.length;
  const totalCount = achievementData.length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>ACHIEVEMENTS</div>
        <div style={styles.count}>
          {unlockedCount} / {totalCount} Unlocked
        </div>
      </div>

      <div style={styles.grid}>
        {achievementData.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          const isHovered = hoveredId === ach.id;
          const showInfo = isUnlocked || !ach.hidden;

          return (
            <div
              key={ach.id}
              style={{
                ...styles.badge,
                ...(isUnlocked ? styles.badgeUnlocked : styles.badgeLocked),
              }}
              onMouseEnter={() => setHoveredId(ach.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span
                style={
                  isUnlocked ? styles.badgeIcon : styles.badgeIconLocked
                }
              >
                {isUnlocked ? ach.icon : ach.hidden ? '?' : ach.icon}
              </span>
              <span
                style={
                  isUnlocked ? styles.badgeName : styles.badgeNameLocked
                }
              >
                {showInfo ? ach.name : '???'}
              </span>

              {isHovered && (
                <div style={styles.tooltip}>
                  <div style={styles.tooltipName}>
                    {showInfo ? ach.name : '???'}
                  </div>
                  <div style={styles.tooltipDesc}>
                    {showInfo ? ach.description : 'Keep playing to unlock!'}
                  </div>
                  {showInfo && ach.flavor && (
                    <div style={styles.tooltipFlavor}>{ach.flavor}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
