import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { UserProfile } from './types/user';
import { convertFirebaseUser } from './services/authService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import Profile from './components/Profile';
import About from './components/About';
import Members from './components/Members';
import Committee from './components/Committee';
import Committees from './components/Committees';
import Admin from './components/Admin';
import Landing from './components/Landing';
import './App.css';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');

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
      if (path === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (path === '/committee') {
        setCurrentPage('committee');
      } else if (path === '/committees') {
        setCurrentPage('committees');
      } else if (path === '/directory') {
        setCurrentPage('directory');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/about') {
        setCurrentPage('about');
      } else if (path === '/members') {
        setCurrentPage('members');
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/signup') {
        setCurrentPage('signup');
      } else {
        setCurrentPage('landing');
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
    if (page === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (page === 'committee') {
      window.history.pushState({}, '', '/committee');
    } else if (page === 'committees') {
      window.history.pushState({}, '', '/committees');
    } else if (page === 'directory') {
      window.history.pushState({}, '', '/directory');
    } else if (page === 'profile') {
      window.history.pushState({}, '', '/profile');
    } else if (page === 'about') {
      window.history.pushState({}, '', '/about');
    } else if (page === 'members') {
      window.history.pushState({}, '', '/members');
    } else if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (page === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (page === 'signup') {
      window.history.pushState({}, '', '/signup');
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
    // Show landing page for unauthenticated users on root
    if (!user && (currentPage === 'landing' || currentPage === '')) {
      return <Landing onNavigate={handleNavigate} />;
    }

    // Show auth page for login/signup
    if (!user && (currentPage === 'login' || currentPage === 'signup')) {
      return <Auth onAuthSuccess={handleAuthSuccess} onNavigate={handleNavigate} />;
    }

    // Redirect authenticated users to dashboard if they try to access landing/auth
    if (user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'signup')) {
      setCurrentPage('dashboard');
      window.history.pushState({}, '', '/dashboard');
      return <Dashboard user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
    }

    // Check if user has null role (rejected user) - redirect to landing
    if (user && user.USER_ORG_ROLE === null) {
      return <Landing onNavigate={handleNavigate} />;
    }

    // Show authenticated pages
    if (user) {
      switch (currentPage) {
        case 'committee':
          return <Committee user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
        case 'committees':
          return <Committees user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
        case 'directory':
          return <Directory currentUser={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
        case 'profile':
          return <Profile user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
        case 'about':
          return <About user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
        case 'members':
          return <Members currentUser={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
        case 'admin':
          return <Admin user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
        case 'dashboard':
        default:
          return <Dashboard user={user} onSignOut={handleSignOut} onNavigate={handleNavigate} />;
      }
    }

    // Fallback to landing page
    return <Landing onNavigate={handleNavigate} />;
  };

  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {renderCurrentPage()}
    </div>
  );
}

export default App;
