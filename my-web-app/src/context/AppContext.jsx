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
  INCREMENT_WORK_TIME: 'INCREMENT_WORK_TIME',
  SET_CURRENT_TASK: 'SET_CURRENT_TASK',
  OPEN_TASK_MODAL: 'OPEN_TASK_MODAL',
  CLOSE_TASK_MODAL: 'CLOSE_TASK_MODAL',
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
  taskModal: {
    isOpen: false,
    task: null,
    projectId: null,
  },
};

const toDate = (value) => {
  if (!value) return new Date();
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
};

const cloneTask = (task) => {
  const clonedTask = new Task(
    task.id,
    task.title,
    task.description,
    task.status,
    task.pomodoroCount,
    task.workSeconds ?? 0,
    toDate(task.createdAt)
  );
  clonedTask.updatedAt = toDate(task.updatedAt ?? task.createdAt);
  return clonedTask;
};

const cloneColumn = (column) => {
  const clonedColumn = new Column(
    column.id,
    column.title,
    column.type,
    Array.isArray(column.taskIds) ? [...column.taskIds] : [],
    column.position
  );
  clonedColumn.createdAt = toDate(column.createdAt);
  return clonedColumn;
};

const cloneProject = (project) => {
  const clonedProject = new Project(
    project.id,
    project.name,
    project.description,
    project.columns.map(cloneColumn),
    project.tasks.map(cloneTask)
  );
  clonedProject.createdAt = toDate(project.createdAt);
  clonedProject.updatedAt = toDate(project.updatedAt);
  return clonedProject;
};

const updateProjects = (projects, projectId, updater) =>
  projects.map((project) => {
    if (project.id !== projectId) return project;
    const clonedProject = cloneProject(project);
    updater(clonedProject);
    clonedProject.updatedAt = new Date();
    return clonedProject;
  });

const resolveCurrentTaskId = (projects, preferredTaskId, activeProjectId) => {
  if (!activeProjectId) return null;
  const project = projects.find((p) => p.id === activeProjectId);
  if (!project) return null;

  const activeColumn = project.columns.find((column) => column.type === COLUMN_TYPES.ACTIVE);
  if (!activeColumn) return null;

  const hasTask = (taskId) => taskId && activeColumn.taskIds.includes(taskId);

  if (hasTask(preferredTaskId)) {
    return preferredTaskId;
  }

  return activeColumn.taskIds[0] ?? null;
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PROJECTS: {
      const projects = action.payload;
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, state.activeProjectId);
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.ADD_PROJECT: {
      const projects = [...state.projects, action.payload];
      const activeProjectId = state.activeProjectId ?? action.payload.id;
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, activeProjectId);
      return {
        ...state,
        projects,
        activeProjectId,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.UPDATE_PROJECT: {
      const projects = state.projects.map((project) => {
        if (project.id !== action.payload.id) return project;
        const updatedProject = cloneProject(project);
        updatedProject.update(action.payload);
        return updatedProject;
      });
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, state.activeProjectId);
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.DELETE_PROJECT: {
      const projects = state.projects.filter(project => project.id !== action.payload);
      const activeProjectId =
        state.activeProjectId === action.payload
          ? projects[0]?.id ?? null
          : state.activeProjectId;
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, activeProjectId);
      return {
        ...state,
        projects,
        activeProjectId,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.SET_ACTIVE_PROJECT: {
      const activeProjectId = action.payload;
      const currentTaskId = resolveCurrentTaskId(state.projects, null, activeProjectId);
      return {
        ...state,
        activeProjectId,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.ADD_TASK: {
      const projects = updateProjects(state.projects, action.payload.projectId, (project) => {
        project.addTask(action.payload.task);
      });
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, state.activeProjectId);
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.UPDATE_TASK: {
      const projects = updateProjects(state.projects, action.payload.projectId, (project) => {
        const task = project.getTaskById(action.payload.task.id);
        if (task) task.update(action.payload.task);
      });
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, state.activeProjectId);

      // Update the modal task if it's the same task being updated
      let taskModal = state.taskModal;
      if (taskModal.isOpen && taskModal.task && taskModal.task.id === action.payload.task.id) {
        taskModal = {
          ...taskModal,
          task: { ...action.payload.task }, // Create new reference to trigger re-render
        };
      }

      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
        taskModal,
      };
    }

    case ACTIONS.DELETE_TASK: {
      const projects = updateProjects(state.projects, action.payload.projectId, (project) => {
        project.removeTask(action.payload.taskId);
      });
      const currentTaskId = resolveCurrentTaskId(
        projects,
        state.pomodoroState.currentTaskId === action.payload.taskId ? null : state.pomodoroState.currentTaskId,
        state.activeProjectId
      );
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.MOVE_TASK: {
      const projects = updateProjects(state.projects, action.payload.projectId, (project) => {
        project.moveTaskToColumn(action.payload.taskId, action.payload.targetColumnId);
      });
      const currentTaskId = resolveCurrentTaskId(
        projects,
        state.pomodoroState.currentTaskId,
        state.activeProjectId
      );
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.ADD_COLUMN: {
      const projects = updateProjects(state.projects, action.payload.projectId, (project) => {
        if (!project.getColumnById(action.payload.column.id)) {
          project.addColumn(action.payload.column);
        }
      });
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, state.activeProjectId);
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.UPDATE_COLUMN: {
      const projects = updateProjects(state.projects, action.payload.projectId, (project) => {
        const column = project.getColumnById(action.payload.column.id);
        if (column) column.update(action.payload.column);
      });
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, state.activeProjectId);
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.DELETE_COLUMN: {
      const projects = updateProjects(state.projects, action.payload.projectId, (project) => {
        project.removeColumn(action.payload.columnId);
      });
      const currentTaskId = resolveCurrentTaskId(projects, state.pomodoroState.currentTaskId, state.activeProjectId);
      return {
        ...state,
        projects,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId,
        },
      };
    }

    case ACTIONS.INCREMENT_WORK_TIME:
      return {
        ...state,
        projects: updateProjects(state.projects, action.payload.projectId, (project) => {
          const task = project.getTaskById(action.payload.taskId);
          if (task) {
            task.workSeconds = (task.workSeconds ?? 0) + action.payload.seconds;
          }
        }),
      };

    case ACTIONS.SET_CURRENT_TASK:
      return {
        ...state,
        pomodoroState: {
          ...state.pomodoroState,
          currentTaskId: action.payload,
        },
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

    case ACTIONS.OPEN_TASK_MODAL:
      return {
        ...state,
        taskModal: {
          isOpen: true,
          task: action.payload.task,
          projectId: action.payload.projectId,
        },
      };

    case ACTIONS.CLOSE_TASK_MODAL:
      return {
        ...state,
        taskModal: {
          isOpen: false,
          task: null,
          projectId: null,
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
              new Task(
                taskData.id,
                taskData.title,
                taskData.description,
                taskData.status,
                taskData.pomodoroCount,
                taskData.workSeconds ?? 0,
                taskData.createdAt
              )
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
    incrementWorkTime: (projectId, taskId, seconds = 1) =>
      dispatch({ type: ACTIONS.INCREMENT_WORK_TIME, payload: { projectId, taskId, seconds } }),
    setCurrentTask: (taskId) => dispatch({ type: ACTIONS.SET_CURRENT_TASK, payload: taskId }),
    openTaskModal: (task, projectId) => dispatch({ type: ACTIONS.OPEN_TASK_MODAL, payload: { task, projectId } }),
    closeTaskModal: () => dispatch({ type: ACTIONS.CLOSE_TASK_MODAL }),
  };

  const value = {
    state,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
