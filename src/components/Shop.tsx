// ============================================================
// Ham Radio Clicker -- Shop (Right Sidebar - Polished)
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
  panel: 'rgba(8,16,24,0.95)',
  border: 'rgba(51,255,51,0.2)',
};

type ShopTab = 'STATIONS' | 'UPGRADES' | 'ACHIEVEMENTS';

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '8px 8px',
    fontFamily: 'monospace',
    color: COLORS.green,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: COLORS.green,
    paddingBottom: 4,
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleLabel: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.4)',
    letterSpacing: 1,
  },
  tabRow: {
    display: 'flex',
    gap: 0,
    marginBottom: 6,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '5px 0',
    textAlign: 'center' as const,
    fontSize: 10,
    letterSpacing: 1,
    cursor: 'pointer',
    border: `1px solid ${COLORS.border}`,
    background: 'transparent',
    color: 'rgba(51,255,51,0.4)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'rgba(51,255,51,0.1)',
    color: COLORS.green,
    borderColor: COLORS.green,
    boxShadow: `0 0 6px rgba(51,255,51,0.2)`,
  },
  tabLeft: {
    borderRadius: '3px 0 0 3px',
  },
  tabRight: {
    borderRadius: '0 3px 3px 0',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    minHeight: 0,
  },
  card: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    padding: '8px 10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  },
  cardAffordable: {
    borderColor: 'rgba(51,255,51,0.35)',
    background: 'rgba(51,255,51,0.03)',
  },
  cardDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  cardLocked: {
    opacity: 0.3,
    cursor: 'not-allowed',
    borderColor: 'rgba(255,68,68,0.2)',
    background: 'rgba(255,68,68,0.02)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  cardIcon: {
    fontSize: 14,
  },
  cardName: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  cardCount: {
    fontSize: 10,
    color: COLORS.amber,
    fontWeight: 'bold',
  },
  cardFlavor: {
    fontSize: 9,
    color: COLORS.amber,
    opacity: 0.6,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cardCost: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: 'bold',
    textShadow: '0 0 4px rgba(255,170,0,0.2)',
  },
  cardCostUnaffordable: {
    fontSize: 11,
    color: '#885500',
    fontWeight: 'bold',
  },
  cardEffect: {
    fontSize: 10,
    color: COLORS.blue,
  },
  cardEffectDetail: {
    fontSize: 9,
    color: 'rgba(0,204,255,0.6)',
    marginTop: 2,
  },
  cardPct: {
    fontSize: 9,
    color: 'rgba(51,255,51,0.5)',
  },
  buyBtn: {
    background: 'rgba(51,255,51,0.12)',
    border: `1px solid ${COLORS.green}`,
    color: COLORS.green,
    fontFamily: 'monospace',
    fontSize: 9,
    padding: '3px 10px',
    borderRadius: 3,
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: 1,
    transition: 'all 0.15s ease',
    textShadow: '0 0 4px rgba(51,255,51,0.3)',
  },
  buyBtnDisabled: {
    background: 'transparent',
    borderColor: 'rgba(51,255,51,0.15)',
    color: 'rgba(51,255,51,0.2)',
    cursor: 'not-allowed',
    textShadow: 'none',
  },
  emptyMsg: {
    color: 'rgba(51,255,51,0.4)',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center' as const,
    padding: '16px 0',
  },
};

