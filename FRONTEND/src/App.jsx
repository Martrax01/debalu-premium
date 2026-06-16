import React, { useState } from 'react';
import StorePage from './pages/StorePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

const App = () => {
  const [currentView, setCurrentView] = useState('store');
  const [currentUser, setCurrentUser] = useState(null);

  if (currentView === 'auth') {
    return <LoginPage setCurrentView={setCurrentView} setCurrentUser={setCurrentUser} />;
  }
  
  if (currentView === 'admin') {
    return <AdminPage currentUser={currentUser} setCurrentView={setCurrentView} setCurrentUser={setCurrentUser} />;
  }
  
  return <StorePage setCurrentView={setCurrentView} />;
};

export default App;