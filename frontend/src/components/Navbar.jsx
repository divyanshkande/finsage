import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

 
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    setIsAuthenticated(false);
    navigate('/');
  };

  // Check if current route is active
  const isActive = (path) => location.pathname === path;

  // Check if on landing page
  const isLandingPage = location.pathname === '/';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isLandingPage
          ? scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
          : 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className={`text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 transition-colors ${
              isLandingPage
                ? scrolled
                  ? 'text-blue-700'
                  : 'text-white'
                : 'text-white'
            }`}
          >
            <span className="text-2xl sm:text-3xl">💰</span>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              Finsage
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              // Public links for non-authenticated users
              <>
                <NavLink
                  to="/"
                  isActive={isActive('/')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/about"
                  isActive={isActive('/about')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  About
                </NavLink>
              </>
            ) : (
              // Authenticated user links
              <>
                <NavLink
                  to="/dashboard"
                  isActive={isActive('/dashboard')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/expenses"
                  isActive={isActive('/expenses')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Expenses
                </NavLink>
                <NavLink
                  to="/events"
                  isActive={isActive('/events')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Events
                </NavLink>
                <NavLink
                  to="/savings"
                  isActive={isActive('/savings')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Savings
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="ml-3 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden focus:outline-none transition-colors ${
              isLandingPage
                ? scrolled
                  ? 'text-gray-800'
                  : 'text-white'
                : 'text-white'
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2">
            {!isAuthenticated ? (
              // Public links for non-authenticated users
              <>
                <MobileNavLink
                  to="/"
                  isActive={isActive('/')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Home
                </MobileNavLink>
                <MobileNavLink
                  to="/about"
                  isActive={isActive('/about')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  About
                </MobileNavLink>
              </>
            ) : (
              // Authenticated user links
              <>
                <MobileNavLink
                  to="/dashboard"
                  isActive={isActive('/dashboard')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Dashboard
                </MobileNavLink>
                <MobileNavLink
                  to="/expenses"
                  isActive={isActive('/expenses')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Expenses
                </MobileNavLink>
                <MobileNavLink
                  to="/events"
                  isActive={isActive('/events')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Events
                </MobileNavLink>
                <MobileNavLink
                  to="/savings"
                  isActive={isActive('/savings')}
                  isLandingPage={isLandingPage}
                  scrolled={scrolled}
                >
                  Savings
                </MobileNavLink>

                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ to, children, isActive, isLandingPage, scrolled }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base';
  
  let classes = baseClasses;
  
  if (isActive) {
    classes += isLandingPage && !scrolled
      ? ' bg-white/20 text-white'
      : isLandingPage
      ? ' bg-blue-100 text-blue-700'
      : ' bg-white/20 text-white';
  } else {
    classes += isLandingPage && !scrolled
      ? ' text-white hover:bg-white/10'
      : isLandingPage
      ? ' text-gray-700 hover:bg-gray-100'
      : ' text-white hover:bg-white/10';
  }

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
};

// Mobile Navigation Link Component
const MobileNavLink = ({ to, children, isActive, isLandingPage, scrolled }) => {
  const baseClasses = 'block px-4 py-2.5 rounded-lg font-semibold transition-all';
  
  let classes = baseClasses;
  
  if (isActive) {
    classes += ' bg-blue-600 text-white';
  } else {
    classes += isLandingPage && !scrolled
      ? ' text-white hover:bg-white/10'
      : isLandingPage
      ? ' text-gray-700 hover:bg-gray-100'
      : ' text-white hover:bg-white/10';
  }

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
};

export default Navbar;
