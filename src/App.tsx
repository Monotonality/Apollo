import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { UserProfile } from './types/user';
import { convertFirebaseUser } from './services/authService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import './App.css';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await convertFirebaseUser(firebaseUser);
          setUser(userData);
        } catch (error) {
          console.error('Error converting Firebase user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/directory') {
        setCurrentPage('directory');
      } else {
        setCurrentPage('dashboard');
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleAuthSuccess = () => {
    // Auth state change will be handled by the onAuthStateChanged listener
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'directory') {
      window.history.pushState({}, '', '/directory');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #e87500', 
            borderTop: '5px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#154734', fontSize: '1.1rem' }}>Loading Apollo...</p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    if (!user) {
      return <Auth onAuthSuccess={handleAuthSuccess} />;
    }

    switch (currentPage) {
      case 'directory':
        return <Directory currentUser={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return <Dashboard user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {renderCurrentPage()}
    </div>
  );
}

export default App;
