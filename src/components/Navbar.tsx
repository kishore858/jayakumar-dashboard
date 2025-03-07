
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Add New', path: '/entry/new' },
  ];

  return (
    <nav className="backdrop-blur-md bg-background/70 border-b border-border/40 fixed top-0 left-0 right-0 z-50">
      <div className="page-container h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">D</span>
          </div>
          <span className="font-semibold text-lg">Dashboard</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    location.pathname === link.path
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Profile/Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex gap-2 items-center">
                  <span>{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-morphism">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex gap-2 items-center">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex gap-2 items-center text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/auth?mode=login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={toggleMenu} className="p-2">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="glass-morphism md:hidden py-4 animate-slide-down">
          <div className="flex flex-col space-y-3 px-4">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      location.pathname === link.path
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-border/40 my-2 pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive" 
                    onClick={() => { logout(); closeMenu(); }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" onClick={closeMenu}>
                  <Link to="/auth?mode=login">Login</Link>
                </Button>
                <Button asChild onClick={closeMenu}>
                  <Link to="/auth?mode=signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
