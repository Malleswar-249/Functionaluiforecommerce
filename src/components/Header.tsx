import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User, LogOut, Package, Settings, LayoutDashboard } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-[#342639] text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold hover:text-[#4DC2EF] transition-colors">
            E-Commerce
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/" className="hover:text-[#4DC2EF] transition-colors">
              Products
            </Link>
            
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-[#4DC2EF] transition-colors flex items-center gap-1">
                    <LayoutDashboard size={18} />
                    Admin
                  </Link>
                )}
                
                <Link to="/cart" className="hover:text-[#4DC2EF] transition-colors">
                  <ShoppingCart size={24} />
                </Link>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 hover:text-[#4DC2EF] transition-colors px-3 py-2 rounded-lg hover:bg-[#4DC2EF]/10"
                  >
                    <User size={24} />
                    <span className="hidden md:inline">{user.name}</span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-[#5E998C] font-medium mt-1 uppercase">
                          {user.role}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings size={18} />
                          Profile Settings
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Package size={18} />
                          My Orders
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-[#4DC2EF] hover:bg-[#5E998C] px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
