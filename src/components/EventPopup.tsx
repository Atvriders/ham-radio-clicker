// ============================================================
// Ham Radio Clicker — Event Popup (Slide-Down Banner)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { randomEvents } from '../data/events';

const COLORS = {
  green: '#33ff33',
  red: '#ff4444',
  amber: '#ffaa00',
  panel: 'rgba(10,20,30,0.95)',
  border: 'rgba(51,255,51,0.15)',
};

const EventPopup: React.FC = () => {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Find event definition for display info
  const eventDef = activeEvent
    ? randomEvents.find((e) => e.id === activeEvent.id)
    : null;
  const isPositive = eventDef?.isPositive ?? true;
  const borderColor = isPositive ? COLORS.green : COLORS.red;

  useEffect(() => {
    if (activeEvent) {
      const total = activeEvent.endsAt - Date.now();
      setTotalDuration(total > 0 ? total : 1);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [activeEvent?.id]);

  useEffect(() => {
    if (!activeEvent) return;
    const interval = setInterval(() => {
      const r = Math.max(0, activeEvent.endsAt - Date.now());
      setRemaining(r);
      if (r <= 0) {
        setVisible(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeEvent]);

  const progress = totalDuration > 0 ? remaining / totalDuration : 0;

  const styles: Record<string, React.CSSProperties> = {
    wrapper: {
      position: 'fixed',
      bottom: 100,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '100%'})`,
      transition: 'transform 0.4s ease-in-out',
      zIndex: 1500,
      width: '90%',
      maxWidth: 500,
      pointerEvents: visible ? 'auto' : 'none',
    },
    banner: {
      background: COLORS.panel,
      border: `2px solid ${borderColor}`,
      borderRadius: '8px 8px 0 0',
      padding: 16,
      fontFamily: 'monospace',
      boxShadow: `0 -4px 20px rgba(0,0,0,0.5), 0 0 15px ${isPositive ? 'rgba(51,255,51,0.2)' : 'rgba(255,68,68,0.2)'}`,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    icon: {
      fontSize: 22,
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      color: borderColor,
      textShadow: `0 0 8px ${borderColor}`,
      flex: 1,
    },
    timer: {
      fontSize: 13,
      color: COLORS.amber,
      fontWeight: 'bold',
    },
    description: {
      fontSize: 12,
      color: 'rgba(51,255,51,0.7)',
      marginBottom: 10,
      lineHeight: 1.4,
    },
    progressTrack: {
      height: 4,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      background: borderColor,
      borderRadius: 2,
      transition: 'width 0.1s linear',
      boxShadow: `0 0 6px ${borderColor}`,
      width: `${progress * 100}%`,
    },
  };

  if (!activeEvent || !eventDef) return null;

  const secs = Math.ceil(remaining / 1000);

  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        <div style={styles.header}>
          <span style={styles.icon}>{eventDef.icon}</span>
          <span style={styles.name}>{eventDef.name}</span>
          <span style={styles.timer}>{secs}s</span>
        </div>
        <div style={styles.description}>{eventDef.description}</div>
        <div style={styles.progressTrack}>
          <div style={styles.progressBar} />
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
