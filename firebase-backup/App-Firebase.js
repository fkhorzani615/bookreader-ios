import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookProvider } from './context/books';
import { CartProvider } from './context/cart';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import VideoPlayer from "./pages/VideoPlayer";
import BookReader from "./pages/BookReader";
import BookDetails from "./pages/BookDetails";
import Search from "./pages/Search";
import Books from "./pages/Books";
import Videos from "./pages/Videos";
import UploadPage from "./pages/Upload";
import Subscription from "./pages/Subscription";
import Error from "./pages/Error";

// Components
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

// Styles
import './App.css';

const AppContent = () => {
  const { currentUser } = useAuth();

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
            {/* Use BookDetails for book detail page */}
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
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BookProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </BookProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
