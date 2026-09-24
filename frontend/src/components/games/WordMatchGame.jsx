import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Brain,
  Zap,
  Flame,
  HelpCircle,
  Trophy,
  Clock,
  Layers,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { gameAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from '../../utils/confetti';

// Word Sets organized by category
const WORD_SETS = {
  cs: {
    label: 'CS & Algorithms',
    icon: '💻',
    pairs: [
      { id: 1, word: 'Recursion', match: 'Self-calling function' },
      { id: 2, word: 'Stack', match: 'LIFO (Last In First Out)' },
      { id: 3, word: 'Queue', match: 'FIFO (First In First Out)' },
      { id: 4, word: 'Hash Table', match: 'O(1) Key-Value lookup' },
      { id: 5, word: 'Binary Search', match: 'O(log n) Divide & Conquer' },
      { id: 6, word: 'Polymorphism', match: 'Many forms via interfaces' },
      { id: 7, word: 'Graph', match: 'Vertices connected by edges' },
      { id: 8, word: 'Deadlock', match: 'Mutual resource blocking' },
      { id: 9, word: 'B-Tree', match: 'Self-balancing search tree' },
      { id: 10, word: 'Big-O', match: 'Algorithm complexity upper bound' },
    ],
  },
  wellbeing: {
    label: 'Brain & Wellbeing',
    icon: '🧠',
    pairs: [
      { id: 11, word: 'Cortisol', match: 'Primary stress hormone' },
      { id: 12, word: 'Dopamine', match: 'Motivation & reward signal' },
      { id: 13, word: 'Melatonin', match: 'Sleep-wake cycle regulator' },
      { id: 14, word: 'Deep Work', match: 'Distraction-free high focus' },
      { id: 15, word: 'Neuroplasticity', match: 'Brain ability to adapt & rewire' },
      { id: 16, word: 'Circadian Rhythm', match: 'Internal 24-hour biological clock' },
      { id: 17, word: 'Burnout', match: 'Chronic workplace exhaustion' },
      { id: 18, word: 'Mindfulness', match: 'Intentional present awareness' },
      { id: 19, word: 'REM Sleep', match: 'Rapid eye movement dream state' },
      { id: 20, word: 'Endorphins', match: 'Natural pain & stress relievers' },
    ],
  },
  dev: {
    label: 'Web & Engineering',
    icon: '🚀',
    pairs: [
      { id: 21, word: 'REST API', match: 'Stateless client-server architecture' },
      { id: 22, word: 'JWT', match: 'Compact stateless auth tokens' },
      { id: 23, word: 'Docker', match: 'OS-level containerization' },
      { id: 24, word: 'PostgreSQL', match: 'ACID-compliant relational DB' },
      { id: 25, word: 'Git Commit', match: 'Cryptographic repo snapshot' },
      { id: 26, word: 'WebSockets', match: 'Full-duplex real-time channel' },
      { id: 27, word: 'GraphQL', match: 'Declarative data query language' },
      { id: 28, word: 'CI/CD', match: 'Automated test & deploy pipelines' },
      { id: 29, word: 'Vite', match: 'Next-gen fast frontend bundler' },
      { id: 30, word: 'Prisma', match: 'Next-generation TypeScript ORM' },
    ],
  },
  vocab: {
    label: 'Mind Clarity Vocab',
    icon: '📖',
    pairs: [
      { id: 31, word: 'Ephemeral', match: 'Lasting for a very short time' },
      { id: 32, word: 'Resilient', match: 'Able to withstand & recover quickly' },
      { id: 33, word: 'Cognizant', match: 'Having knowledge or being aware' },
      { id: 34, word: 'Meticulous', match: 'Showing extreme care to detail' },
      { id: 35, word: 'Pragmatic', match: 'Dealing with things sensibly & realistically' },
      { id: 36, word: 'Equanimity', match: 'Mental calmness under stress' },
      { id: 37, word: 'Tenacity', match: 'Persistent determination & grit' },
      { id: 38, word: 'Serenity', match: 'State of being calm and peaceful' },
      { id: 39, word: 'Lucid', match: 'Clear and easy to understand' },
      { id: 40, word: 'Catalyst', match: 'Substance or event causing change' },
    ],
  },
};

const PAIRS_PER_ROUND = 6;

export const WordMatchGame = ({ onFinish }) => {
  const { showToast } = useNotification();

  const [category, setCategory] = useState('cs');
  const [tiles, setTiles] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [mismatchedTileIds, setMismatchedTileIds] = useState([]);
  const [hintPairId, setHintPairId] = useState(null);

  // Score & Telemetry
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const timerRef = useRef(null);

  // Initialize a new round
  const initRound = (catKey = category) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const catData = WORD_SETS[catKey] || WORD_SETS.cs;
    // Pick PAIRS_PER_ROUND random pairs
    const shuffledPairs = [...catData.pairs]
      .sort(() => Math.random() - 0.5)
      .slice(0, PAIRS_PER_ROUND);

    // Create 2 tiles per pair: one term, one definition
    const roundTiles = [];
    shuffledPairs.forEach((p) => {
      roundTiles.push({
        id: `term-${p.id}`,
        pairId: p.id,
        text: p.word,
        type: 'WORD',
      });
      roundTiles.push({
        id: `match-${p.id}`,
        pairId: p.id,
        text: p.match,
        type: 'DEFINITION',
      });
    });

    // Shuffle the tiles
    const shuffledTiles = roundTiles.sort(() => Math.random() - 0.5);

    setTiles(shuffledTiles);
    setSelectedTileId(null);
    setMatchedPairIds([]);
    setMismatchedTileIds([]);
    setHintPairId(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setMoves(0);
    setMistakes(0);
    setSecondsElapsed(0);
    setShowFeedback(false);
    setIsPlaying(true);

    timerRef.current = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
  };

  useEffect(() => {
    initRound(category);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [category]);

  // Handle tile selection
  const handleTileClick = (tile) => {
    if (!isPlaying) return;
    if (matchedPairIds.includes(tile.pairId)) return; // already matched
    if (mismatchedTileIds.length > 0) return; // currently showing mismatch animation

    // Clear active hint if clicked
    if (hintPairId) setHintPairId(null);

    // If no tile is selected, select this one
    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      return;
    }

    // If clicking same tile, deselect it
    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      return;
    }

    // Otherwise, check match
    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) {
      setSelectedTileId(tile.id);
      return;
    }

    setMoves((m) => m + 1);

    if (firstTile.pairId === tile.pairId) {
      // MATCH!
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));

      // Scoring: 100 base + streak bonus + speed
      const streakBonus = (newStreak - 1) * 25;
      setScore((s) => s + 100 + streakBonus);

      const nextMatched = [...matchedPairIds, tile.pairId];
      setMatchedPairIds(nextMatched);
      setSelectedTileId(null);

      // Check win condition
      if (nextMatched.length === PAIRS_PER_ROUND) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsPlaying(false);
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => setShowFeedback(true), 600);
      }
    } else {
      // MISMATCH
      setStreak(0);
      setMistakes((prev) => prev + 1);
      setMismatchedTileIds([firstTile.id, tile.id]);

      setTimeout(() => {
        setMismatchedTileIds([]);
        setSelectedTileId(null);
      }, 700);
    }
  };

  // Give a hint: temporarily highlight one matching pair
  const handleGiveHint = () => {
    if (!isPlaying || hintPairId) return;

    // Find first unmatched pair
    const unmatched = tiles.find((t) => !matchedPairIds.includes(t.pairId));
    if (unmatched) {
      setHintPairId(unmatched.pairId);
      // Small penalty on score for hint
      setScore((s) => Math.max(0, s - 25));
      setTimeout(() => setHintPairId(null), 1500);
    }
  };

  // Submit post-game mood feedback
  const submitFeedback = async (mood) => {
    try {
      await gameAPI.logSession({
        gameType: 'WORD_MATCH',
        durationSeconds: Math.max(secondsElapsed, 10),
        score,
        postMoodFeedback: mood,
      });

      showToast(`Word Match session logged! Score: ${score}`, 'success');
      setShowFeedback(false);
      initRound(category);
      if (onFinish) onFinish();
    } catch (err) {
      console.error('Failed to log game session:', err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Header Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Word Matching Game
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
              Cognitive Focus
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Match technical terms, algorithms, and wellbeing concepts to sharpen working memory.
          </p>
        </div>

        {/* Live Telemetry Pill */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 px-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-center px-2">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block">Time</span>
            <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatTime(secondsElapsed)}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="text-center px-2">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block">Score</span>
            <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
              {score}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="text-center px-2">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block">Streak</span>
            <span className="text-xs sm:text-sm font-black text-amber-500 flex items-center gap-0.5 justify-center">
              <Flame className="w-3 h-3" />
              {streak}x
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Restart Button */}
          <button
            onClick={() => initRound(category)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Shuffle & New Round"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Selection Tabs & Actions */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {Object.entries(WORD_SETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                setCategory(key);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                category === key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleGiveHint}
            disabled={!isPlaying || hintPairId !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-50 transition-all cursor-pointer"
            title="Reveal a hint (-25 pts)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hint</span>
          </button>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Matched: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{matchedPairIds.length}</strong> / {PAIRS_PER_ROUND}
          </span>
        </div>
      </div>

      {/* Main Tile Board */}
      {!showFeedback ? (
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 my-2">
            {tiles.map((tile) => {
              const isMatched = matchedPairIds.includes(tile.pairId);
              const isSelected = selectedTileId === tile.id;
              const isMismatched = mismatchedTileIds.includes(tile.id);
              const isHinted = hintPairId === tile.pairId;

              let tileStyle =
                'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-slate-800';

              if (isMatched) {
                tileStyle =
                  'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 opacity-70 scale-98 pointer-events-none';
              } else if (isMismatched) {
                tileStyle =
                  'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-500 text-rose-700 dark:text-rose-300 animate-shake scale-102';
              } else if (isHinted) {
                tileStyle =
                  'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-200 scale-102 animate-pulse';
              } else if (isSelected) {
                tileStyle =
                  'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-102 font-extrabold ring-2 ring-indigo-400/50';
              }

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  disabled={isMatched}
                  className={`min-h-[90px] sm:min-h-[105px] p-3 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs select-none ${tileStyle}`}
                >
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${
                      isSelected
                        ? 'text-indigo-200'
                        : isMatched
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {tile.type === 'WORD' ? 'Term' : 'Concept'}
                  </span>

                  <span
                    className={`text-xs sm:text-sm leading-snug line-clamp-3 ${
                      tile.type === 'WORD' ? 'font-black tracking-tight' : 'font-medium'
                    }`}
                  >
                    {tile.text}
                  </span>

                  {isMatched && (
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Matched
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Tips / Instructions */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 px-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-900 dark:text-indigo-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              Tip: Click a technical term and its corresponding definition. Consecutive matches grant streak combo multipliers!
            </span>
            <span className="font-bold shrink-0 text-slate-500 dark:text-slate-400">
              Moves: {moves} | Mistakes: {mistakes}
            </span>
          </div>
        </div>
      ) : (
        /* Round Complete & Mood Feedback Modal */
        <div className="flex flex-col items-center justify-center py-10 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-md">
            <Trophy className="w-8 h-8" />
          </div>

          <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Board Cleared! Excellent Focus!
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            You matched all {PAIRS_PER_ROUND} pairs in <strong>{formatTime(secondsElapsed)}</strong>.
          </p>

          {/* Round Summary Stats Card */}
          <div className="grid grid-cols-3 gap-3 w-full bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 mb-6">
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block">Final Score</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {score}
              </span>
            </div>
            <div className="text-center border-x border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block">Best Streak</span>
              <span className="text-lg font-black text-amber-500">
                {maxStreak}x 🔥
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block">Accuracy</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {moves > 0 ? Math.round(((PAIRS_PER_ROUND) / moves) * 100) : 100}%
              </span>
            </div>
          </div>

          {/* Mood Check-in */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 w-full shadow-soft">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              How do you feel after this mental break?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => submitFeedback('BETTER')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all flex-1 cursor-pointer"
              >
                <span className="text-2xl">😊</span>
                <span>Better</span>
              </button>
              <button
                onClick={() => submitFeedback('SAME')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 transition-all flex-1 cursor-pointer"
              >
                <span className="text-2xl">😐</span>
                <span>Same</span>
              </button>
              <button
                onClick={() => submitFeedback('STILL_STRESSED')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 transition-all flex-1 cursor-pointer"
              >
                <span className="text-2xl">😟</span>
                <span>Still Stressed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