const Shop: React.FC = () => {
  const [tab, setTab] = useState<ShopTab>('STATIONS');

  const qsos = useGameStore((s) => s.qsos);
  const totalQsos = useGameStore((s) => s.totalQsos);
  const ownedStations = useGameStore((s) => s.stations);
  const purchasedUpgrades = useGameStore((s) => s.upgrades);
  const qsoPerSecond = useGameStore((s) => s.qsoPerSecond);
  const buyStation = useGameStore((s) => s.buyStation);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);

  const unlockedStations = stations.filter((st) => totalQsos >= st.unlockAt);
  const availableUpgrades = upgrades
    .filter((up) => !purchasedUpgrades.includes(up.id))
    .sort((a, b) => a.cost - b.cost);

  return (
    <div style={styles.container}>
      <style>{`
        .shop-card:hover:not(.shop-card-disabled) {
          box-shadow: 0 0 12px rgba(51,255,51,0.15), inset 0 0 20px rgba(51,255,51,0.03) !important;
          border-color: rgba(51,255,51,0.5) !important;
        }
        .shop-card-locked:hover {
          box-shadow: none !important;
          border-color: rgba(255,68,68,0.2) !important;
        }
        .shop-buy-btn:hover:not(:disabled) {
          background: rgba(51,255,51,0.2) !important;
          box-shadow: 0 0 8px rgba(51,255,51,0.25);
        }
      `}</style>

      <div style={styles.title}>
        SHOP
        <span style={styles.titleLabel}>// EQUIPMENT RACK</span>
      </div>

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
          AWARDS
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

              // QPS percentage for owned stations
              const totalQps = owned > 0 ? +(st.baseQps * owned).toFixed(1) : 0;
              const pct = qsoPerSecond > 0 && totalQps > 0 ? ((totalQps / qsoPerSecond) * 100).toFixed(0) : null;

              // Real effect numbers
              const nextTotalQps = +((owned + 1) * st.baseQps).toFixed(1);

              return (
                <div
                  key={st.id}
                  className={`shop-card${!hasLicense ? ' shop-card-locked shop-card-disabled' : !canAfford ? ' shop-card-disabled' : ''}`}
                  style={{
                    ...styles.card,
                    ...(!hasLicense
                      ? styles.cardLocked
                      : canAfford
                        ? styles.cardAffordable
                        : styles.cardDisabled),
                  }}
                  onClick={() => canAfford && buyStation(st.id)}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.cardIcon}>{hasLicense ? st.icon : '\u{1F512}'}</span>
                    <span style={styles.cardName}>{st.name}</span>
                    {owned > 0 && (
                      <span style={styles.cardCount}>x{owned}</span>
                    )}
                    {pct && (
                      <span style={styles.cardPct}>{pct}%</span>
                    )}
                  </div>
                  <div style={styles.cardFlavor}>{st.flavor}</div>
                  <div style={styles.cardFooter}>
                    <span style={canAfford ? styles.cardCost : styles.cardCostUnaffordable}>
                      {formatNumber(cost)} QSOs
                    </span>
                    <span style={styles.cardEffect}>
                      +{st.baseQps} q/s
                    </span>
                    {!hasLicense ? (
                      <span style={{
                        fontSize: 9,
                        color: COLORS.red,
                        fontWeight: 'bold',
                      }}>
                        Req: {licenseName}
                      </span>
                    ) : (
                      <button
                        className="shop-buy-btn"
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
                  {/* Effect detail */}
                  {owned > 0 && (
                    <div style={styles.cardEffectDetail}>
                      Currently: {totalQps} q/s total | Next: {nextTotalQps} q/s
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : availableUpgrades.length === 0 ? (
          <div style={styles.emptyMsg}>No upgrades available</div>
        ) : (
          availableUpgrades.map((up) => {
            const prereqMet = !up.requires || purchasedUpgrades.includes(up.requires);
            const canAfford = qsos >= up.cost && prereqMet;
            const requiresName = up.requires
              ? UPGRADES.find((u) => u.id === up.requires)?.name ?? up.requires
              : '';

            return (
              <div
                key={up.id}
                className={`shop-card${!prereqMet ? ' shop-card-locked shop-card-disabled' : !canAfford ? ' shop-card-disabled' : ''}`}
                style={{
                  ...styles.card,
                  ...(!prereqMet
                    ? styles.cardLocked
                    : canAfford
                      ? styles.cardAffordable
                      : styles.cardDisabled),
                }}
                onClick={() => canAfford && buyUpgrade(up.id)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{prereqMet ? up.icon : '\u{1F512}'}</span>
                  <span style={styles.cardName}>{up.name}</span>
                </div>
                <div style={styles.cardFlavor}>{up.flavor}</div>
                <div style={{
                  fontSize: 10,
                  color: COLORS.blue,
                  marginBottom: 4,
                  padding: '2px 4px',
                  background: 'rgba(0,204,255,0.05)',
                  borderRadius: 2,
                  borderLeft: '2px solid rgba(0,204,255,0.2)',
                }}>
                  {up.description}
                </div>
                <div style={styles.cardFooter}>
                  <span style={canAfford ? styles.cardCost : styles.cardCostUnaffordable}>
                    {formatNumber(up.cost)} QSOs
                  </span>
                  {!prereqMet ? (
                    <span style={{
                      fontSize: 9,
                      color: COLORS.red,
                      fontWeight: 'bold',
                    }}>
                      Req: {requiresName}
                    </span>
                  ) : (
                    <button
                      className="shop-buy-btn"
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
                  )}
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
