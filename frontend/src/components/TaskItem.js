import React, { useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Link,
  Calendar,
  Target,
  Zap,
  CheckCircle2,
  Circle,
} from 'lucide-react';

const TaskItem = ({ 
  task, 
  showCategory = true, 
  dragSource = 'today-task', 
  onReorder = null, 
  sectionType = null,
  // State and handlers passed from parent
  expandedTasks,
  editingTask,
  editForm,
  setEditForm,
  editingTitle,
  editingTitleValue,
  setEditingTitleValue,
  categories,
  // Action handlers
  toggleTask,
  toggleTaskExpansion,
  startEditingTask,
  cancelEdit,
  saveTaskEdit,
  startTitleEdit,
  saveTitleEdit,
  cancelTitleEdit,
  deleteTask,
  toggleSubtask,
  addSubtask,
  getCategoryColor
}) => {
  const editInputRef = useRef(null);
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
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
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

export default TaskItem;