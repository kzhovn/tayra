import React from 'react';
import { Star, Menu, Plus, Trash2 } from 'lucide-react';
import TaskItem from './TaskItem';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen,
  currentView,
  setCurrentView,
  categories,
  categoryHover,
  setCategoryHover,
  tasks,
  getTasksByCategory,
  getTodayTasks,
  deleteCategory,
  addTask,
  addCategory,
  updateTask,
  setTodaySections,
  removeTaskFromOrder,
  // Task item props
  expandedTasks,
  editingTask,
  editForm,
  setEditForm,
  editingTitle,
  editingTitleValue,
  setEditingTitleValue,
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
  return (
    <div className={`${sidebarOpen ? 'w-80' : 'w-12'} transition-all duration-300 bg-blue-500 text-white flex flex-col min-h-screen`}>
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
                        <TaskItem 
                          key={task.id} 
                          task={task} 
                          showCategory={false} 
                          dragSource="sidebar"
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
  );
};

export default Sidebar;