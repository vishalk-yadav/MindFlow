import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  CircleDot,
  Layers,
  Wind,
  Smile,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Code,
  Coffee,
  Brain,
  Heart,
  Cpu,
  Zap,
  BookOpen,
  Grid3x3
} from 'lucide-react';
import { gameAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useSearchParams } from 'react-router-dom';
import confetti from '../utils/confetti';
import { WordMatchGame } from '../components/games/WordMatchGame';
import { TicTacToeGame } from '../components/games/TicTacToeGame';

export const GamesPage = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useNotification();

  // Active game tab: 'bubbles' | 'memory' | 'breathing'
  const [activeGame, setActiveGame] = useState(searchParams.get('game') || 'bubbles');
  const [gameStats, setGameStats] = useState(null);

  useEffect(() => {
    const g = searchParams.get('game');
    if (g) setActiveGame(g);
  }, [searchParams]);

  const fetchStats = async () => {
    try {
      const res = await gameAPI.getStats();
      setGameStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Game Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs max-w-xl">
        <button
          onClick={() => setActiveGame('bubbles')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeGame === 'bubbles'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span>Stress Bubbles</span>
        </button>

        <button
          onClick={() => setActiveGame('memory')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeGame === 'memory'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Memory Match</span>
        </button>

        <button
          onClick={() => setActiveGame('wordmatch')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeGame === 'wordmatch'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Word Match</span>
        </button>

        <button
          onClick={() => setActiveGame('tictactoe')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeGame === 'tictactoe'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Grid3x3 className="w-4 h-4" />
          <span>Tic-Tac-Toe</span>
        </button>

        <button
          onClick={() => setActiveGame('breathing')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeGame === 'breathing'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Breathing</span>
        </button>
      </div>

      {/* Active Game Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
        {activeGame === 'bubbles' && <StressBubblesGame onFinish={fetchStats} />}
        {activeGame === 'memory' && <MemoryMatchGame onFinish={fetchStats} />}
        {activeGame === 'wordmatch' && <WordMatchGame onFinish={fetchStats} />}
        {activeGame === 'tictactoe' && <TicTacToeGame onFinish={fetchStats} />}
        {activeGame === 'breathing' && <BreathingGame onFinish={fetchStats} />}
      </div>
    </div>
  );
};

// 1. STRESS BUBBLES GAME
const StressBubblesGame = ({ onFinish }) => {
  const { showToast } = useNotification();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [bubbles, setBubbles] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setShowFeedback(false);
    generateBubbles();
  };

  const generateBubbles = () => {
    const newBubbles = Array.from({ length: 12 }, (_, i) => ({
      id: i + '-' + Date.now(),
      x: Math.floor(Math.random() * 85),
      y: Math.floor(Math.random() * 75),
      size: Math.floor(Math.random() * 25) + 40,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setBubbles(newBubbles);
  };

  useEffect(() => {
    let timer = null;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      setShowFeedback(true);
      confetti({ particleCount: 50, spread: 60 });
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const popBubble = (id) => {
    if (!isPlaying) return;
    setScore((s) => s + 1);
    setBubbles((prev) => prev.filter((b) => b.id !== id));

    // Spawn replacement bubble
    setTimeout(() => {
      setBubbles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.floor(Math.random() * 85),
          y: Math.floor(Math.random() * 75),
          size: Math.floor(Math.random() * 25) + 40,
          color: colors[Math.floor(Math.random() * colors.length)],
        },
      ]);
    }, 300);
  };

  const submitFeedback = async (mood) => {
    try {
      await gameAPI.logSession({
        gameType: 'STRESS_BUBBLES',
        durationSeconds: 30,
        score,
        postMoodFeedback: mood,
      });
      showToast('Session logged! Hope you feel refreshed.', 'success');
      setShowFeedback(false);
      if (onFinish) onFinish();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Stress Bubbles</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Pop as many bubbles as you can in 30 seconds for a quick stress relief reset.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Time</span>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{timeLeft}s</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Score</span>
            <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">{score}</p>
          </div>
        </div>
      </div>

      {!isPlaying && !showFeedback && (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm animate-float">
            <CircleDot className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">Ready for a quick 30-second pop?</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Popping bubbles has been shown to reduce micro-stress and tension between intense coding or study blocks.
          </p>
          <button
            onClick={startGame}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            Start Game
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="relative w-full h-[400px] bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden cursor-crosshair select-none">
          {bubbles.map((b) => (
            <button
              key={b.id}
              onClick={() => popBubble(b.id)}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                backgroundColor: b.color,
              }}
              className="absolute rounded-full opacity-80 hover:opacity-100 hover:scale-110 active:scale-90 transition-transform shadow-md animate-float cursor-pointer"
            />
          ))}
        </div>
      )}

      {/* Post-Game Mood Feedback */}
      {showFeedback && (
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-md">
          <span className="text-3xl mb-2">🎉</span>
          <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">Nice reset!</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">You popped <strong className="text-blue-600 dark:text-blue-400">{score}</strong> bubbles.</p>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 w-full">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">How do you feel now?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => submitFeedback('BETTER')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all flex-1 cursor-pointer"
              >
                <span className="text-xl">😊</span>
                <span>Better</span>
              </button>
              <button
                onClick={() => submitFeedback('SAME')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 transition-all flex-1 cursor-pointer"
              >
                <span className="text-xl">😐</span>
                <span>Same</span>
              </button>
              <button
                onClick={() => submitFeedback('STILL_STRESSED')}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 transition-all flex-1 cursor-pointer"
              >
                <span className="text-xl">😟</span>
                <span>Still stressed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. MEMORY MATCH GAME
const cardIcons = [
  { id: 'code', icon: Code, label: 'Code' },
  { id: 'coffee', icon: Coffee, label: 'Coffee' },
  { id: 'brain', icon: Brain, label: 'Brain' },
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'cpu', icon: Cpu, label: 'Chip' },
  { id: 'zap', icon: Zap, label: 'Energy' },
];

const MemoryMatchGame = ({ onFinish }) => {
  const { showToast } = useNotification();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const initCards = () => {
    const deck = [...cardIcons, ...cardIcons]
      .map((item, index) => ({ ...item, uniqueId: index }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setShowFeedback(false);
  };

  useEffect(() => {
    initCards();
  }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].id === cards[second].id) {
        setMatched((prev) => [...prev, cards[first].id]);
        setFlipped([]);
        if (matched.length + 1 === cardIcons.length) {
          confetti({ particleCount: 60, spread: 70 });
          setTimeout(() => setShowFeedback(true), 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const submitFeedback = async (mood) => {
    try {
      await gameAPI.logSession({
        gameType: 'MEMORY_MATCH',
        durationSeconds: 60,
        score: moves,
        postMoodFeedback: mood,
      });
      showToast('Game recorded! Good mental workout.', 'success');
      setShowFeedback(false);
      initCards();
      if (onFinish) onFinish();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Memory Match</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Match 6 engineering pairs to stimulate focus and working memory.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Moves: {moves}</span>
          <button
            onClick={initCards}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!showFeedback ? (
        <div className="grid grid-cols-4 gap-3 max-w-md w-full my-4">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const isCardFlipped = flipped.includes(idx) || matched.includes(card.id);

            return (
              <button
                key={card.uniqueId}
                onClick={() => handleCardClick(idx)}
                className={`h-20 sm:h-24 rounded-2xl flex items-center justify-center transition-all transform cursor-pointer ${
                  isCardFlipped
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-400 dark:border-purple-600 text-purple-600 dark:text-purple-300 scale-102'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCardFlipped ? (
                  <Icon className="w-7 h-7" />
                ) : (
                  <span className="text-lg font-extrabold text-slate-300 dark:text-slate-600">?</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center max-w-sm">
          <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-2" />
          <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">All pairs matched in {moves} moves!</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">How do you feel now?</p>

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              onClick={() => submitFeedback('BETTER')}
              className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold flex-1 cursor-pointer"
            >
              😊 Better
            </button>
            <button
              onClick={() => submitFeedback('SAME')}
              className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex-1 cursor-pointer"
            >
              😐 Same
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. INTERACTIVE BREATHING GAME (4-4-6 Cycle)
const BreathingGame = ({ onFinish }) => {
  const { showToast } = useNotification();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Inhale'); // 'Inhale' (4s) | 'Hold' (4s) | 'Exhale' (6s)
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [totalSeconds, setTotalSeconds] = useState(60);

  useEffect(() => {
    let interval = null;
    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((s) => s - 1);
        setPhaseSeconds((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (phase === 'Inhale') {
              setPhase('Hold');
              return 4;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return 6;
            } else {
              setPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isActive && totalSeconds === 0) {
      setIsActive(false);
      showToast('Breathing session complete! Feel the calm.', 'success');
      gameAPI.logSession({ gameType: 'BREATHING_GAME', durationSeconds: 60, postMoodFeedback: 'BETTER' });
      if (onFinish) onFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, totalSeconds, phase, phaseSeconds]);

  const handleToggle = () => {
    if (!isActive) {
      setPhase('Inhale');
      setPhaseSeconds(4);
      setTotalSeconds(60);
    }
    setIsActive(!isActive);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div className="text-left">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>4-4-6 Mindful Breathing</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Inhale for 4s, Hold for 4s, Exhale for 6s to rapidly lower physiological stress.</p>
        </div>
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
          {totalSeconds}s remaining
        </span>
      </div>

      {/* Breathing Animated Circle */}
      <div className="relative w-72 h-72 flex items-center justify-center my-8">
        <div
          className={`absolute rounded-full transition-all duration-1000 ease-in-out ${
            phase === 'Inhale'
              ? 'w-64 h-64 bg-emerald-100/60 dark:bg-emerald-950/40 border-4 border-emerald-400/80 dark:border-emerald-500/80 scale-110'
              : phase === 'Hold'
              ? 'w-64 h-64 bg-teal-100/70 dark:bg-teal-950/50 border-4 border-teal-500 scale-110 shadow-lg shadow-teal-500/20'
              : 'w-40 h-40 bg-blue-100/60 dark:bg-blue-950/40 border-4 border-blue-400 dark:border-blue-500 scale-90'
          }`}
        />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {isActive ? phase : 'Ready?'}
          </span>
          {isActive && (
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {phaseSeconds}s
            </span>
          )}
        </div>
      </div>

      {/* Control button */}
      <button
        onClick={handleToggle}
        className={`px-8 py-3 rounded-2xl text-xs font-extrabold text-white shadow-lg transition-all cursor-pointer ${
          isActive
            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
        }`}
      >
        {isActive ? 'Pause Exercise' : 'Start 1-Minute Breathing'}
      </button>
    </div>
  );
};
