import React from 'react';
import { Star, Layers, Plus } from 'lucide-react';
import TaskItem from './TaskItem';

const TaskSection = ({ 
  title, 
  icon, 
  tasks, 
  onDrop, 
  onAddTask, 
  emptyMessage,
  children 
}) => (
  <div className="group">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        {icon}
        {title}
      </h2>
    </div>
    <div
      className="min-h-24 rounded-lg"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <p className="text-gray-500 italic">{emptyMessage}</p>
        ) : (
          children
        )}
      </div>
    </div>
    
    {/* Add task button - appears on hover */}
    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex justify-center">
      <button
        onClick={onAddTask}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center w-6 h-6 rounded border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const TodayView = ({
  selectedDate,
  getImportantTasks,
  getExtraTasks,
  updateTask,
  setTodaySections,
  addTaskToOrder,
  reorderTask,
  addTask,
  fetchTasks,
  tasks,
  // Task item props
  expandedTasks,
  editingTask,
  editForm,
  setEditForm,
  editingTitle,
  editingTitleValue,
  setEditingTitleValue,
  categories,
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
  const importantTasks = getImportantTasks();
  const extraTasks = getExtraTasks();

  const handleAddTaskToSection = async (section) => {
    const title = prompt('Enter task title:');
    if (title?.trim()) {
      await addTask({ 
        title: title.trim(), 
        doDate: selectedDate 
      });
      
      // Add to section after task is created
      setTimeout(async () => {
        await fetchTasks();
        const newTask = tasks.find(t => t.title === title.trim() && t.doDate === selectedDate);
        if (newTask) {
          setTodaySections(prev => ({ ...prev, [newTask.id]: section }));
          addTaskToOrder(newTask.id, section);
        }
      }, 100);
    }
  };

  const handleSectionDrop = (section) => async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('taskId');
    const source = e.dataTransfer.getData('source');

    if (source === 'sidebar') {
      await updateTask(taskId, { doDate: selectedDate });
      setTodaySections(prev => ({ ...prev, [taskId]: section }));
      addTaskToOrder(taskId, section);
    } else if (source === 'today-task') {
      setTodaySections(prev => ({ ...prev, [taskId]: section }));
      addTaskToOrder(taskId, section);
    }
  };

  const handleTaskReorder = (section, tasks) => (draggedId, targetId) => {
    const targetIndex = tasks.findIndex(t => t.id === targetId);
    reorderTask(draggedId, targetIndex, section);
  };

  return (
    <div className="space-y-6">
      {/* Important Section */}
      <TaskSection
        title="Important"
        icon={<Star className="w-5 h-5 text-yellow-500 mr-2" />}
        tasks={importantTasks}
        onDrop={handleSectionDrop('important')}
        onAddTask={() => handleAddTaskToSection('important')}
        emptyMessage="Drop tasks here to mark as important for today"
      >
        {importantTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            showCategory={true} 
            sectionType="important"
            onReorder={handleTaskReorder('important', importantTasks)}
            expandedTasks={expandedTasks}
            editingTask={editingTask}
            editForm={editForm}
            setEditForm={setEditForm}
            editingTitle={editingTitle}
            editingTitleValue={editingTitleValue}
            setEditingTitleValue={setEditingTitleValue}
            categories={categories}
            toggleTask={toggleTask}
            toggleTaskExpansion={toggleTaskExpansion}
            startEditingTask={startEditingTask}
            cancelEdit={cancelEdit}
            saveTaskEdit={saveTaskEdit}
            startTitleEdit={startTitleEdit}
            saveTitleEdit={saveTitleEdit}
            cancelTitleEdit={cancelTitleEdit}
            deleteTask={deleteTask}
            toggleSubtask={toggleSubtask}
            addSubtask={addSubtask}
            getCategoryColor={getCategoryColor}
          />
        ))}
      </TaskSection>

      {/* Extra Section */}
      <TaskSection
        title="Extra"
        icon={<Layers className="w-5 h-5 text-blue-500 mr-2" />}
        tasks={extraTasks}
        onDrop={handleSectionDrop('extra')}
        onAddTask={() => handleAddTaskToSection('extra')}
        emptyMessage="Drop tasks here to add to today's extra tasks"
      >
        {extraTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            showCategory={true} 
            sectionType="extra"
            onReorder={handleTaskReorder('extra', extraTasks)}
            expandedTasks={expandedTasks}
            editingTask={editingTask}
            editForm={editForm}
            setEditForm={setEditForm}
            editingTitle={editingTitle}
            editingTitleValue={editingTitleValue}
            setEditingTitleValue={setEditingTitleValue}
            categories={categories}
            toggleTask={toggleTask}
            toggleTaskExpansion={toggleTaskExpansion}
            startEditingTask={startEditingTask}
            cancelEdit={cancelEdit}
            saveTaskEdit={saveTaskEdit}
            startTitleEdit={startTitleEdit}
            saveTitleEdit={saveTitleEdit}
            cancelTitleEdit={cancelTitleEdit}
            deleteTask={deleteTask}
            toggleSubtask={toggleSubtask}
            addSubtask={addSubtask}
            getCategoryColor={getCategoryColor}
          />
        ))}
      </TaskSection>
    </div>
  );
};

export default TodayView;