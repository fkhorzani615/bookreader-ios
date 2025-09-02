import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookProvider } from './context/books';
import { FirebaseVideosProvider } from './context/FirebaseVideosContext';
import { FirebaseCategoriesProvider } from './context/FirebaseCategoriesContext';
import { FirebaseBookDetailsProvider } from './context/FirebaseBookDetailsContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/cart';

// Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import Books from './pages/Books';
import Videos from './pages/Videos';
import VideoPlayer from './pages/VideoPlayer';
import Search from './pages/Search';
import UploadPage from './pages/Upload';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import BookDetailsAdmin from './pages/BookDetailsAdmin';
import VideoDebugger from './components/VideoDebugger';
import Logout from './pages/Logout';
import Error from './pages/Error';

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
            {/* Public Routes */}
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute requireAuth={false}>
                <Register />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/video/:id" element={
              <ProtectedRoute>
                <VideoPlayer />
              </ProtectedRoute>
            } />
            <Route path="/book/:id" element={
              <ProtectedRoute>
                <BookDetails />
              </ProtectedRoute>
            } />
            <Route path="/books" element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            } />
            <Route path="/videos" element={
              <ProtectedRoute>
                <Videos />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            
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
            
            <Route path="/admin/book-details" element={
              <ProtectedRoute>
                <BookDetailsAdmin />
              </ProtectedRoute>
            } />
            
            <Route path="/logout" element={<Logout />} />
            
            <Route path="/debug/videos" element={<VideoDebugger />} />
            
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
      <AuthProvider>
        <BookProvider>
          <FirebaseVideosProvider>
            <FirebaseCategoriesProvider>
              <FirebaseBookDetailsProvider>
                <CartProvider>
                  <AppContent />
                </CartProvider>
              </FirebaseBookDetailsProvider>
            </FirebaseCategoriesProvider>
          </FirebaseVideosProvider>
        </BookProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
