import { useState, useEffect, useCallback } from 'react';
import { categoryAPI } from '../api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryHover, setCategoryHover] = useState({});

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // Category CRUD operations
  const addCategory = useCallback(async (categoryData) => {
    try {
      await categoryAPI.create(categoryData);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (categoryId, updates) => {
    try {
      await categoryAPI.update(categoryId, updates);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      console.log('Deleting category:', categoryId);
      await categoryAPI.delete(categoryId);
      console.log('Category deleted successfully, refreshing data...');
      await fetchCategories();
      console.log('Data refreshed');
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  }, [fetchCategories]);

  // Utility functions
  const getCategoryColor = useCallback((categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  }, [categories]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // State
    categories,
    categoryHover,
    setCategoryHover,
    
    // Actions
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Utilities
    getCategoryColor
  };
};