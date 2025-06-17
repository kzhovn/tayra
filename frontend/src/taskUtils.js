// Utility functions for task filtering and organization

export const getTasksByCategory = (tasks, categoryId) => {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(task =>
    !task.completed &&
    task.category === categoryId &&
    (!task.doDate || task.doDate !== today)
  );
};

export const getTodayTasks = (tasks) => {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(task =>
    !task.completed && task.doDate === today
  );
};

export const getImportantTasks = (tasks, todaySections, taskOrder) => {
  const todayTasks = getTodayTasks(tasks);
  const important = todayTasks.filter(task => todaySections[task.id] === 'important');
  
  // Sort by task order
  if (taskOrder.important.length > 0) {
    return important.sort((a, b) => {
      const aIndex = taskOrder.important.indexOf(a.id);
      const bIndex = taskOrder.important.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
  
  return important;
};

export const getExtraTasks = (tasks, todaySections, taskOrder) => {
  const todayTasks = getTodayTasks(tasks);
  const extra = todayTasks.filter(task => 
    !todaySections[task.id] || todaySections[task.id] === 'extra'
  );
  
  // Sort by task order
  if (taskOrder.extra.length > 0) {
    return extra.sort((a, b) => {
      const aIndex = taskOrder.extra.indexOf(a.id);
      const bIndex = taskOrder.extra.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }
  
  return extra;
};

export const addTaskToOrder = (taskId, section, taskOrder, setTaskOrder) => {
  setTaskOrder(prev => ({
    ...prev,
    [section]: prev[section].includes(taskId) 
      ? prev[section] 
      : [...prev[section], taskId]
  }));
};

export const removeTaskFromOrder = (taskId, taskOrder, setTaskOrder) => {
  setTaskOrder(prev => ({
    important: prev.important.filter(id => id !== taskId),
    extra: prev.extra.filter(id => id !== taskId)
  }));
};

export const reorderTask = (draggedId, targetIndex, section, tasks, todaySections, taskOrder, setTaskOrder) => {
  const sectionTasks = section === 'important' 
    ? getImportantTasks(tasks, todaySections, taskOrder)
    : getExtraTasks(tasks, todaySections, taskOrder);
  
  const currentOrder = taskOrder[section];
  const draggedIndex = currentOrder.indexOf(draggedId);
  
  if (draggedIndex === -1) {
    // Task not in order yet, add it at target position
    const newOrder = [...currentOrder];
    newOrder.splice(targetIndex, 0, draggedId);
    setTaskOrder(prev => ({ ...prev, [section]: newOrder }));
  } else {
    // Reorder existing task
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);
    setTaskOrder(prev => ({ ...prev, [section]: newOrder }));
  }
};