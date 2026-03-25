// ============================================================
// Ham Radio Clicker -- QuizStrip (Compact inline quiz)
// ============================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { questions, QuizQuestion } from '../data/questions';
import { useGameStore } from '../stores/useGameStore';

type LicenseLevel = 'technician' | 'general' | 'extra';

const LEVEL_CONFIG: { key: LicenseLevel; label: string; multiplier: number }[] = [
  { key: 'technician', label: 'TECH', multiplier: 1 },
  { key: 'general', label: 'GEN', multiplier: 2 },
  { key: 'extra', label: 'EXTRA', multiplier: 3 },
];

// Quiz bonus scales by level: base is 5% of current QSOs (min 50), multiplied by level
function getBonus(currentQsos: number, multiplier: number): number {
  const base = Math.max(50, Math.floor(currentQsos * 0.05));
  return base * multiplier;
}

function getQuestionsForLevel(level: string): QuizQuestion[] {
  if (level === 'extra') return questions.filter((q) => q.level === 'extra');
  if (level === 'general') return questions.filter((q) => q.level === 'general');
  return questions.filter((q) => q.level === 'technician');
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const QuizStrip: React.FC = () => {
  const addQuizBonus = useGameStore((s) => s.addQuizBonus);
  const currentQsos = useGameStore((s) => s.qsos);

  const [licenseLevel, setLicenseLevel] = useState<LicenseLevel>('technician');
  const levelConfig = LEVEL_CONFIG.find((l) => l.key === licenseLevel)!;
  const bonus = getBonus(currentQsos, levelConfig.multiplier);

  const [pool, setPool] = useState<QuizQuestion[]>(() =>
    shuffleArray(getQuestionsForLevel(licenseLevel)).slice(0, 10)
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset pool when license level changes
  useEffect(() => {
    const newPool = shuffleArray(getQuestionsForLevel(licenseLevel)).slice(0, 10);
    setPool(newPool);
    setIndex(0);
    setScore(0);
    setAnswered(null);
    setFlash(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [licenseLevel]);

  const current = pool[index];

  const handleAnswer = useCallback(
    (ansIdx: number) => {
      if (answered !== null || !current) return;
      setAnswered(ansIdx);
      const isCorrect = ansIdx === current.correct;
      setFlash(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        setScore((s) => s + 1);
        addQuizBonus(bonus);
      }

      timerRef.current = setTimeout(() => {
        setAnswered(null);
        setFlash(null);
        if (index < 9) {
          setIndex((i) => i + 1);
        } else {
          // Reset cycle
          const newPool = shuffleArray(getQuestionsForLevel(licenseLevel)).slice(0, 10);
          setPool(newPool);
          setIndex(0);
          setScore(0);
        }
      }, 2000);
    },
    [answered, current, index, licenseLevel, addQuizBonus, bonus]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!current) return null;

  const borderColor =
    flash === 'correct'
      ? '#33ff33'
      : flash === 'wrong'
        ? '#ff4444'
        : 'rgba(51,255,51,0.2)';

  const bgColor =
    flash === 'correct'
      ? 'rgba(51,255,51,0.08)'
      : flash === 'wrong'
        ? 'rgba(255,68,68,0.06)'
        : 'rgba(8,16,24,0.95)';

  return (
    <div style={{
      border: `1px solid ${borderColor}`,
      borderRadius: 4,
      padding: '6px 10px',
      background: bgColor,
      fontFamily: 'monospace',
      transition: 'all 0.3s ease',
      flexShrink: 0,
      display: 'flex',
      gap: 10,
      alignItems: 'stretch',
    }}>
      {/* Left: Level selector buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {LEVEL_CONFIG.map((lvl) => {
          const isActive = licenseLevel === lvl.key;
          return (
            <button
              key={lvl.key}
              onClick={() => setLicenseLevel(lvl.key)}
              style={{
                padding: '2px 8px',
                fontSize: 8,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: 1,
                border: `1px solid ${isActive ? '#33ff33' : 'rgba(51,255,51,0.2)'}`,
                borderRadius: 10,
                background: isActive
                  ? '#33ff33'
                  : 'rgba(8,16,24,0.9)',
                color: isActive
                  ? '#0a0e1a'
                  : 'rgba(51,255,51,0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                textShadow: isActive ? 'none' : '0 0 4px rgba(51,255,51,0.15)',
              }}
            >
              {lvl.label} ({lvl.multiplier}x)
            </button>
          );
        })}
      </div>

      {/* Center: Question + answers */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <span style={{
            fontSize: 8,
            color: 'rgba(51,255,51,0.4)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            FCC STUDY [{current.reference}]
          </span>
        </div>

        {/* Question text */}
        <div style={{
          fontSize: 11,
          color: '#33ff33',
          lineHeight: 1.3,
          marginBottom: 6,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          textShadow: '0 0 4px rgba(51,255,51,0.2)',
        }}>
          {current.question}
        </div>

        {/* Answer buttons row */}
        <div style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
        }}>
          {current.answers.map((ans, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = answered === i;
            const isCorrectAnswer = i === current.correct;
            const showCorrect = answered !== null && isCorrectAnswer;
            const showWrong = isSelected && !isCorrectAnswer;

            let btnBg = 'rgba(51,255,51,0.05)';
            let btnBorder = 'rgba(51,255,51,0.15)';
            let btnColor = 'rgba(51,255,51,0.7)';

            if (showCorrect) {
              btnBg = 'rgba(51,255,51,0.2)';
              btnBorder = '#33ff33';
              btnColor = '#33ff33';
            } else if (showWrong) {
              btnBg = 'rgba(255,68,68,0.15)';
              btnBorder = '#ff4444';
              btnColor = '#ff4444';
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered !== null}
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  padding: '3px 6px',
                  fontSize: 9,
                  fontFamily: 'monospace',
                  background: btnBg,
                  border: `1px solid ${btnBorder}`,
                  borderRadius: 3,
                  color: btnColor,
                  cursor: answered !== null ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                }}
                title={ans}
              >
                <strong>{letter}.</strong> {ans}
              </button>
            );
          })}
        </div>

        {/* Feedback row */}
        {flash && (
          <div style={{
            fontSize: 9,
            marginTop: 4,
            color: flash === 'correct' ? '#33ff33' : '#ff4444',
            textShadow: flash === 'correct'
              ? '0 0 6px rgba(51,255,51,0.4)'
              : '0 0 6px rgba(255,68,68,0.4)',
          }}>
            {flash === 'correct'
              ? `Correct! +${bonus} QSOs (${levelConfig.multiplier}x)`
              : `Wrong — ${String.fromCharCode(65 + current.correct)} is correct`}
          </div>
        )}
      </div>

      {/* Right: Score + hamstudy link */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexShrink: 0,
        gap: 4,
      }}>
        <span style={{
          fontSize: 9,
          color: '#33ff33',
          fontWeight: 'bold',
        }}>
          {score}/{index + (answered !== null ? 1 : 0)}
        </span>
        <a
          href="https://hamstudy.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 7,
            color: 'rgba(51,255,51,0.3)',
            textDecoration: 'none',
          }}
        >
          hamstudy.org
        </a>
      </div>
    </div>
  );
};

export default QuizStrip;
