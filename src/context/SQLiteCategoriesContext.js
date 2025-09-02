import React, { useEffect, useState, useContext } from "react";
import database from "../database/database";

const SQLiteCategoriesContext = React.createContext();

const SQLiteCategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await database.getCategories();
      setCategories(categoriesData);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const value = { 
    categories, 
    loading, 
    fetchCategories 
  };

  return (
    <SQLiteCategoriesContext.Provider value={value}>
      {children}
    </SQLiteCategoriesContext.Provider>
  );
};

// Custom hook to use the SQLiteCategories context
const useSQLiteCategories = () => {
  const context = useContext(SQLiteCategoriesContext);
  if (!context) {
    throw new Error('useSQLiteCategories must be used within a SQLiteCategoriesProvider');
  }
  return context;
};

export { SQLiteCategoriesProvider, useSQLiteCategories };
export default SQLiteCategoriesContext;
