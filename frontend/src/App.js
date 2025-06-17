import React, { useState, useEffect } from 'react';
import './App.css';
import { Plus, Calendar } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import TodayView from './components/TodayView';
import TaskItem from './components/TaskItem';

// Hooks
import { useTasks } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';

const TayraApp = () => {
  // UI State
  const [currentView, setCurrentView] = useState('today');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Current date
  const selectedDate = new Date().toISOString().split('T')[0];

  // Custom hooks
  const taskHook = useTasks();
  const categoryHook = useCategories();

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

  // Quick add task
  const handleQuickAdd = async () => {
    if (quickAddText.trim()) {
      await taskHook.addTask({ title: quickAddText.trim() });
      setQuickAddText('');
      setShowQuickAdd(false);
    }
  };

  // Enhanced delete category that also refreshes tasks
  const handleDeleteCategory = async (categoryId) => {
    await categoryHook.deleteCategory(categoryId);
    await taskHook.fetchTasks(); // Also refresh tasks to see updated assignments
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('today')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'today'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentView('all')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentView === 'all'
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
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentView={currentView}
          setCurrentView={setCurrentView}
          categories={categoryHook.categories}
          categoryHover={categoryHook.categoryHover}
          setCategoryHover={categoryHook.setCategoryHover}
          tasks={taskHook.tasks}
          getTasksByCategory={taskHook.getTasksByCategory}
          getTodayTasks={taskHook.getTodayTasks}
          deleteCategory={handleDeleteCategory}
          addTask={taskHook.addTask}
          addCategory={categoryHook.addCategory}
          updateTask={taskHook.updateTask}
          setTodaySections={taskHook.setTodaySections}
          removeTaskFromOrder={taskHook.removeTaskFromOrder}
          // Task item props
          expandedTasks={taskHook.expandedTasks}
          editingTask={taskHook.editingTask}
          editForm={taskHook.editForm}
          setEditForm={taskHook.setEditForm}
          editingTitle={taskHook.editingTitle}
          editingTitleValue={taskHook.editingTitleValue}
          setEditingTitleValue={taskHook.setEditingTitleValue}
          toggleTask={taskHook.toggleTask}
          toggleTaskExpansion={taskHook.toggleTaskExpansion}
          startEditingTask={taskHook.startEditingTask}
          cancelEdit={taskHook.cancelEdit}
          saveTaskEdit={taskHook.saveTaskEdit}
          startTitleEdit={taskHook.startTitleEdit}
          saveTitleEdit={taskHook.saveTitleEdit}
          cancelTitleEdit={taskHook.cancelTitleEdit}
          deleteTask={taskHook.deleteTask}
          toggleSubtask={taskHook.toggleSubtask}
          addSubtask={taskHook.addSubtask}
          getCategoryColor={categoryHook.getCategoryColor}
        />

        {/* Main Content Area */}
        <div className="flex-1">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentView === 'today' && (
              <TodayView
                selectedDate={selectedDate}
                getImportantTasks={taskHook.getImportantTasks}
                getExtraTasks={taskHook.getExtraTasks}
                updateTask={taskHook.updateTask}
                setTodaySections={taskHook.setTodaySections}
                addTaskToOrder={taskHook.addTaskToOrder}
                reorderTask={taskHook.reorderTask}
                addTask={taskHook.addTask}
                fetchTasks={taskHook.fetchTasks}
                tasks={taskHook.tasks}
                // Task item props
                expandedTasks={taskHook.expandedTasks}
                editingTask={taskHook.editingTask}
                editForm={taskHook.editForm}
                setEditForm={taskHook.setEditForm}
                editingTitle={taskHook.editingTitle}
                editingTitleValue={taskHook.editingTitleValue}
                setEditingTitleValue={taskHook.setEditingTitleValue}
                categories={categoryHook.categories}
                toggleTask={taskHook.toggleTask}
                toggleTaskExpansion={taskHook.toggleTaskExpansion}
                startEditingTask={taskHook.startEditingTask}
                cancelEdit={taskHook.cancelEdit}
                saveTaskEdit={taskHook.saveTaskEdit}
                startTitleEdit={taskHook.startTitleEdit}
                saveTitleEdit={taskHook.saveTitleEdit}
                cancelTitleEdit={taskHook.cancelTitleEdit}
                deleteTask={taskHook.deleteTask}
                toggleSubtask={taskHook.toggleSubtask}
                addSubtask={taskHook.addSubtask}
                getCategoryColor={categoryHook.getCategoryColor}
              />
            )}

            {currentView === 'all' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">All Tasks</h2>
                <div className="space-y-3">
                  {taskHook.tasks.filter(task => !task.completed).map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      showCategory={true}
                      expandedTasks={taskHook.expandedTasks}
                      editingTask={taskHook.editingTask}
                      editForm={taskHook.editForm}
                      setEditForm={taskHook.setEditForm}
                      editingTitle={taskHook.editingTitle}
                      editingTitleValue={taskHook.editingTitleValue}
                      setEditingTitleValue={taskHook.setEditingTitleValue}
                      categories={categoryHook.categories}
                      toggleTask={taskHook.toggleTask}
                      toggleTaskExpansion={taskHook.toggleTaskExpansion}
                      startEditingTask={taskHook.startEditingTask}
                      cancelEdit={taskHook.cancelEdit}
                      saveTaskEdit={taskHook.saveTaskEdit}
                      startTitleEdit={taskHook.startTitleEdit}
                      saveTitleEdit={taskHook.saveTitleEdit}
                      cancelTitleEdit={taskHook.cancelTitleEdit}
                      deleteTask={taskHook.deleteTask}
                      toggleSubtask={taskHook.toggleSubtask}
                      addSubtask={taskHook.addSubtask}
                      getCategoryColor={categoryHook.getCategoryColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

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
                if (e.key === 'Enter') {
                  handleQuickAdd();
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
                onClick={handleQuickAdd}
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