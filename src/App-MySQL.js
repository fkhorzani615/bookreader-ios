import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MySQLAuthProvider, useMySQLAuth } from './context/MySQLAuthContext';
import { MySQLBooksProvider } from './context/MySQLBooksContext';
import { MySQLVideosProvider } from './context/MySQLVideosContext';
import { SQLiteCategoriesProvider } from './context/SQLiteCategoriesContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/cart';

// Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home-SQLite';
import Login from './pages/Login-MySQL';
import Register from './pages/Register-MySQL';
import BookDetails from './pages/BookDetails';
import Books from './pages/Books';
import Videos from './pages/Videos';
import VideoPlayer from './pages/VideoPlayer';
import Search from './pages/Search';
import UploadPage from './pages/Upload';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Error from './pages/Error';

// Styles
import './App.css';

const AppContent = () => {
  const { currentUser } = useMySQLAuth();

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/books" element={<Books />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/search" element={<Search />} />
            
            {/* Protected Routes */}
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Error />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <MySQLAuthProvider>
        <MySQLBooksProvider>
          <MySQLVideosProvider>
            <SQLiteCategoriesProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </SQLiteCategoriesProvider>
          </MySQLVideosProvider>
        </MySQLBooksProvider>
      </MySQLAuthProvider>
    </LanguageProvider>
  );
};

export default App;
