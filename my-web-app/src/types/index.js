// Data types for the Kanban-Pomodoro app

export const COLUMN_TYPES = {
  ACTIVE: 'active',
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  CUSTOM: 'custom'
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
};

// Task model
export class Task {
  constructor(id, title, description = '', status = TASK_STATUS.TODO, pomodoroCount = 0, createdAt = new Date()) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.pomodoroCount = pomodoroCount;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
  }

  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      pomodoroCount: this.pomodoroCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Column model
export class Column {
  constructor(id, title, type = COLUMN_TYPES.TODO, taskIds = [], position = 0) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.taskIds = taskIds;
    this.position = position;
    this.createdAt = new Date();
  }

  update(data) {
    Object.assign(this, data);
    return this;
  }

  addTask(taskId) {
    if (!this.taskIds.includes(taskId)) {
      this.taskIds.push(taskId);
    }
  }

  removeTask(taskId) {
    this.taskIds = this.taskIds.filter(id => id !== taskId);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      taskIds: this.taskIds,
      position: this.position,
      createdAt: this.createdAt
    };
  }
}

// Project model
export class Project {
  constructor(id, name, description = '', columns = [], tasks = []) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.columns = columns;
    this.tasks = tasks;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
    return this;
  }

  addColumn(column) {
    this.columns.push(column);
    this.columns.sort((a, b) => a.position - b.position);
  }

  removeColumn(columnId) {
    this.columns = this.columns.filter(col => col.id !== columnId);
  }

  addTask(task) {
    this.tasks.push(task);
  }

  removeTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    // Remove task from all columns
    this.columns.forEach(col => col.removeTask(taskId));
  }

  getColumnById(columnId) {
    return this.columns.find(col => col.id === columnId);
  }

  getTaskById(taskId) {
    return this.tasks.find(task => task.id === taskId);
  }

  getTasksByColumn(columnId) {
    const column = this.getColumnById(columnId);
    if (!column) return [];
    return column.taskIds.map(taskId => this.getTaskById(taskId)).filter(Boolean);
  }

  moveTaskToColumn(taskId, targetColumnId) {
    const task = this.getTaskById(taskId);
    if (!task) return;

    // Remove from current column
    this.columns.forEach(col => col.removeTask(taskId));

    // Add to target column
    const targetColumn = this.getColumnById(targetColumnId);
    if (targetColumn) {
      targetColumn.addTask(taskId);
      task.status = targetColumn.type === COLUMN_TYPES.ACTIVE ? TASK_STATUS.IN_PROGRESS : TASK_STATUS.TODO;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      columns: this.columns.map(col => col.toJSON()),
      tasks: this.tasks.map(task => task.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

