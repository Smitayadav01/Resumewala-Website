// src/App.tsx
import { useState } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleLogin = (adminStatus: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    setCurrentPage('home'); // redirect to home after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Landing page does NOT use layout */}
      {currentPage === 'landing' ? (
        <Landing onLogin={handleLogin} onNavigate={handleNavigate} />
      ) : (
        <Layout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
        >
          {/* Pages rendered inside layout */}
          {currentPage === 'home' && isLoggedIn && <Home onNavigate={handleNavigate} />}
          {currentPage === 'jobs' && isLoggedIn && <Jobs onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />}
          {currentPage === 'about' && <About />}
          {currentPage === 'contact' && <Contact />}
          {currentPage === 'profile' && isLoggedIn && <Profile onNavigate={handleNavigate} />}
          {currentPage === 'admin' && isAdmin && <Admin />}
        </Layout>
      )}
    </div>
  );
}

export default App;
