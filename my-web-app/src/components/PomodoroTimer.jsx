import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

export default function PomodoroTimer() {
  const { state, actions } = useApp();
  const { pomodoroState } = state;
  const [isRunning, setIsRunning] = useState(false);

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
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-soft hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg">
            <Coffee className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {pomodoroState.isWorkSession ? 'Work Session' : 'Break Time'}
            </h3>
            <p className="text-sm text-gray-500">
              {pomodoroState.completedPomodoros} completed today
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSkip}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="relative mb-4">
        <div className="text-center">
          <div className="text-5xl font-mono font-bold text-gray-900 mb-3 tracking-tight">
            {formatTime(pomodoroState.timeRemaining)}
          </div>

          {/* Progress Ring */}
          <div className="relative w-36 h-36 mx-auto">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 42 42">
              {/* Background circle */}
              <path
                d="M21 2.5
                  a 18.5 18.5 0 0 1 0 37
                  a 18.5 18.5 0 0 1 0 -37"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="2"
              />
              {/* Progress circle */}
              <path
                d="M21 2.5
                  a 18.5 18.5 0 0 1 0 37
                  a 18.5 18.5 0 0 1 0 -37"
                fill="none"
                stroke={pomodoroState.isWorkSession ? "#ef4444" : "#10b981"}
                strokeWidth="2"
                strokeDasharray={`${progress}, 100`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <button
          onClick={handleStartPause}
          className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-medium hover:shadow-large ${
            pomodoroState.isActive
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-green-600 text-white hover:bg-green-700'
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

      {/* Session Info */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>Current: {pomodoroState.isWorkSession ? '25 min work' : '5 min break'}</span>
          <span>Next: {pomodoroState.isWorkSession ? '5 min break' : '25 min work'}</span>
        </div>
      </div>
    </div>
  );
}
