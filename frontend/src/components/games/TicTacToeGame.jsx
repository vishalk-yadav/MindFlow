import React, { useState, useEffect, useRef } from 'react';
import {
  Grid3x3,
  RotateCcw,
  Trophy,
  Bot,
  User,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  Clock
} from 'lucide-react';
import { gameAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from '../../utils/confetti';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

/**
 * Check if there's a winner or draw
 */
function checkWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { winner: 'DRAW', line: null };
  }

  return null;
}

/**
 * Minimax algorithm for optimal/unbeatable play (Hard mode)
 * Computer is 'O' (maximizing), Student is 'X' (minimizing)
 */
function minimax(board, depth, isMaximizing) {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'DRAW') return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(bestScore, score);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(bestScore, score);
      }
    }
    return bestScore;
  }
}

/**
 * Hard difficulty: optimal Minimax decision
 */
function getHardMove(board) {
  let bestScore = -Infinity;
  let bestMoves = [];

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [i];
      } else if (score === bestScore) {
        bestMoves.push(i);
      }
    }
  }

  // If multiple optimal moves exist, pick one randomly for variety
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

/**
 * Medium difficulty: Win if possible, block student if about to win,
 * otherwise take center/corners or random move.
 */
function getMediumMove(board) {
  // 1. Can computer win immediately?
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      if (checkWinner(board)?.winner === 'O') {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 2. Can student win on next move? Block them!
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'X';
      if (checkWinner(board)?.winner === 'X') {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }

  // 3. Take center if available
  if (board[4] === null && Math.random() < 0.75) {
    return 4;
  }

  // 4. Take a corner if available
  const corners = [0, 2, 6, 8].filter((idx) => board[idx] === null);
  if (corners.length > 0 && Math.random() < 0.6) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Fallback to any random open cell
  const openCells = board.map((v, idx) => (v === null ? idx : null)).filter((v) => v !== null);
  return openCells[Math.floor(Math.random() * openCells.length)];
}

/**
 * Easy difficulty: Completely random valid move
 */
function getEasyMove(board) {
  const openCells = board.map((v, idx) => (v === null ? idx : null)).filter((v) => v !== null);
  if (openCells.length === 0) return null;
  return openCells[Math.floor(Math.random() * openCells.length)];
}

export const TicTacToeGame = ({ onFinish }) => {
  const { showToast } = useNotification();

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isStudentTurn, setIsStudentTurn] = useState(true);
  const [difficulty, setDifficulty] = useState('MEDIUM'); // 'EASY' | 'MEDIUM' | 'HARD'
  const [gameResult, setGameResult] = useState(null); // null | { winner: 'X' | 'O' | 'DRAW', line: [...] }
  const [isThinking, setIsThinking] = useState(false);
  const [scores, setScores] = useState({ student: 0, computer: 0, draws: 0 });
  const [showFeedback, setShowFeedback] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const timerRef = useRef(null);

  // Start timer on mount or restart
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle student move
  const handleCellClick = (index) => {
    // Prevent move if cell occupied, game over, or computer is thinking
    if (board[index] !== null || gameResult !== null || !isStudentTurn || isThinking) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const outcome = checkWinner(newBoard);
    if (outcome) {
      finishGame(outcome, newBoard);
      return;
    }

    // Switch to computer turn
    setIsStudentTurn(false);
    setIsThinking(true);
  };

  // Trigger computer move after a realistic brief delay (400ms)
  useEffect(() => {
    if (!isStudentTurn && gameResult === null && isThinking) {
      const timer = setTimeout(() => {
        let cpuMove = null;
        if (difficulty === 'HARD') {
          cpuMove = getHardMove(board);
        } else if (difficulty === 'MEDIUM') {
          cpuMove = getMediumMove(board);
        } else {
          cpuMove = getEasyMove(board);
        }

        if (cpuMove !== null && board[cpuMove] === null) {
          const newBoard = [...board];
          newBoard[cpuMove] = 'O';
          setBoard(newBoard);
          setIsThinking(false);

          const outcome = checkWinner(newBoard);
          if (outcome) {
            finishGame(outcome, newBoard);
          } else {
            setIsStudentTurn(true);
          }
        } else {
          setIsThinking(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isStudentTurn, board, gameResult, difficulty, isThinking]);

  // Finish game handler
  const finishGame = (outcome, currentBoard) => {
    setGameResult(outcome);
    setIsThinking(false);

    if (outcome.winner === 'X') {
      setScores((prev) => ({ ...prev, student: prev.student + 1 }));
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
      setTimeout(() => setShowFeedback(true), 800);
    } else if (outcome.winner === 'O') {
      setScores((prev) => ({ ...prev, computer: prev.computer + 1 }));
      setTimeout(() => setShowFeedback(true), 800);
    } else {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
      setTimeout(() => setShowFeedback(true), 800);
    }
  };

  // Reset to a new game round
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsStudentTurn(true);
    setGameResult(null);
    setIsThinking(false);
    setShowFeedback(false);
  };

  // Reset overall scoreboard
  const resetScoreboard = () => {
    setScores({ student: 0, computer: 0, draws: 0 });
    resetGame();
  };

  // Submit mood feedback
  const submitFeedback = async (mood) => {
    try {
      await gameAPI.logSession({
        gameType: 'TIC_TAC_TOE',
        durationSeconds: Math.max(secondsElapsed, 15),
        score: scores.student * 100,
        postMoodFeedback: mood,
      });

      showToast('Game session recorded! Keep up the mindful breaks.', 'success');
      setShowFeedback(false);
      resetGame();
      if (onFinish) onFinish();
    } catch (err) {
      console.error('Failed to log game session:', err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Grid3x3 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Tic-Tac-Toe
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
              Mental Break
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Challenge the computer (You: <strong className="text-blue-600 dark:text-blue-400">X</strong> | CPU: <strong className="text-purple-600 dark:text-purple-400">O</strong>) with 3 difficulty modes.
          </p>
        </div>

        {/* Scoreboard Pill */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 px-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
          <div className="text-center px-1">
            <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase block flex items-center gap-1 justify-center">
              <User className="w-3 h-3" /> You (X)
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
              {scores.student}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="text-center px-1">
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase block">
              Draws
            </span>
            <span className="text-sm font-black text-slate-600 dark:text-slate-300">
              {scores.draws}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="text-center px-1">
            <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 uppercase block flex items-center gap-1 justify-center">
              <Bot className="w-3 h-3" /> CPU (O)
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
              {scores.computer}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          {/* New Game / Restart Button */}
          <button
            onClick={resetGame}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="New Game Round"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Difficulty Tabs & Controls */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Difficulty:</span>
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => {
                setDifficulty('EASY');
                resetGame();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                difficulty === 'EASY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => {
                setDifficulty('MEDIUM');
                resetGame();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                difficulty === 'MEDIUM'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => {
                setDifficulty('HARD');
                resetGame();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                difficulty === 'HARD'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Hard (Minimax)
            </button>
          </div>
        </div>

        {/* Turn Status Indicator */}
        <div className="flex items-center gap-2">
          {gameResult === null ? (
            isStudentTurn ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Your Turn (X)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 text-xs font-bold">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                Computer Thinking... (O)
              </span>
            )
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                gameResult.winner === 'X'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : gameResult.winner === 'O'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {gameResult.winner === 'X' && '🎉 Victory! You Won!'}
              {gameResult.winner === 'O' && '🤖 Computer Won!'}
              {gameResult.winner === 'DRAW' && "🤝 It's a Draw!"}
            </span>
          )}

          <button
            onClick={resetGame}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Main 3x3 Board */}
      <div className="relative my-4 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-slate-100/80 dark:bg-slate-950/70 p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-inner flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 h-full">
          {board.map((cell, idx) => {
            const isWinningCell = gameResult?.line?.includes(idx);
            const isFilled = cell !== null;

            let cellBg =
              'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700';

            if (isWinningCell) {
              cellBg =
                gameResult.winner === 'X'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 shadow-lg shadow-emerald-500/25 scale-102 ring-2 ring-emerald-400/40'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 shadow-lg shadow-rose-500/25 scale-102 ring-2 ring-rose-400/40';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                disabled={isFilled || gameResult !== null || !isStudentTurn || isThinking}
                className={`rounded-2xl border flex items-center justify-center font-black transition-all select-none ${cellBg} ${
                  !isFilled && gameResult === null && isStudentTurn && !isThinking
                    ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:scale-[1.02] active:scale-95'
                    : 'cursor-default'
                }`}
                aria-label={`Cell ${idx + 1}: ${cell || 'Empty'}`}
              >
                {cell === 'X' && (
                  <span className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 animate-scale-up tracking-tighter">
                    X
                  </span>
                )}
                {cell === 'O' && (
                  <span className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-purple-400 animate-scale-up tracking-tighter">
                    O
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Helpful Mode Explanation Tip */}
      <div className="mt-4 p-3 px-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs text-purple-900 dark:text-purple-300 max-w-lg text-center flex items-center justify-center gap-1.5 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
        <span>
          {difficulty === 'HARD'
            ? 'Hard mode uses the Minimax algorithm for optimal decision-making. Can you force a draw?'
            : difficulty === 'MEDIUM'
            ? 'Medium mode blocks winning streaks and seizes tactical positions.'
            : 'Easy mode makes playful, randomized moves for quick relaxation.'}
        </span>
      </div>

      {/* Post-Game Mood Feedback Card */}
      {showFeedback && (
        <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 w-full max-w-md shadow-soft text-center animate-fade-in">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
            How do you feel after this break?
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
      )}
    </div>
  );
};
