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

interface EventPopupProps {
  inline?: boolean;
}

const EventPopup: React.FC<EventPopupProps> = ({ inline = false }) => {
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
    wrapper: inline
      ? {
          width: '100%',
          maxWidth: 500,
          alignSelf: 'center',
          flexShrink: 0,
          opacity: visible ? 1 : 0,
          maxHeight: visible ? '60px' : '0px',
          overflow: 'hidden',
          transition: 'opacity 0.4s ease-in-out, max-height 0.4s ease-in-out',
        }
      : {
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
      border: `1px solid ${borderColor}`,
      borderRadius: '4px',
      padding: '6px 10px',
      fontFamily: 'monospace',
      boxShadow: `0 0 8px ${isPositive ? 'rgba(51,255,51,0.15)' : 'rgba(255,68,68,0.15)'}`,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    icon: {
      fontSize: 14,
    },
    name: {
      fontSize: 11,
      fontWeight: 'bold',
      color: borderColor,
      textShadow: `0 0 6px ${borderColor}`,
      flex: 1,
    },
    timer: {
      fontSize: 11,
      color: COLORS.amber,
      fontWeight: 'bold',
    },
    description: {
      fontSize: 10,
      color: 'rgba(51,255,51,0.6)',
      marginBottom: 4,
      lineHeight: 1.2,
    },
    progressTrack: {
      height: 2,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 1,
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
