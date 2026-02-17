import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Pomodoro() {
  const [mode, setMode] = useState("focus");
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [focusMode, setFocusMode] = useState(false);

  const durations = {
    focus: customMinutes,
    short: 5,
    long: 15,
  };

  /* ================= LOAD HISTORY FROM LOCAL STORAGE ================= */

  useEffect(() => {
    const saved = localStorage.getItem("pomodoroHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pomodoroHistory", JSON.stringify(history));
  }, [history]);

  /* ================= RESET ON MODE CHANGE ================= */

  useEffect(() => {
    setTimeLeft(durations[mode] * 60);
    setRunning(false);
  }, [mode, customMinutes]);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRunning(false);
          completeSession();
          return durations[mode] * 60; // auto reset correctly
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  /* ================= COMPLETE SESSION ================= */

  const completeSession = () => {
    const newSession = {
      id: Date.now(),
      mode,
      duration: durations[mode],
      date: new Date(),
    };

    setHistory((prev) => [newSession, ...prev]);
  };

  /* ================= SAFE START ================= */

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(durations[mode] * 60);
    }
    setRunning(true);
  };

  /* ================= STREAK ================= */

  const today = new Date().toDateString();

  const streak = useMemo(() => {
    return history.filter(
      (s) =>
        s.mode === "focus" &&
        new Date(s.date).toDateString() === today
    ).length;
  }, [history]);

  /* ================= DISPLAY ================= */

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progress =
    1 - timeLeft / (durations[mode] * 60);

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - progress * circumference;

  return (
    <div className="relative min-h-screen bg-[#0b1220] text-slate-100 flex flex-col items-center justify-center overflow-hidden px-6">

      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl -z-10"
      />

      {!focusMode && (
        <>
          <h1 className="text-3xl font-bold mb-8">
            Pomodoro Focus
          </h1>

          {/* Mode Selector */}
          <div className="flex gap-4 mb-8">
            {["focus", "short", "long"].map((type) => (
              <button
                key={type}
                onClick={() => setMode(type)}
                className={`px-5 py-2 rounded-lg transition ${
                  mode === type
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-500"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {type === "focus"
                  ? "Focus"
                  : type === "short"
                  ? "Short Break"
                  : "Long Break"}
              </button>
            ))}
          </div>

          {mode === "focus" && (
            <div className="mb-8">
              <label className="text-sm opacity-70 mr-2">
                Focus Minutes:
              </label>
              <input
                type="number"
                min="1"
                value={customMinutes}
                onChange={(e) =>
                  setCustomMinutes(Number(e.target.value))
                }
                className="bg-[#111a2e] border border-indigo-500/20 px-3 py-2 rounded-md w-20 text-center"
              />
            </div>
          )}
        </>
      )}

      {/* Circular Timer */}
      <div className="relative mb-10">

        <svg width="260" height="260">
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="none"
          />

          <motion.circle
            cx="130"
            cy="130"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.4 }}
          />

          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 mb-8">
        {!running ? (
          <button
            onClick={handleStart}
            className="bg-indigo-600 px-6 py-3 rounded-lg"
          >
            Start
          </button>
        ) : (
          <button
            onClick={() => setRunning(false)}
            className="bg-rose-600 px-6 py-3 rounded-lg"
          >
            Pause
          </button>
        )}

        <button
          onClick={() => {
            setRunning(false);
            setTimeLeft(durations[mode] * 60);
          }}
          className="bg-white/10 px-6 py-3 rounded-lg"
        >
          Reset
        </button>

        <button
          onClick={() => setFocusMode((prev) => !prev)}
          className="bg-white/10 px-6 py-3 rounded-lg"
        >
          {focusMode ? "Exit Focus" : "Full Focus"}
        </button>
      </div>

      {/* Streak */}
      {!focusMode && (
        <div className="mb-8 text-center">
          <div className="text-3xl">🔥</div>
          <div className="text-sm mt-2">
            {streak} focus sessions today
          </div>
        </div>
      )}

      {/* History */}
      {!focusMode && (
        <div className="w-full max-w-md bg-[#111a2e] p-6 rounded-xl border border-indigo-500/10 max-h-60 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Session History</h2>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-xs text-rose-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {history.length === 0 && (
            <div className="text-sm opacity-60">
              No sessions yet.
            </div>
          )}

          <AnimatePresence>
            {history.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm py-2 border-b border-white/5 flex justify-between"
              >
                <span>
                  {session.mode.toUpperCase()} — {session.duration}m
                </span>
                <span className="opacity-60 text-xs">
                  {new Date(session.date).toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}

export default Pomodoro;
// This page is a standalone Pomodoro timer with focus tracking and session history. It features a circular progress indicator, customizable focus durations, and a simple streak counter. The session history is saved in local storage for persistence.