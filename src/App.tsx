import React, { useState, useEffect } from 'react';
import {
  Property,
  AppUser,
  ListingPurpose,
  PropertyCategory,
  PaymentRequest,
} from './types';
import { dataStore } from './lib/dataStore';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

import { HeroSearch } from './components/home/HeroSearch';
import { BrowseCategories } from './components/home/BrowseCategories';
import { PopularCities } from './components/home/PopularCities';
import { TrustSafetySection } from './components/home/TrustSafetySection';
import { CustomerReviewsSection } from './components/home/CustomerReviewsSection';
import { PropertyCard } from './components/property/PropertyCard';
import { PropertyDetailsView } from './components/property/PropertyDetailsView';
import { SearchCatalogView } from './components/property/SearchCatalogView';
import { PostPropertyWizard } from './components/wizard/PostPropertyWizard';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StaticPages } from './components/pages/StaticPages';
import { GoogleAuthModal } from './components/modals/GoogleAuthModal';

import { ImageLightboxModal } from './components/modals/ImageLightboxModal';
import { ReportModal } from './components/modals/ReportModal';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function App() {
  // Store reactive state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(dataStore.getCurrentUser());
  const [properties, setProperties] = useState<Property[]>(dataStore.getAllProperties());
  const [favorites, setFavorites] = useState<string[]>(dataStore.getFavorites());
  const [reviews, setReviews] = useState(dataStore.getApprovedReviews());

  // Navigation router state
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [dashboardTab, setDashboardTab] = useState<string>('properties');

  // Modal states
  const [googleAuthOpen, setGoogleAuthOpen] = useState(false);
  const [googleAuthReason, setGoogleAuthReason] = useState<'post_property' | 'contact_owner' | 'general'>('general');

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Subscribe to central DataStore updates
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setCurrentUser(dataStore.getCurrentUser());
      setProperties([...dataStore.getAllProperties()]);
      setFavorites([...dataStore.getFavorites()]);
      setReviews([...dataStore.getApprovedReviews()]);
    });
    return unsubscribe;
  }, []);

  // Window scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProperty]);

  // Handlers
  const handleNavigate = (view: string, extraParams?: Record<string, any>) => {
    if (view === 'search') {
      setSearchFilters(extraParams || {});
      setCurrentView('search');
    } else if (view === 'dashboard') {
      if (extraParams?.tab) setDashboardTab(extraParams.tab);
      setCurrentView('dashboard');
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectProperty = (prop: Property) => {
    // Record genuine view with deduplication
    dataStore.recordPropertyView(prop.id);
    setSelectedProperty(prop);
    setCurrentView('property-details');
  };

  const handleToggleFavorite = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dataStore.toggleFavorite(propertyId);
  };

  const handleOpenGoogleAuth = (reason: 'post_property' | 'contact_owner' | 'general' = 'general') => {
    setGoogleAuthReason(reason);
    setGoogleAuthOpen(true);
  };

  const handleGoogleSignIn = (user: AppUser) => {
    setCurrentUser(user);

    // If user is admin, direct them to admin panel or their requested action
    if (user.role === 'admin' && googleAuthReason === 'general') {
      setCurrentView('admin');
    } else if (googleAuthReason === 'post_property') {
      setCurrentView('post-property');
    }
  };

  const handleSignOut = () => {
    dataStore.signOut();
    setCurrentUser(null);
    setCurrentView('home');
  };



  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Only approved listings are shown publicly
  const approvedListings = properties.filter((p) => p.status === 'approved');
  const featuredListings = approvedListings.filter((p) => p.featured);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      


      {/* Main Top Bar (3-Zone Contract) */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleNavigate}
        activeView={currentView}
        onOpenGoogleAuth={() => handleOpenGoogleAuth('general')}
        onSignOut={handleSignOut}
        savedFavoritesCount={favorites.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="space-y-0">
            {/* Hero & Search Module */}
            <HeroSearch
              onSearch={(params) => {
                setSearchFilters(params);
                setCurrentView('search');
              }}
              onPostProperty={() => {
                if (!currentUser) {
                  handleOpenGoogleAuth('post_property');
                } else {
                  setCurrentView('post-property');
                }
              }}
            />

            {/* Browse Property Types */}
            <BrowseCategories
              onSelectCategory={(category) => {
                setSearchFilters({ category });
                setCurrentView('search');
              }}
            />

            {/* Featured Properties Showcase */}
            <section className="py-16 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Featured Properties in Pakistan
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Handpicked premium houses, apartments, and luxury villas verified by our team
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchFilters({ purpose: 'sale' });
                      setCurrentView('search');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer mt-2 sm:mt-0"
                  >
                    <span>View All Properties</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(featuredListings.length > 0 ? featuredListings : approvedListings).slice(0, 3).map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onSelect={handleSelectProperty}
                      isFavorite={favorites.includes(prop.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Recently Added Approved Properties */}
            <section className="py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Recently Approved Listings
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct owner posts verified within the last 48 hours
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchFilters({});
                      setCurrentView('search');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer mt-2 sm:mt-0"
                  >
                    <span>Browse All ({approvedListings.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedListings.slice(0, 6).map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onSelect={handleSelectProperty}
                      isFavorite={favorites.includes(prop.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Popular Pakistani Cities */}
            <PopularCities
              onSelectCity={(city) => {
                setSearchFilters({ city });
                setCurrentView('search');
              }}
            />

            {/* Trust, Safety & Free Listings CTA */}
            <TrustSafetySection
              onPostProperty={() => {
                if (!currentUser) {
                  handleOpenGoogleAuth('post_property');
                } else {
                  setCurrentView('post-property');
                }
              }}
              onNavigateSafety={() => setCurrentView('safety')}
            />

            {/* Customer Ratings & Reviews */}
            <CustomerReviewsSection
              reviews={reviews}
              currentUser={currentUser}
              onOpenGoogleAuth={() => handleOpenGoogleAuth('general')}
              onSubmitReview={(rating, feedback, city) =>
                dataStore.submitReview(rating, feedback, city)
              }
            />
          </div>
        )}

        {/* VIEW: SEARCH CATALOG */}
        {currentView === 'search' && (
          <SearchCatalogView
            properties={properties}
            onSelectProperty={handleSelectProperty}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            initialFilters={searchFilters}
          />
        )}

        {/* VIEW: PROPERTY DETAILS */}
        {currentView === 'property-details' && selectedProperty && (
          <PropertyDetailsView
            property={selectedProperty}
            currentUser={currentUser}
            onOpenGoogleAuth={handleOpenGoogleAuth}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.includes(selectedProperty.id)}
            onBack={() => setCurrentView('search')}
            onSelectProperty={handleSelectProperty}
            similarProperties={approvedListings
              .filter((p) => p.id !== selectedProperty.id && p.location.city === selectedProperty.location.city)
              .slice(0, 3)}
            onOpenReportModal={() => setReportModalOpen(true)}
            onOpenLightbox={handleOpenLightbox}
          />
        )}

        {/* VIEW: POST PROPERTY WIZARD */}
        {currentView === 'post-property' && (
          <PostPropertyWizard
            currentUser={currentUser}
            onOpenGoogleAuth={() => handleOpenGoogleAuth('post_property')}
            onSubmitProperty={(data) => dataStore.submitProperty(data)}
            onNavigateDashboard={() => {
              setDashboardTab('properties');
              setCurrentView('dashboard');
            }}
            onNavigateBuyCredits={() => {
              setDashboardTab('buy_credits');
              setCurrentView('dashboard');
            }}
          />
        )}

        {/* VIEW: USER DASHBOARD */}
        {currentView === 'dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            userProperties={dataStore.getUserProperties(currentUser.uid)}
            payments={dataStore.getUserPayments(currentUser.uid)}
            siteSettings={dataStore.getSettings()}
            onPostProperty={() => setCurrentView('post-property')}
            onSelectProperty={handleSelectProperty}
            onUpdatePropertyStatus={(id, status) => {
              dataStore.updateProperty(id, { status }, currentUser.email);
            }}
            onDeleteProperty={(id) => {
              dataStore.deleteProperty(id, currentUser.email);
            }}
            onSubmitPayment={(method, txId, screenshot) =>
              dataStore.submitPayment(method, txId, screenshot)
            }
            initialTab={dashboardTab}
          />
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin' && currentUser && (
          <AdminDashboard
            currentUser={currentUser}
            allProperties={properties}
            allUsers={dataStore.getAllUsers()}
            allPayments={dataStore.getAllPayments()}
            allReviews={dataStore.getAllReviews()}
            auditLogs={dataStore.getAuditLogs()}
            siteSettings={dataStore.getSettings()}
            onApproveProperty={(id) => dataStore.approveProperty(id, currentUser.email)}
            onRejectProperty={(id, reason) => dataStore.rejectProperty(id, reason, currentUser.email)}
            onToggleFeaturedProperty={(id) => dataStore.toggleFeaturedProperty(id, currentUser.email)}
            onDeleteProperty={(id) => dataStore.deleteProperty(id, currentUser.email)}
            onSuspendUser={(uid, reason) => dataStore.suspendUser(uid, reason, currentUser.email)}
            onReactivateUser={(uid) => dataStore.reactivateUser(uid, currentUser.email)}
            onAdjustCredits={(uid, freeDelta, paidDelta, reason) =>
              dataStore.adjustUserCredits(uid, freeDelta, paidDelta, reason, currentUser.email)
            }
            onApprovePayment={(payId) => dataStore.approvePayment(payId, currentUser.email)}
            onRejectPayment={(payId, reason) => dataStore.rejectPayment(payId, reason, currentUser.email)}
            onModerateReview={(revId, status) => dataStore.moderateReview(revId, status, currentUser.email)}
            onToggleFeaturedReview={(revId) => dataStore.toggleFeaturedReview(revId, currentUser.email)}
            onDeleteReview={(revId) => dataStore.deleteReview(revId, currentUser.email)}
            onUpdateSiteSettings={(settings) => dataStore.updateSettings(settings, currentUser.email)}
            onSelectPropertyLive={handleSelectProperty}
          />
        )}

        {/* VIEW: SAVED FAVORITES */}
        {currentView === 'favorites' && (
          <div className="bg-slate-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Saved Properties ({favorites.length})</h1>
              <p className="text-xs text-slate-500 mb-6">Your shortlisted properties saved for quick reference</p>

              {favorites.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                  You have not saved any properties yet. Click the heart icon on any property card to save it here.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties
                    .filter((p) => favorites.includes(p.id))
                    .map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={handleSelectProperty}
                        isFavorite={true}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: POPULAR CITIES */}
        {currentView === 'popular-cities' && (
          <div className="py-6">
            <PopularCities
              onSelectCity={(city) => {
                setSearchFilters({ city });
                setCurrentView('search');
              }}
            />
          </div>
        )}

        {/* VIEW: REVIEWS */}
        {currentView === 'reviews' && (
          <div className="py-6">
            <CustomerReviewsSection
              reviews={reviews}
              currentUser={currentUser}
              onOpenGoogleAuth={() => handleOpenGoogleAuth('general')}
              onSubmitReview={(rating, feedback, city) =>
                dataStore.submitReview(rating, feedback, city)
              }
            />
          </div>
        )}

        {/* VIEW: STATIC INFORMATIONAL PAGES */}
        {['safety', 'about', 'contact', 'terms', 'privacy', 'faq'].includes(currentView) && (
          <StaticPages page={currentView as any} onNavigate={handleNavigate} />
        )}

      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* MODALS */}
      {/* 1. Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={googleAuthOpen}
        onClose={() => setGoogleAuthOpen(false)}
        onSignIn={handleGoogleSignIn}
        reason={googleAuthReason}
      />



      {/* 3. Image Lightbox Modal */}
      {selectedProperty && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          images={selectedProperty.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onSelectIndex={(idx) => setLightboxIndex(idx)}
          title={selectedProperty.title}
        />
      )}

      {/* 4. Report Listing Modal */}
      {selectedProperty && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          propertyTitle={selectedProperty.title}
          propertyId={selectedProperty.id}
        />
      )}

    </div>
  );
}
