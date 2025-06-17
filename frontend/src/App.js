// src/App.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import {
  Plus,
  Calendar,
  Star,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit3,
  Link,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  Layers,
  Menu
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const TayraApp = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentView, setCurrentView] = useState('today');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const selectedDate = new Date().toISOString().split('T')[0];
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [todaySections, setTodaySections] = useState({});
  const [taskOrder, setTaskOrder] = useState({ important: [], extra: [] });
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const editInputRef = useRef(null);
  const [categoryHover, setCategoryHover] = useState({});

  // API functions
  const fetchTasks = async () => {
    const response = await fetch(`${API_BASE}/tasks`);
    const data = await response.json();
    setTasks(data);
  };

  const fetchCategories = async () => {
    const response = await fetch(`${API_BASE}/categories`);
    const data = await response.json();
    setCategories(data);
  };


  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setShowQuickAdd(true);
      }
      if (e.key === 'Escape') {
        setShowQuickAdd(false);
        setQuickAddText('');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const addTask = useCallback(async (taskData) => {
    const newTask = {
      title: taskData.title || quickAddText,
      description: taskData.description || '',
      category: taskData.category || 'default',
      dueDate: taskData.dueDate || null,
      doDate: taskData.doDate || null,
      isEphemeral: taskData.isEphemeral || false,
      notes: taskData.notes || ''
    };

    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });

    if (response.ok) {
      fetchTasks();
      setQuickAddText('');
      setShowQuickAdd(false);
    }
  }, [quickAddText]);

  const updateTask = useCallback(async (taskId, updates) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (response.ok) {
      fetchTasks();
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchTasks();
    }
  }, []);

  const toggleTask = useCallback(async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(st => st.id === subtaskId);

    if (subtask) {
      const response = await fetch(`${API_BASE}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !subtask.completed })
      });

      if (response.ok) {
        fetchTasks();
      }
    }
  }, [tasks]);

  const addSubtask = useCallback(async (taskId, subtaskTitle) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: subtaskTitle })
    });

    if (response.ok) {
      fetchTasks();
    }
  }, []);

  const startEditingTask = useCallback((task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.dueDate || '',
      doDate: task.doDate || '',
      notes: task.notes,
      isEphemeral: task.isEphemeral
    });
  }, []);

  const saveTaskEdit = useCallback(async () => {
    if (editingTask) {
      await updateTask(editingTask, {
        ...editForm,
        dueDate: editForm.dueDate || null,
        doDate: editForm.doDate || null
      });
      setEditingTask(null);
      setEditForm({});
    }
  }, [editingTask, editForm, updateTask]);

  const cancelEdit = useCallback(() => {
    setEditingTask(null);
    setEditForm({});
  }, []);

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.doDate === today && !task.completed);
  };

  const getImportantTasks = () => {
    const importantTasks = getTodayTasks().filter(task =>
      todaySections[task.id] === 'important' || !todaySections[task.id]
    );
    // Sort by order if available, otherwise by creation order
    return importantTasks.sort((a, b) => {
      const aIndex = taskOrder.important.indexOf(a.id);
      const bIndex = taskOrder.important.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const getExtraTasks = () => {
    const extraTasks = getTodayTasks().filter(task => todaySections[task.id] === 'extra');
    // Sort by order if available, otherwise by creation order
    return extraTasks.sort((a, b) => {
      const aIndex = taskOrder.extra.indexOf(a.id);
      const bIndex = taskOrder.extra.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const getAvailableTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task =>
      !task.completed &&
      (!task.doDate || task.doDate !== today) &&
      task.dependencies.every(depId =>
        tasks.find(t => t.id === depId)?.completed
      )
    );
  };

  const getCategoryColor = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#6B7280';
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const addTaskToOrder = (taskId, section) => {
    setTaskOrder(prev => ({
      ...prev,
      [section]: prev[section].includes(taskId) ? prev[section] : [...prev[section], taskId]
    }));
  };

  const removeTaskFromOrder = (taskId) => {
    setTaskOrder(prev => ({
      important: prev.important.filter(id => id !== taskId),
      extra: prev.extra.filter(id => id !== taskId)
    }));
  };

  const reorderTask = (taskId, targetIndex, section) => {
    setTaskOrder(prev => {
      const newOrder = [...prev[section]];
      const currentIndex = newOrder.indexOf(taskId);
      
      if (currentIndex !== -1) {
        newOrder.splice(currentIndex, 1);
      }
      newOrder.splice(targetIndex, 0, taskId);
      
      return {
        ...prev,
        [section]: newOrder
      };
    });
  };

  const startTitleEdit = (taskId, currentTitle) => {
    setEditingTitle(taskId);
    setEditingTitleValue(currentTitle);
  };

  const saveTitleEdit = async () => {
    if (editingTitle && editingTitleValue.trim()) {
      await updateTask(editingTitle, { title: editingTitleValue.trim() });
      setEditingTitle(null);
      setEditingTitleValue('');
    }
  };

  const cancelTitleEdit = () => {
    setEditingTitle(null);
    setEditingTitleValue('');
  };

  const addCategory = useCallback(async (categoryData) => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });

    if (response.ok) {
      fetchCategories();
    }
  }, []);

  const updateCategory = useCallback(async (categoryId, updates) => {
    const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (response.ok) {
      fetchCategories();
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    console.log('Deleting category:', categoryId);
    console.log('Tasks before deletion:', tasks.length);
    
    const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('Category deleted successfully, refreshing data...');
      await fetchCategories();
      await fetchTasks(); // Also refresh tasks to see the updated category assignments
      console.log('Data refreshed');
    } else {
      console.error('Failed to delete category:', response.status);
    }
  }, [tasks]);

  const getTasksByCategory = (categoryId) => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task =>
      !task.completed &&
      task.category === categoryId &&
      (!task.doDate || task.doDate !== today)
    );
  };

  const TaskItem = ({ task, showCategory = true, dragSource = 'today-task', onReorder = null, sectionType = null }) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks.length > 0;
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const isEditing = editingTask === task.id;

    if (isEditing) {
      return (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3 mb-2 shadow-sm">
          <div className="space-y-3">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Task title"
            />

            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Description (optional)"
              rows="2"
            />

            <div>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Do Date</label>
                <input
                  type="date"
                  value={editForm.doDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, doDate: e.target.value }))}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`ephemeral-${task.id}`}
                checked={editForm.isEphemeral}
                onChange={(e) => setEditForm(prev => ({ ...prev, isEphemeral: e.target.checked }))}
                className="w-3 h-3"
              />
              <label htmlFor={`ephemeral-${task.id}`} className="text-xs text-gray-600">
                Ephemeral (delete if not completed today)
              </label>
            </div>

            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Notes (optional)"
              rows="2"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveTaskEdit}
                className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="bg-white border border-gray-200 rounded-lg p-2 mb-1 shadow-sm hover:shadow-md transition-shadow group cursor-move"
        draggable={editingTitle === task.id ? false : true}
        onDragStart={(e) => {
          if (editingTitle === task.id) {
            e.preventDefault();
            return;
          }
          e.dataTransfer.setData('taskId', task.id);
          e.dataTransfer.setData('source', dragSource);
          if (sectionType) {
            e.dataTransfer.setData('sectionType', sectionType);
          }
        }}
        onDragOver={(e) => {
          if (onReorder && editingTitle !== task.id) {
            e.preventDefault();
          }
        }}
        onDrop={(e) => {
          if (onReorder && editingTitle !== task.id) {
            e.preventDefault();
            const draggedTaskId = e.dataTransfer.getData('taskId');
            const draggedSection = e.dataTransfer.getData('sectionType');
            
            if (draggedTaskId !== task.id && draggedSection === sectionType) {
              onReorder(draggedTaskId, task.id);
            }
          }
        }}
      >
        <div className="flex items-start gap-2">
          <button
            onClick={() => toggleTask(task.id)}
            className="mt-0.5 text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
          >
            {task.completed ?
              <CheckCircle2 className="w-4 h-4 text-green-500" /> :
              <Circle className="w-4 h-4" />
            }
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {hasSubtasks && (
                    <button
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {isExpanded ?
                        <ChevronDown className="w-3 h-3" /> :
                        <ChevronRight className="w-3 h-3" />
                      }
                    </button>
                  )}
                  {editingTitle === task.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitleValue}
                      onChange={(e) => {
                        const cursorPosition = e.target.selectionStart;
                        setEditingTitleValue(e.target.value);
                        // Restore cursor position after state update
                        setTimeout(() => {
                          if (editInputRef.current) {
                            editInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
                          }
                        }, 0);
                      }}
                      onBlur={saveTitleEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveTitleEdit();
                        } else if (e.key === 'Escape') {
                          cancelTitleEdit();
                        }
                      }}
                      className="font-medium text-sm leading-tight bg-transparent border-none outline-none flex-1 text-gray-900 focus:outline-none appearance-none"
                      style={{ 
                        boxShadow: 'none',
                        WebkitAppearance: 'none',
                        borderRadius: 0,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        margin: 0,
                        pointerEvents: 'auto',
                        cursor: 'text'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                      }}
                      autoFocus
                    />
                  ) : (
                    <h3 
                      className={`font-medium text-sm leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'} cursor-pointer min-w-0`}
                      onDoubleClick={() => startTitleEdit(task.id, task.title)}
                    >
                      {task.title}
                    </h3>
                  )}

                  {/* Metadata - only shows when hovering, inline */}
                  <div className="hidden group-hover:flex items-center gap-2 text-xs text-gray-500">
                    {showCategory && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-white text-xs"
                        style={{ backgroundColor: getCategoryColor(task.category) }}
                      >
                        {categories.find(cat => cat.id === task.category)?.name}
                      </span>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                    )}

                    {task.doDate && (
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{task.doDate}</span>
                      </div>
                    )}

                    {hasSubtasks && (
                      <span>{completedSubtasks}/{task.subtasks.length}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {task.isEphemeral && (
                      <Zap className="w-3 h-3 text-orange-500" />
                    )}
                  </div>
                </div>

                {task.description && !isExpanded && (
                  <p className="text-xs text-gray-600 truncate opacity-0 group-hover:opacity-100 transition-opacity">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                <button
                  onClick={() => startEditingTask(task)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Edit task"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this task?')) {
                      deleteTask(task.id);
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                  title="Delete task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 p-1" title="Copy link">
                  <Link className="w-3 h-3" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-2 space-y-2">
                {task.description && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{task.description}</p>
                )}

                {hasSubtasks && (
                  <div className="ml-2 space-y-1">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSubtask(task.id, subtask.id)}
                          className="text-gray-400 hover:text-blue-500 flex-shrink-0"
                        >
                          {subtask.completed ?
                            <CheckCircle2 className="w-3 h-3 text-green-500" /> :
                            <Circle className="w-3 h-3" />
                          }
                        </button>
                        <span className={`text-xs ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'} truncate`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const title = prompt('Enter subtask title:');
                        if (title) addSubtask(task.id, title);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 ml-4"
                    >
                      + Add subtask
                    </button>
                  </div>
                )}

                {task.notes && (
                  <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <strong>Notes:</strong> {task.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full Width */}
      <header className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('today')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'today'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentView('all')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  All Tasks
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setCurrentView('today');
                  setSidebarOpen(true);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Plan Day
              </button>
              <button
                onClick={() => setShowQuickAdd(true)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Layout Container */}
      <div className="flex">
        {/* Left Sidebar - Positioned under header */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-12'} transition-all duration-300 bg-blue-500 text-white flex flex-col min-h-screen`}>
          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-4">
              {/* Hamburger Menu - Always Visible */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-8 h-8 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 border border-blue-300 rounded-md shadow-sm"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              {sidebarOpen && (
                <>
                  <button
                    onClick={() => setCurrentView('today')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'today'
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-100 hover:text-white hover:bg-blue-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Today
                    </div>
                    <span className="text-sm">{getTodayTasks().length}</span>
                  </button>

                  {/* Categories */}
                  <div className="space-y-3">
                    {categories.map(category => (
                      <div 
                        key={category.id} 
                        className="bg-blue-600 rounded-md p-3"
                      >
                        <div 
                          className="flex items-center justify-between mb-2"
                          onMouseEnter={() => {
                            setCategoryHover(prev => ({ ...prev, [`${category.id}-header`]: true }));
                          }}
                          onMouseLeave={() => {
                            setCategoryHover(prev => ({ ...prev, [`${category.id}-header`]: false }));
                          }}
                        >
                          <h3 className="font-medium text-white text-sm">{category.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-200">{getTasksByCategory(category.id).length}</span>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete category "${category.name}"? Tasks will be moved to General category.`)) {
                                  deleteCategory(category.id);
                                }
                              }}
                              className={`${categoryHover[`${category.id}-header`] ? 'opacity-100' : 'opacity-0'} text-blue-200 hover:text-red-300 transition-opacity p-1`}
                              title="Delete category"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div 
                          className="space-y-1 max-h-32 overflow-y-auto"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            const taskId = e.dataTransfer.getData('taskId');
                            const source = e.dataTransfer.getData('source');
                            
                            if (source === 'today-task') {
                              await updateTask(taskId, { doDate: null, category: category.id });
                              setTodaySections(prev => {
                                const next = { ...prev };
                                delete next[taskId];
                                return next;
                              });
                              removeTaskFromOrder(taskId);
                            } else if (source === 'sidebar') {
                              // Moving between categories
                              await updateTask(taskId, { category: category.id });
                            }
                          }}
                        >
                          {getTasksByCategory(category.id).map(task => (
                            <TaskItem key={task.id} task={task} showCategory={false} dragSource="sidebar" />
                          ))}
                          {getTasksByCategory(category.id).length === 0 && (
                            <p className="text-blue-200 text-xs">
                              No unscheduled tasks
                            </p>
                          )}
                        </div>
                        
                        {/* Add task to category button */}
                        <div 
                          className="mt-2 flex justify-center"
                          onMouseEnter={() => {
                            setCategoryHover(prev => ({ ...prev, [`${category.id}-footer`]: true }));
                          }}
                          onMouseLeave={() => {
                            setCategoryHover(prev => ({ ...prev, [`${category.id}-footer`]: false }));
                          }}
                        >
                          <button
                            onClick={() => {
                              const title = prompt('Enter task title:');
                              if (title?.trim()) {
                                addTask({ 
                                  title: title.trim(), 
                                  category: category.id 
                                });
                              }
                            }}
                            className={`${categoryHover[`${category.id}-footer`] ? 'opacity-100' : 'opacity-0'} transition-opacity text-blue-200 hover:text-white flex items-center justify-center w-5 h-5 rounded border border-blue-400 hover:border-blue-300 hover:bg-blue-700`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Category Button */}
                    <button
                      onClick={() => {
                        const name = prompt('Enter category name:');
                        const color = prompt('Enter category color (hex):') || '#6B7280';
                        if (name?.trim()) {
                          addCategory({ name: name.trim(), color });
                        }
                      }}
                      className="w-full text-xs text-blue-200 hover:text-white flex items-center justify-center gap-1 px-2 py-1 rounded border border-blue-400 hover:border-blue-300 hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Category
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'today' && (
            <div className="space-y-6">
              {/* Important Section */}
              <div className="group">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    Important
                  </h2>
                </div>
                <div
                  className="min-h-24 rounded-lg"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const taskId = e.dataTransfer.getData('taskId');
                    const source = e.dataTransfer.getData('source');

                    if (source === 'sidebar') {
                      await updateTask(taskId, { doDate: selectedDate });
                      setTodaySections(prev => ({ ...prev, [taskId]: 'important' }));
                      addTaskToOrder(taskId, 'important');
                    } else if (source === 'today-task') {
                      setTodaySections(prev => ({ ...prev, [taskId]: 'important' }));
                      addTaskToOrder(taskId, 'important');
                    }
                  }}
                >
                  <div className="space-y-1">
                    {getImportantTasks().length === 0 ? (
                      <p className="text-gray-500 italic">Drop tasks here to mark as important for today</p>
                    ) : (
                      getImportantTasks().map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          showCategory={true} 
                          sectionType="important"
                          onReorder={(draggedId, targetId) => {
                            const tasks = getImportantTasks();
                            const targetIndex = tasks.findIndex(t => t.id === targetId);
                            reorderTask(draggedId, targetIndex, 'important');
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
                
                {/* Add task button - appears on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex justify-center">
                  <button
                    onClick={() => {
                      const title = prompt('Enter task title:');
                      if (title?.trim()) {
                        addTask({ 
                          title: title.trim(), 
                          doDate: selectedDate 
                        }).then(() => {
                          // Add to important section after task is created
                          setTimeout(() => {
                            fetchTasks().then(() => {
                              const newTask = tasks.find(t => t.title === title.trim() && t.doDate === selectedDate);
                              if (newTask) {
                                setTodaySections(prev => ({ ...prev, [newTask.id]: 'important' }));
                                addTaskToOrder(newTask.id, 'important');
                              }
                            });
                          }, 100);
                        });
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center w-6 h-6 rounded border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Extra Section */}
              <div className="group">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Layers className="w-5 h-5 text-blue-500 mr-2" />
                    Extra
                  </h2>
                </div>
                <div
                  className="min-h-24 rounded-lg"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const taskId = e.dataTransfer.getData('taskId');
                    const source = e.dataTransfer.getData('source');

                    if (source === 'sidebar') {
                      await updateTask(taskId, { doDate: selectedDate });
                      setTodaySections(prev => ({ ...prev, [taskId]: 'extra' }));
                      addTaskToOrder(taskId, 'extra');
                    } else if (source === 'today-task') {
                      setTodaySections(prev => ({ ...prev, [taskId]: 'extra' }));
                      addTaskToOrder(taskId, 'extra');
                    }
                  }}
                >
                  <div className="space-y-1">
                    {getExtraTasks().length === 0 ? (
                      <p className="text-gray-500 italic">Drop tasks here to add to today's extra tasks</p>
                    ) : (
                      getExtraTasks().map(task => (
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          showCategory={true} 
                          sectionType="extra"
                          onReorder={(draggedId, targetId) => {
                            const tasks = getExtraTasks();
                            const targetIndex = tasks.findIndex(t => t.id === targetId);
                            reorderTask(draggedId, targetIndex, 'extra');
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
                
                {/* Add task button - appears on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex justify-center">
                  <button
                    onClick={() => {
                      const title = prompt('Enter task title:');
                      if (title?.trim()) {
                        addTask({ 
                          title: title.trim(), 
                          doDate: selectedDate 
                        }).then(() => {
                          // Add to extra section after task is created
                          setTimeout(() => {
                            fetchTasks().then(() => {
                              const newTask = tasks.find(t => t.title === title.trim() && t.doDate === selectedDate);
                              if (newTask) {
                                setTodaySections(prev => ({ ...prev, [newTask.id]: 'extra' }));
                                addTaskToOrder(newTask.id, 'extra');
                              }
                            });
                          }, 100);
                        });
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center w-6 h-6 rounded border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'all' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Tasks</h2>
              <div className="space-y-3">
                {tasks.filter(task => !task.completed).map(task => (
                  <TaskItem key={task.id} task={task} showCategory={true} />
                ))}
              </div>
            </div>
          )}

        </main>
        </div>
      </div>

      {/* Modals and overlays */}
      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Quick Add Task</h3>
            <input
              type="text"
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && quickAddText.trim()) {
                  addTask({ title: quickAddText.trim() });
                }
              }}
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowQuickAdd(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => quickAddText.trim() && addTask({ title: quickAddText.trim() })}
                disabled={!quickAddText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center lg:hidden"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default TayraApp;