import React, { useState } from 'react';
import { AppUser } from '../../types';
import {
  PlusCircle,
  User as UserIcon,
  LogOut,
  Shield,
  LayoutDashboard,
  Heart,
  Menu,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';

interface NavbarProps {
  currentUser: AppUser | null;
  onNavigate: (view: string, extraParams?: Record<string, any>) => void;
  activeView: string;
  onOpenGoogleAuth: () => void;
  onSignOut: () => void;
  savedFavoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onNavigate,
  activeView,
  onOpenGoogleAuth,
  onSignOut,
  savedFavoritesCount,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const handlePostPropertyClick = () => {
    if (!currentUser) {
      onOpenGoogleAuth();
    } else {
      onNavigate('post-property');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Bar 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xl tracking-tight shadow-xs group-hover:bg-slate-800 transition-colors">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              Makani<span className="text-emerald-600">.pk</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-1">
              Pakistan Real Estate
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('search', { purpose: 'sale' })}
            className={`whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors cursor-pointer ${
              activeView === 'search-sale' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Buy Properties
          </button>
          <button
            onClick={() => onNavigate('search', { purpose: 'rent' })}
            className={`whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors cursor-pointer ${
              activeView === 'search-rent' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Rent Properties
          </button>
          <button
            onClick={() => onNavigate('popular-cities')}
            className={`whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors cursor-pointer ${
              activeView === 'popular-cities' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Explore Cities
          </button>
          <button
            onClick={() => onNavigate('reviews')}
            className={`whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors cursor-pointer ${
              activeView === 'reviews' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => onNavigate('safety')}
            className={`whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors cursor-pointer ${
              activeView === 'safety' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Safety & Trust
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile Area */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Favourites shortcut */}
          <button
            onClick={() => onNavigate('favorites')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
            title="Saved Properties"
          >
            <Heart className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Saved</span>
            {savedFavoritesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {savedFavoritesCount}
              </span>
            )}
          </button>

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {isAdmin ? 'Administrator' : `${currentUser.freeCreditsRemaining + currentUser.paidCreditsRemaining} Credits`}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-sm">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 text-xs truncate">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg">
                      <span className="text-slate-600">Credits Available:</span>
                      <span className="font-bold text-emerald-700">
                        {currentUser.freeCreditsRemaining} Free · {currentUser.paidCreditsRemaining} Paid
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-emerald-600" />
                      Admin Control Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    My Advertiser Dashboard
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('dashboard', { tab: 'payments' });
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    Buy Listing Credits (Rs. 500)
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('dashboard', { tab: 'listings' });
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    My Properties & Analytics
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenGoogleAuth}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary Action Button: Post Property */}
          <button
            onClick={handlePostPropertyClick}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Property</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('search', { purpose: 'sale' });
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            Buy Properties
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('search', { purpose: 'rent' });
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            Rent Properties
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('popular-cities');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            Explore Popular Cities
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('reviews');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            Website Reviews
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('safety');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            Property Safety Guidelines
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('about');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            About Makani Pakistan
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('contact');
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            Contact & Regional Offices
          </button>

          {currentUser && isAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin');
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50"
            >
              Administrator Panel
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('dashboard');
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Advertiser Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
