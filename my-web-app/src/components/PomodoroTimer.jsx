import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

export default function PomodoroTimer() {
  const { state, actions } = useApp();
  const { pomodoroState } = state;

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (pomodoroState.isActive && pomodoroState.timeRemaining > 0) {
      interval = setInterval(() => {
        actions.updatePomodoroTime(pomodoroState.timeRemaining - 1);
      }, 1000);
    } else if (pomodoroState.timeRemaining === 0 && pomodoroState.isActive) {
      // Timer finished
      actions.resetPomodoro();
      // TODO: Show notification or sound
    }

    return () => clearInterval(interval);
  }, [pomodoroState.isActive, pomodoroState.timeRemaining, actions]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalTime = pomodoroState.isWorkSession ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - pomodoroState.timeRemaining) / totalTime) * 100;

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

  const handleSkip = () => {
    actions.resetPomodoro();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-danger-500/20">
            <Coffee className="w-4 h-4 text-danger-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">
              {pomodoroState.isWorkSession ? 'Work Session' : 'Break Time'}
            </h3>
            <p className="text-sm text-gray-400">
              {pomodoroState.completedPomodoros} completed today
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-accent-400 rounded-lg hover:bg-gray-800/60 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSkip}
            className="px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/60 transition-colors font-medium"
          >
            Skip
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl font-mono font-bold text-white tracking-tight">
          {formatTime(pomodoroState.timeRemaining)}
        </div>

        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
            <path
              d="M21 2.5
                a 18.5 18.5 0 0 1 0 37
                a 18.5 18.5 0 0 1 0 -37"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
            />
            <path
              d="M21 2.5
                a 18.5 18.5 0 0 1 0 37
                a 18.5 18.5 0 0 1 0 -37"
              fill="none"
              stroke={pomodoroState.isWorkSession ? '#ef4444' : '#22c55e'}
              strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-300">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleStartPause}
          className={`flex items-center space-x-2 px-7 py-3 rounded-xl font-semibold transition-all duration-200 shadow-dark-medium hover:shadow-dark-large ${
            pomodoroState.isActive
              ? 'bg-warning-500 text-white hover:bg-warning-600'
              : 'bg-success-500 text-white hover:bg-success-600'
          }`}
        >
          {pomodoroState.isActive ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start</span>
            </>
          )}
        </button>
      </div>

      <div className="pt-3 border-t border-gray-700/40 flex justify-between text-sm text-gray-400 font-medium">
        <span>Current: {pomodoroState.isWorkSession ? '25 min work' : '5 min break'}</span>
        <span>Next: {pomodoroState.isWorkSession ? '5 min break' : '25 min work'}</span>
      </div>
    </div>
  );
}
