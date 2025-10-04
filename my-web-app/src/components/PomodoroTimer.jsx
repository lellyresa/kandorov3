import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, FastForward, Cog } from 'lucide-react';

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
      <div
        className="flex flex-col items-center"
        style={{ paddingTop: 16 }}
      >
        <div
          className="w-full flex flex-col items-center"
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 12,
            padding: '32px 24px',
            boxShadow: `${pomodoroState.isActive ? '0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 24px rgba(255, 255, 255, 0.15), ' : ''}0 4px 16px rgba(0, 0, 0, 0.4)`
          }}
        >
          <div
            className="text-white font-bold"
            style={{ fontSize: 64, letterSpacing: '-0.02em', lineHeight: 1 }}
          >
            {formatTime(pomodoroState.timeRemaining)}
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              fontWeight: 500,
              color: '#808080',
              letterSpacing: '0.02em',
              textTransform: 'capitalize',
            }}
          >
            {pomodoroState.isWorkSession ? 'Focus' : 'Break'} • {Math.max(1, Math.round(pomodoroState.timeRemaining / 60))} min
          </div>
          <div className="flex items-center justify-center" style={{ gap: 20, marginTop: 24 }}>
            <button
              onClick={handleStartPause}
              className="rounded-full text-[#666666] hover:text-white transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10"
              style={{ padding: 8 }}
              title={pomodoroState.isActive ? 'Pause' : 'Start'}
            >
              {pomodoroState.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => (pomodoroState.isWorkSession ? switchToBreak() : switchToWorkSession())}
              className="rounded-full text-[#666666] hover:text-white transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10"
              style={{ padding: 8 }}
              title="Skip"
            >
              <FastForward className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="rounded-full text-[#666666] hover:text-white transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10"
              style={{ padding: 8 }}
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              className="rounded-full text-[#666666] hover:text-white transition-all duration-200 ease-in-out hover:scale-110 hover:bg-white/10"
              style={{ padding: 8 }}
              title="Settings"
            >
              <Cog className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#666666',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Today
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#999999' }}>
          {pomodoroState.completedPomodoros} sessions
        </div>
      </div>
    </div>
  );
}
