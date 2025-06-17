import { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../api';
import { 
  getTasksByCategory, 
  getTodayTasks, 
  getImportantTasks, 
  getExtraTasks,
  addTaskToOrder as addTaskToOrderUtil,
  removeTaskFromOrder as removeTaskFromOrderUtil,
  reorderTask as reorderTaskUtil
} from '../taskUtils';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [todaySections, setTodaySections] = useState({});
  const [taskOrder, setTaskOrder] = useState({ important: [], extra: [] });
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const data = await taskAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, []);

  // Task CRUD operations
  const addTask = useCallback(async (taskData) => {
    try {
      await taskAPI.create(taskData);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      await taskAPI.update(taskId, updates);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskAPI.delete(taskId);
      removeTaskFromOrderUtil(taskId, taskOrder, setTaskOrder);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [fetchTasks, taskOrder]);

  const toggleTask = useCallback(async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  // Subtask operations
  const addSubtask = useCallback(async (taskId, title) => {
    try {
      await taskAPI.addSubtask(taskId, title);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  }, [fetchTasks]);

  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(st => st.id === subtaskId);
    if (subtask) {
      try {
        await taskAPI.updateSubtask(subtaskId, { completed: !subtask.completed });
        await fetchTasks();
      } catch (error) {
        console.error('Failed to toggle subtask:', error);
      }
    }
  }, [tasks, fetchTasks]);

  // Task expansion
  const toggleTaskExpansion = useCallback((taskId) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // Task editing
  const startEditingTask = useCallback((task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      category: task.category,
      dueDate: task.dueDate || '',
      doDate: task.doDate || '',
      isEphemeral: task.isEphemeral,
      notes: task.notes || ''
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingTask(null);
    setEditForm({});
  }, []);

  const saveTaskEdit = useCallback(async () => {
    if (editingTask) {
      await updateTask(editingTask, editForm);
      setEditingTask(null);
      setEditForm({});
    }
  }, [editingTask, editForm, updateTask]);

  // Title editing
  const startTitleEdit = useCallback((taskId, title) => {
    setEditingTitle(taskId);
    setEditingTitleValue(title);
  }, []);

  const cancelTitleEdit = useCallback(() => {
    setEditingTitle(null);
    setEditingTitleValue('');
  }, []);

  const saveTitleEdit = useCallback(async () => {
    if (editingTitle && editingTitleValue.trim()) {
      await updateTask(editingTitle, { title: editingTitleValue.trim() });
    }
    setEditingTitle(null);
    setEditingTitleValue('');
  }, [editingTitle, editingTitleValue, updateTask]);

  // Task ordering and sections
  const addTaskToOrder = useCallback((taskId, section) => {
    addTaskToOrderUtil(taskId, section, taskOrder, setTaskOrder);
  }, [taskOrder]);

  const removeTaskFromOrder = useCallback((taskId) => {
    removeTaskFromOrderUtil(taskId, taskOrder, setTaskOrder);
  }, [taskOrder]);

  const reorderTask = useCallback((draggedId, targetIndex, section) => {
    reorderTaskUtil(draggedId, targetIndex, section, tasks, todaySections, taskOrder, setTaskOrder);
  }, [tasks, todaySections, taskOrder]);

  // Task filtering functions
  const getTasksByCategoryFunc = useCallback((categoryId) => {
    return getTasksByCategory(tasks, categoryId);
  }, [tasks]);

  const getTodayTasksFunc = useCallback(() => {
    return getTodayTasks(tasks);
  }, [tasks]);

  const getImportantTasksFunc = useCallback(() => {
    return getImportantTasks(tasks, todaySections, taskOrder);
  }, [tasks, todaySections, taskOrder]);

  const getExtraTasksFunc = useCallback(() => {
    return getExtraTasks(tasks, todaySections, taskOrder);
  }, [tasks, todaySections, taskOrder]);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    // State
    tasks,
    todaySections,
    setTodaySections,
    taskOrder,
    setTaskOrder,
    expandedTasks,
    editingTask,
    editForm,
    setEditForm,
    editingTitle,
    editingTitleValue,
    setEditingTitleValue,
    
    // Actions
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addSubtask,
    toggleSubtask,
    toggleTaskExpansion,
    startEditingTask,
    cancelEdit,
    saveTaskEdit,
    startTitleEdit,
    cancelTitleEdit,
    saveTitleEdit,
    addTaskToOrder,
    removeTaskFromOrder,
    reorderTask,
    
    // Computed values
    getTasksByCategory: getTasksByCategoryFunc,
    getTodayTasks: getTodayTasksFunc,
    getImportantTasks: getImportantTasksFunc,
    getExtraTasks: getExtraTasksFunc
  };
};