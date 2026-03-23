// ============================================================
// Ham Radio Clicker — Shop (Right Sidebar)
// ============================================================

import React, { useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { stations, getStationCost } from '../data/stations';
import { upgrades, UPGRADES } from '../data/upgrades';
import { formatNumber } from '../utils/format';
import Achievements from './Achievements';

const COLORS = {
  green: '#33ff33',
  amber: '#ffaa00',
  blue: '#00ccff',
  red: '#ff4444',
  panel: 'rgba(10,20,30,0.95)',
  border: 'rgba(51,255,51,0.15)',
};

type ShopTab = 'STATIONS' | 'UPGRADES' | 'ACHIEVEMENTS';

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: 16,
    fontFamily: 'monospace',
    color: COLORS.green,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tabRow: {
    display: 'flex',
    gap: 0,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    textAlign: 'center' as const,
    fontSize: 12,
    letterSpacing: 1,
    cursor: 'pointer',
    border: `1px solid ${COLORS.border}`,
    background: 'transparent',
    color: 'rgba(51,255,51,0.4)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'rgba(51,255,51,0.1)',
    color: COLORS.green,
    borderColor: COLORS.green,
    boxShadow: `0 0 6px rgba(51,255,51,0.2)`,
  },
  tabLeft: {
    borderRadius: '4px 0 0 4px',
  },
  tabRight: {
    borderRadius: '0 4px 4px 0',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    padding: 10,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cardDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  cardCount: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: 'bold',
  },
  cardFlavor: {
    fontSize: 10,
    color: COLORS.amber,
    opacity: 0.7,
    lineHeight: 1.3,
    marginBottom: 6,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCost: {
    fontSize: 12,
    color: COLORS.amber,
    fontWeight: 'bold',
  },
  cardEffect: {
    fontSize: 11,
    color: COLORS.blue,
  },
  buyBtn: {
    background: 'rgba(51,255,51,0.1)',
    border: `1px solid ${COLORS.green}`,
    color: COLORS.green,
    fontFamily: 'monospace',
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buyBtnDisabled: {
    background: 'transparent',
    borderColor: 'rgba(51,255,51,0.2)',
    color: 'rgba(51,255,51,0.3)',
    cursor: 'not-allowed',
  },
  emptyMsg: {
    color: 'rgba(51,255,51,0.4)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center' as const,
    padding: '24px 0',
  },
};

const Shop: React.FC = () => {
  const [tab, setTab] = useState<ShopTab>('STATIONS');

  const qsos = useGameStore((s) => s.qsos);
  const totalQsos = useGameStore((s) => s.totalQsos);
  const ownedStations = useGameStore((s) => s.stations);
  const purchasedUpgrades = useGameStore((s) => s.upgrades);
  const buyStation = useGameStore((s) => s.buyStation);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  const unlockedStations = stations.filter((st) => totalQsos >= st.unlockAt);
  const availableUpgrades = upgrades.filter(
    (up) =>
      !purchasedUpgrades.includes(up.id) &&
      (!up.requires || purchasedUpgrades.includes(up.requires))
  );

  return (
    <div style={styles.container}>
      <div style={styles.title}>SHOP</div>

      {/* Tab Toggle */}
      <div style={styles.tabRow}>
        <button
          style={{
            ...styles.tab,
            ...styles.tabLeft,
            ...(tab === 'STATIONS' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('STATIONS')}
        >
          STATIONS
        </button>
        <button
          style={{
            ...styles.tab,
            ...(tab === 'UPGRADES' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('UPGRADES')}
        >
          UPGRADES
        </button>
        <button
          style={{
            ...styles.tab,
            ...styles.tabRight,
            ...(tab === 'ACHIEVEMENTS' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('ACHIEVEMENTS')}
        >
          🏆
        </button>
      </div>

      {/* List */}
      <div style={styles.list}>
        {tab === 'ACHIEVEMENTS' ? (
          <Achievements />
        ) : tab === 'STATIONS' ? (
          unlockedStations.length === 0 ? (
            <div style={styles.emptyMsg}>No stations unlocked yet</div>
          ) : (
            unlockedStations.map((st) => {
              const owned = ownedStations[st.id] ?? 0;
              const cost = getStationCost(st, owned);
              const hasLicense = !st.requiredLicense || purchasedUpgrades.includes(st.requiredLicense);
              const canAfford = qsos >= cost && hasLicense;
              const licenseName = st.requiredLicense
                ? UPGRADES.find((u) => u.id === st.requiredLicense)?.name ?? st.requiredLicense
                : '';

              return (
                <div
                  key={st.id}
                  style={{
                    ...styles.card,
                    ...(!hasLicense
                      ? { ...styles.cardDisabled, borderColor: 'rgba(255,68,68,0.2)' }
                      : canAfford
                        ? { borderColor: 'rgba(51,255,51,0.3)' }
                        : styles.cardDisabled),
                  }}
                  onClick={() => canAfford && buyStation(st.id)}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.cardIcon}>{hasLicense ? st.icon : '🔒'}</span>
                    <span style={styles.cardName}>{st.name}</span>
                    {owned > 0 && (
                      <span style={styles.cardCount}>&times;{owned}</span>
                    )}
                  </div>
                  <div style={styles.cardFlavor}>{st.flavor}</div>
                  <div style={styles.cardFooter}>
                    <span style={styles.cardCost}>
                      {formatNumber(cost)} QSOs
                    </span>
                    <span style={styles.cardEffect}>
                      +{st.baseQps} QSO/s
                    </span>
                    {!hasLicense ? (
                      <span style={{
                        fontSize: 10,
                        color: COLORS.red,
                        fontWeight: 'bold',
                        letterSpacing: 0.5,
                      }}>
                        Requires {licenseName}
                      </span>
                    ) : (
                      <button
                        style={{
                          ...styles.buyBtn,
                          ...(!canAfford ? styles.buyBtnDisabled : {}),
                        }}
                        disabled={!canAfford}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canAfford) buyStation(st.id);
                        }}
                      >
                        BUY
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : availableUpgrades.length === 0 ? (
          <div style={styles.emptyMsg}>No upgrades available</div>
        ) : (
          availableUpgrades.map((up) => {
            const canAfford = qsos >= up.cost;

            return (
              <div
                key={up.id}
                style={{
                  ...styles.card,
                  ...(canAfford
                    ? { borderColor: 'rgba(51,255,51,0.3)' }
                    : styles.cardDisabled),
                }}
                onClick={() => canAfford && buyUpgrade(up.id)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{up.icon}</span>
                  <span style={styles.cardName}>{up.name}</span>
                </div>
                <div style={styles.cardFlavor}>{up.flavor}</div>
                <div style={{ fontSize: 11, color: COLORS.blue, marginBottom: 6 }}>
                  {up.description}
                </div>
                <div style={styles.cardFooter}>
                  <span style={styles.cardCost}>
                    {formatNumber(up.cost)} QSOs
                  </span>
                  <button
                    style={{
                      ...styles.buyBtn,
                      ...(!canAfford ? styles.buyBtnDisabled : {}),
                    }}
                    disabled={!canAfford}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canAfford) buyUpgrade(up.id);
                    }}
                  >
                    BUY
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Shop;
