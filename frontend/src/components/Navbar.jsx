import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white px-3 py-3 shadow-md w-full">
      <div className="max-w-full mx-auto flex items-center justify-between flex-wrap">
        {/* Logo */}
        <div className="text-base sm:text-xl font-bold text-blue-400">
          <Link to="/">Finsage</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="text-white md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Navigation Links */}
        <div className={`w-full md:flex md:items-center md:w-auto ${menuOpen ? 'block' : 'hidden'} mt-4 md:mt-0`}>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-1 md:space-y-0 items-start md:items-center px-2 text-sm sm:text-base overflow-x-hidden">
            <Link to="/" className="hover:text-yellow-400">Home</Link>
            <Link to="/about" className="hover:text-yellow-400">About</Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-yellow-400">Dashboard</Link>
                <Link to="/expenses" className="hover:text-yellow-400">Expenses</Link>
                <Link to="/events" className="hover:text-yellow-400">Events</Link>
                <Link to="/savings" className="hover:text-yellow-400">Savings</Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-yellow-400">Register / Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
