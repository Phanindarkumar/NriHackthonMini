import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Alumni from './pages/Alumni';
import Events from './pages/Events';
import Mentorship from './pages/Mentorship';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <motion.div
                  key="home"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Home />
                </motion.div>
              } />
              
              <Route path="/auth" element={
                <motion.div
                  key="auth"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Auth />
                </motion.div>
              } />
              
              <Route path="/alumni" element={
                <motion.div
                  key="alumni"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProtectedRoute>
                    <Alumni />
                  </ProtectedRoute>
                </motion.div>
              } />
              
              <Route path="/events" element={
                <motion.div
                  key="events"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                </motion.div>
              } />
              
              <Route path="/mentorship" element={
                <motion.div
                  key="mentorship"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProtectedRoute>
                    <Mentorship />
                  </ProtectedRoute>
                </motion.div>
              } />
              
              <Route path="/dashboard" element={
                <motion.div
                  key="dashboard"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </motion.div>
              } />
              
              <Route path="/profile" element={
                <motion.div
                  key="profile"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </motion.div>
              } />
              
              <Route path="/chat" element={
                <motion.div
                  key="chat"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                </motion.div>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;