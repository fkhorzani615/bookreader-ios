import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const FirebaseCategoriesContext = createContext();

export const useFirebaseCategories = () => {
  const context = useContext(FirebaseCategoriesContext);
  if (!context) {
    throw new Error('useFirebaseCategories must be used within a FirebaseCategoriesProvider');
  }
  return context;
};

export const FirebaseCategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      let categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no categories in Firebase, add sample data
      if (categoriesData.length === 0) {
        console.log('No categories found in Firebase, adding sample data...');
        categoriesData = [
          {
            id: 'cat-1',
            name: 'Programming',
            description: 'Learn coding and software development',
            color: '#3B82F6',
            icon: '💻',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'cat-2',
            name: 'Data Science',
            description: 'Master data analysis and machine learning',
            color: '#10B981',
            icon: '📊',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'cat-3',
            name: 'Design',
            description: 'Create beautiful user interfaces and experiences',
            color: '#F59E0B',
            icon: '🎨',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'cat-4',
            name: 'Business',
            description: 'Develop business skills and entrepreneurship',
            color: '#8B5CF6',
            icon: '💼',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'cat-5',
            name: 'Marketing',
            description: 'Learn digital marketing and growth strategies',
            color: '#EF4444',
            icon: '📈',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'cat-6',
            name: 'Personal Development',
            description: 'Improve yourself and achieve your goals',
            color: '#06B6D4',
            icon: '🚀',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }
      
      setCategories(categoriesData);
      return categoriesData;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch categories';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCategory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryDoc = await getDoc(doc(db, 'categories', id));
      if (!categoryDoc.exists()) {
        throw new Error('Category not found');
      }
      
      return {
        id: categoryDoc.id,
        ...categoryDoc.data()
      };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryDoc = {
        name: categoryData.name,
        description: categoryData.description || '',
        color: categoryData.color || '#3B82F6',
        icon: categoryData.icon || 'book',
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'categories'), categoryDoc);
      const newCategory = {
        id: docRef.id,
        ...categoryDoc
      };
      
      // Add new category to the list
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      return newCategory;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        ...categoryData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'categories', id), updateData);
      
      // Update category in the list
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === id ? { ...category, ...updateData } : category
        )
      );
      
      return { id, ...updateData };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteDoc(doc(db, 'categories', id));
      
      // Remove category from the list
      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      
      return true;
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete category';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActiveCategories = () => {
    return categories.filter(category => category.isActive);
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value = {
    categories,
    loading,
    error,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories,
    clearError
  };

  return (
    <FirebaseCategoriesContext.Provider value={value}>
      {children}
    </FirebaseCategoriesContext.Provider>
  );
};
