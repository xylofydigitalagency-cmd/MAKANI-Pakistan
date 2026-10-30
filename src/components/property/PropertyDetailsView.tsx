import React, { useState } from 'react';
import { Property, AppUser } from '../../types';
import { formatPricePKR, formatExactPKR, formatArea, getCategoryLabel } from '../../lib/formatters';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  ShieldCheck,
  Heart,
  Share2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Lock,
  ArrowLeft,
  Check,
  Compass,
  Building,
  Car,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PropertyDetailsViewProps {
  property: Property;
  currentUser: AppUser | null;
  onOpenGoogleAuth: (reason: 'contact_owner' | 'general') => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isFavorite: boolean;
  onBack: () => void;
  onSelectProperty: (property: Property) => void;
  similarProperties: Property[];
  onOpenReportModal: () => void;
  onOpenLightbox: (index: number) => void;
}

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({
  property,
  currentUser,
  onOpenGoogleAuth,
  onToggleFavorite,
  isFavorite,
  onBack,
  onSelectProperty,
  similarProperties,
  onOpenReportModal,
  onOpenLightbox,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = property.images && property.images.length > 0 ? property.images : [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppClick = () => {
    if (!currentUser) {
      onOpenGoogleAuth('contact_owner');
      return;
    }
    const cleanNumber = property.contact.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Assalam-o-Alaikum, I am inquiring about your property listed on Makani.pk: "${property.title}" (Ref: ${property.id}) priced at ${formatPricePKR(property.price)}.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const handleCallClick = () => {
    if (!currentUser) {
      onOpenGoogleAuth('contact_owner');
      return;
    }
    window.location.href = `tel:${property.contact.phone}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Back Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to search results</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={(e) => onToggleFavorite(property.id, e)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border shadow-xs transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-500' : 'text-slate-500'}`} />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Top Header Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  For {property.purpose}
                </span>
                <span>·</span>
                <span>{getCategoryLabel(property.category)}</span>
                <span>·</span>
                <span className="font-mono text-slate-400">Ref: {property.id}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Verified
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {property.location.street ? `${property.location.street}, ` : ''}
                  {property.location.area}, {property.location.city}, {property.location.province}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Asking Price
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums text-emerald-800">
                {formatPricePKR(property.price)}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Exact: {formatExactPKR(property.price)} {property.purpose === 'rent' ? '/ month' : ''}
              </div>
              {property.priceNegotiable && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Negotiable Price
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery Showcase */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            
            {/* Primary Large Image */}
            <div
              onClick={() => onOpenLightbox(activePhotoIndex)}
              className="lg:col-span-3 aspect-16/10 rounded-xl overflow-hidden relative cursor-zoom-in bg-slate-900 group"
            >
              <img
                src={images[activePhotoIndex]}
                alt={`${property.title} large photo`}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                <span className="bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg font-medium">
                  Click to view full screen ({activePhotoIndex + 1} of {images.length})
                </span>
                <span className="bg-emerald-600/90 text-white px-2.5 py-1 rounded font-semibold text-[11px]">
                  Verified Photographs
                </span>
              </div>
            </div>

            {/* Thumbnail Column */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[460px]">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative aspect-4/3 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 lg:shrink lg:h-28 ${
                    idx === activePhotoIndex
                      ? 'border-emerald-600 ring-2 ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2-Column Split: Property Details vs Sticky Contact Owner Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details (2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Key Specifications Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                Overview & Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Maximize2 className="w-4 h-4 text-emerald-600" />
                    <span>Area Size</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatArea(property.details.coveredArea, property.details.areaUnit)}
                  </div>
                </div>

                {property.details.bedrooms !== undefined && property.details.bedrooms > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Bed className="w-4 h-4 text-emerald-600" />
                      <span>Bedrooms</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {property.details.bedrooms} Master Suites
                    </div>
                  </div>
                )}

                {property.details.bathrooms !== undefined && property.details.bathrooms > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Bath className="w-4 h-4 text-emerald-600" />
                      <span>Bathrooms</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {property.details.bathrooms} Baths
                    </div>
                  </div>
                )}

                {property.details.parkingSpaces !== undefined && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Car className="w-4 h-4 text-emerald-600" />
                      <span>Parking</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {property.details.parkingSpaces} Vehicles
                    </div>
                  </div>
                )}

                {property.details.floors !== undefined && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Floors / Storeys</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {property.details.floors} Storey
                    </div>
                  </div>
                )}

                {property.details.furnishing && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <Building className="w-4 h-4 text-emerald-600" />
                      <span>Furnishing</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {property.details.furnishing}
                    </div>
                  </div>
                )}

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Listing Date</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 font-mono">
                    {new Date(property.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Purpose</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-800 uppercase">
                    For {property.purpose}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Property Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities & Features */}
            {property.details.amenities && property.details.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Amenities & Infrastructure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {property.details.amenities.map((amenity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Map Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Location & Neighbourhood
                </h3>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  {property.location.city}, {property.location.province}
                </span>
              </div>

              {/* Map Representation */}
              <div className="h-64 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-center z-10 p-6 bg-white/90 backdrop-blur-xs rounded-xl shadow-lg border border-slate-200 max-w-sm">
                  <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-900">{property.location.area}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {property.location.city}, Pakistan
                  </p>
                  {property.location.coordinates && (
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Lat: {property.location.coordinates.lat.toFixed(4)}, Lng: {property.location.coordinates.lng.toFixed(4)}
                    </p>
                  )}
                  <div className="mt-3 text-[10px] bg-emerald-50 text-emerald-800 py-1 px-2.5 rounded font-medium">
                    Google Maps API ready for live geocoding
                  </div>
                </div>
              </div>
            </div>

            {/* Report Property */}
            <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
              <span>Notice something incorrect with this listing?</span>
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report this listing</span>
              </button>
            </div>
          </div>

          {/* Sticky Contact Sidebar (Protected Section) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Owner / Advertiser Contact Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    {property.contact.ownerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {property.contact.ownerName}
                    </h3>
                    <p className="text-xs text-slate-500">Property Advertiser / Owner</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Phone Verified Seller
                    </span>
                  </div>
                </div>

                {/* Contact Protection Logic */}
                <div className="py-5 space-y-3">
                  {currentUser ? (
                    // Authenticated: Reveal real contact options
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-[11px] font-semibold text-emerald-800 block mb-0.5">
                          Verified Mobile Number
                        </span>
                        <span className="text-base font-bold text-slate-900 font-mono tracking-wide">
                          {property.contact.phone}
                        </span>
                      </div>

                      <button
                        onClick={handleCallClick}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span>Call Owner Directly</span>
                      </button>

                      <button
                        onClick={handleWhatsAppClick}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </button>
                    </div>
                  ) : (
                    // Unauthenticated: Protected login wall
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          Contact Details Protected
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          To protect advertisers from automated telemarketing spam, owner phone numbers are revealed exclusively to registered Google accounts.
                        </p>
                      </div>

                      <button
                        onClick={() => onOpenGoogleAuth('contact_owner')}
                        className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Sign in with Google to Reveal Phone</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Contact Preference:</span>
                  <span className="font-semibold text-slate-700 capitalize">
                    {property.contact.contactPreference}
                  </span>
                </div>
              </div>

              {/* Safety Warning */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  Buyer Safety Advice
                </p>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Never transfer advance token money or payment before inspecting the property in person and verifying authentic ownership title deeds with the relevant development authority (CDA, LDA, DHA, or KDA).
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
              Similar Properties in {property.location.city}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => onSelectProperty(sim)}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                >
                  <img
                    src={sim.images[0]}
                    alt={sim.title}
                    className="aspect-16/10 rounded-lg object-cover mb-3"
                  />
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase">
                      For {sim.purpose} · {sim.location.area}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mt-0.5">
                      {sim.title}
                    </h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{formatPricePKR(sim.price)}</span>
                    <span className="text-slate-500">
                      {formatArea(sim.details.coveredArea, sim.details.areaUnit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
