import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Project, Column, Task, COLUMN_TYPES, TASK_STATUS } from '../types';

// Action types
const ACTIONS = {
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_ACTIVE_PROJECT: 'SET_ACTIVE_PROJECT',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  MOVE_TASK: 'MOVE_TASK',
  ADD_COLUMN: 'ADD_COLUMN',
  UPDATE_COLUMN: 'UPDATE_COLUMN',
  DELETE_COLUMN: 'DELETE_COLUMN',
  SET_POMODORO_STATE: 'SET_POMODORO_STATE',
  UPDATE_POMODORO_TIME: 'UPDATE_POMODORO_TIME',
  RESET_POMODORO: 'RESET_POMODORO',
};

// Initial state
const initialState = {
  projects: [],
  activeProjectId: null,
  pomodoroState: {
    isActive: false,
    timeRemaining: 25 * 60, // 25 minutes in seconds
    currentTaskId: null,
    isWorkSession: true,
    completedPomodoros: 0,
  },
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PROJECTS:
      return { ...state, projects: action.payload };

    case ACTIONS.ADD_PROJECT:
      return { ...state, projects: [...state.projects, action.payload] };

    case ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? project.update(action.payload) : project
        ),
      };

    case ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        activeProjectId: state.activeProjectId === action.payload ? null : state.activeProjectId,
      };

    case ACTIONS.SET_ACTIVE_PROJECT:
      return { ...state, activeProjectId: action.payload };

    case ACTIONS.ADD_TASK:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? (() => {
                project.addTask(action.payload.task);
                return project;
              })()
            : project
        ),
      };

    case ACTIONS.UPDATE_TASK:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? (() => {
                const task = project.getTaskById(action.payload.task.id);
                if (task) task.update(action.payload.task);
                return project;
              })()
            : project
        ),
      };

    case ACTIONS.DELETE_TASK:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? (() => {
                project.removeTask(action.payload.taskId);
                return project;
              })()
            : project
        ),
      };

    case ACTIONS.MOVE_TASK:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? (() => {
                project.moveTaskToColumn(action.payload.taskId, action.payload.targetColumnId);
                return project;
              })()
            : project
        ),
      };

    case ACTIONS.ADD_COLUMN:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? (() => {
                project.addColumn(action.payload.column);
                return project;
              })()
            : project
        ),
      };

    case ACTIONS.UPDATE_COLUMN:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? (() => {
                const column = project.getColumnById(action.payload.column.id);
                if (column) column.update(action.payload.column);
                return project;
              })()
            : project
        ),
      };

    case ACTIONS.DELETE_COLUMN:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? (() => {
                project.removeColumn(action.payload.columnId);
                return project;
              })()
            : project
        ),
      };

    case ACTIONS.SET_POMODORO_STATE:
      return {
        ...state,
        pomodoroState: { ...state.pomodoroState, ...action.payload },
      };

    case ACTIONS.UPDATE_POMODORO_TIME:
      return {
        ...state,
        pomodoroState: {
          ...state.pomodoroState,
          timeRemaining: action.payload,
        },
      };

    case ACTIONS.RESET_POMODORO:
      return {
        ...state,
        pomodoroState: {
          isActive: false,
          timeRemaining: 25 * 60,
          currentTaskId: null,
          isWorkSession: true,
          completedPomodoros: state.pomodoroState.isActive
            ? state.pomodoroState.completedPomodoros + 1
            : state.pomodoroState.completedPomodoros,
        },
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('kandoro-projects');
    const savedActiveProject = localStorage.getItem('kandoro-active-project');

    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects).map(projectData => {
          const project = new Project(
            projectData.id,
            projectData.name,
            projectData.description
          );

          // Restore columns
          if (projectData.columns) {
            project.columns = projectData.columns.map(colData =>
              new Column(colData.id, colData.title, colData.type, colData.taskIds, colData.position)
            );
          }

          // Restore tasks
          if (projectData.tasks) {
            project.tasks = projectData.tasks.map(taskData =>
              new Task(taskData.id, taskData.title, taskData.description, taskData.status, taskData.pomodoroCount)
            );
          }

          return project;
        });

        dispatch({ type: ACTIONS.SET_PROJECTS, payload: projects });

        if (savedActiveProject) {
          dispatch({ type: ACTIONS.SET_ACTIVE_PROJECT, payload: savedActiveProject });
        }
      } catch (error) {
        console.error('Error loading saved projects:', error);
      }
    } else {
      // Create default project if none exists
      const defaultProject = createDefaultProject();
      dispatch({ type: ACTIONS.ADD_PROJECT, payload: defaultProject });
      dispatch({ type: ACTIONS.SET_ACTIVE_PROJECT, payload: defaultProject.id });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.projects.length > 0) {
      localStorage.setItem('kandoro-projects', JSON.stringify(state.projects));
    }
    if (state.activeProjectId) {
      localStorage.setItem('kandoro-active-project', state.activeProjectId);
    }
  }, [state.projects, state.activeProjectId]);

  // Helper function to create default project
  function createDefaultProject() {
    const project = new Project(
      'default-project',
      'My Project',
      'Default project with sample tasks'
    );

    // Create default columns
    const columns = [
      new Column('active-column', 'Now Working', COLUMN_TYPES.ACTIVE, [], 0),
      new Column('todo-column', 'To Do', COLUMN_TYPES.TODO, [], 1),
      new Column('in-progress-column', 'In Progress', COLUMN_TYPES.IN_PROGRESS, [], 2),
      new Column('done-column', 'Done', COLUMN_TYPES.DONE, [], 3),
    ];

    columns.forEach(column => project.addColumn(column));

    // Add sample tasks
    const tasks = [
      new Task('task-1', 'Set up project structure', 'Initialize the Kanban-Pomodoro app'),
      new Task('task-2', 'Design user interface', 'Create modern, clean UI components'),
      new Task('task-3', 'Implement drag and drop', 'Add task movement functionality'),
    ];

    tasks.forEach(task => project.addTask(task));
    project.getColumnById('todo-column').addTask('task-1');
    project.getColumnById('todo-column').addTask('task-2');
    project.getColumnById('in-progress-column').addTask('task-3');

    return project;
  }

  // Action creators
  const actions = {
    // Project actions
    addProject: (project) => dispatch({ type: ACTIONS.ADD_PROJECT, payload: project }),
    updateProject: (project) => dispatch({ type: ACTIONS.UPDATE_PROJECT, payload: project }),
    deleteProject: (projectId) => dispatch({ type: ACTIONS.DELETE_PROJECT, payload: projectId }),
    setActiveProject: (projectId) => dispatch({ type: ACTIONS.SET_ACTIVE_PROJECT, payload: projectId }),

    // Task actions
    addTask: (projectId, task) => dispatch({ type: ACTIONS.ADD_TASK, payload: { projectId, task } }),
    updateTask: (projectId, task) => dispatch({ type: ACTIONS.UPDATE_TASK, payload: { projectId, task } }),
    deleteTask: (projectId, taskId) => dispatch({ type: ACTIONS.DELETE_TASK, payload: { projectId, taskId } }),
    moveTask: (projectId, taskId, targetColumnId) =>
      dispatch({ type: ACTIONS.MOVE_TASK, payload: { projectId, taskId, targetColumnId } }),

    // Column actions
    addColumn: (projectId, column) => dispatch({ type: ACTIONS.ADD_COLUMN, payload: { projectId, column } }),
    updateColumn: (projectId, column) => dispatch({ type: ACTIONS.UPDATE_COLUMN, payload: { projectId, column } }),
    deleteColumn: (projectId, columnId) => dispatch({ type: ACTIONS.DELETE_COLUMN, payload: { projectId, columnId } }),

    // Pomodoro actions
    setPomodoroState: (pomodoroState) => dispatch({ type: ACTIONS.SET_POMODORO_STATE, payload: pomodoroState }),
    updatePomodoroTime: (timeRemaining) => dispatch({ type: ACTIONS.UPDATE_POMODORO_TIME, payload: timeRemaining }),
    resetPomodoro: () => dispatch({ type: ACTIONS.RESET_POMODORO }),
  };

  const value = {
    state,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

