import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, FastForward, Rewind, Cog } from 'lucide-react';

export default function PomodoroTimer() {
  const { state, actions } = useApp();
  const { pomodoroState } = state;
  const activeProjectId = state.activeProjectId;
  const currentTaskId = pomodoroState.currentTaskId;

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (pomodoroState.isActive && pomodoroState.timeRemaining > 0) {
      interval = setInterval(() => {
        actions.updatePomodoroTime(pomodoroState.timeRemaining - 1);
        if (pomodoroState.isWorkSession && activeProjectId && currentTaskId) {
          actions.incrementWorkTime(activeProjectId, currentTaskId, 1);
        }
      }, 1000);
    } else if (pomodoroState.timeRemaining === 0 && pomodoroState.isActive) {
      // Timer finished
      actions.resetPomodoro();
      // TODO: Show notification or sound
    }

    return () => clearInterval(interval);
  }, [
    pomodoroState.isActive,
    pomodoroState.timeRemaining,
    pomodoroState.isWorkSession,
    activeProjectId,
    currentTaskId,
    actions
  ]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (pomodoroState.isActive) {
      actions.setPomodoroState({ isActive: false });
    } else {
      actions.setPomodoroState({ isActive: true });
    }
  };

  const handleReset = () => {
    actions.resetPomodoro();
  };

  const switchToWorkSession = () => {
    actions.setPomodoroState({
      isActive: false,
      isWorkSession: true,
      timeRemaining: 25 * 60,
    });
  };

  const switchToBreak = () => {
    actions.setPomodoroState({
      isActive: false,
      isWorkSession: false,
      timeRemaining: 5 * 60,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between text-gray-500 text-xs uppercase tracking-[0.35em]">
        <span>{pomodoroState.isWorkSession ? 'Focus' : 'Break'}</span>
        <button className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors" title="Timer settings">
          <Cog className="w-4 h-4" />
        </button>
      </div>

      <div
        className="rounded-3xl bg-gray-900/70 border border-gray-800/60 px-6 py-8 shadow-dark-medium flex flex-col items-center gap-6"
        style={
          pomodoroState.isActive
            ? {
                boxShadow:
                  '0 0 0 2px rgba(14, 165, 233, 0.25), 0 12px 30px rgba(14, 165, 233, 0.12)'
              }
            : undefined
        }
      >
        <div className="text-6xl md:text-7xl font-semibold tracking-tight text-white">
          {formatTime(pomodoroState.timeRemaining)}
        </div>
        <div className="text-xs tracking-[0.4em] uppercase text-gray-500">
          {pomodoroState.isWorkSession ? 'Focus Session' : 'Break Session'}
        </div>
        <div className="flex items-center gap-5 text-gray-300">
          <button
            onClick={switchToWorkSession}
            className="p-2.5 rounded-full hover:bg-gray-800 transition-colors"
            title="Previous"
          >
            <Rewind className="w-5 h-5" />
          </button>
          <button
            onClick={handleStartPause}
            className="p-4 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
            title={pomodoroState.isActive ? 'Pause' : 'Start'}
          >
            {pomodoroState.isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={switchToBreak}
            className="p-2.5 rounded-full hover:bg-gray-800 transition-colors"
            title="Next"
          >
            <FastForward className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-full hover:bg-gray-800 transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-[0.2em]">
        <span>Today</span>
        <span>{pomodoroState.completedPomodoros} sessions</span>
      </div>
    </div>
  );
}
