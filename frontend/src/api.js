// API utilities for backend communication
const API_BASE = 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
};

// Task API functions
export const taskAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/tasks`);
    return handleResponse(response);
  },

  create: async (taskData) => {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    return handleResponse(response);
  },

  update: async (taskId, updates) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  delete: async (taskId) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },

  addSubtask: async (taskId, title) => {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return handleResponse(response);
  },

  updateSubtask: async (subtaskId, updates) => {
    const response = await fetch(`${API_BASE}/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  }
};

// Category API functions
export const categoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/categories`);
    return handleResponse(response);
  },

  create: async (categoryData) => {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    return handleResponse(response);
  },

  update: async (categoryId, updates) => {
    const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  delete: async (categoryId) => {
    const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE}/health`);
    return handleResponse(response);
  }
};