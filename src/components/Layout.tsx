// src/components/Layout.tsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, isLoggedIn, isAdmin }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar at top */}
      <Navbar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
      />

      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Footer at bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
