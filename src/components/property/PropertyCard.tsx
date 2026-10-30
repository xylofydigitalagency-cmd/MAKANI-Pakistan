import React from 'react';
import { Property } from '../../types';
import { formatPricePKR, formatArea, getCategoryLabel } from '../../lib/formatters';
import { Heart, MapPin, Bed, Bath, Maximize2, ShieldCheck, Eye } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  isFavorite: boolean;
  onToggleFavorite: (propertyId: string, e: React.MouseEvent) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) => {
  const primaryImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : '/images/hero_pakistan_luxury_villa_1792498552523.jpg';

  return (
    <div
      onClick={() => onSelect(property)}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col h-full"
    >
      {/* Property Photograph Showcase */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Purpose Indicator (Sale vs Rent) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-900/90 text-white backdrop-blur-xs">
            For {property.purpose}
          </span>
          {property.featured && (
            <span className="text-[11px] font-bold px-2 py-1 rounded bg-amber-500 text-slate-950 backdrop-blur-xs">
              Featured
            </span>
          )}
        </div>

        {/* Save to Favorites Button */}
        <button
          onClick={(e) => onToggleFavorite(property.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors z-10 cursor-pointer ${
            isFavorite
              ? 'bg-rose-500 text-white'
              : 'bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom image overlay metadata */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10 pointer-events-none">
          <span className="flex items-center gap-1 font-medium drop-shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate max-w-[200px]">
              {property.location.area}, {property.location.city}
            </span>
          </span>
          <span className="text-[11px] opacity-90 drop-shadow-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span className="tabular-nums font-mono">{property.viewsCount}</span>
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata (Anti-slop rule: clean typographic separators) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
            <span>{getCategoryLabel(property.category)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">{property.location.city}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h3>
        </div>

        {/* Price & Spec Metrics */}
        <div>
          <div className="flex items-baseline justify-between mb-2.5">
            <div>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formatPricePKR(property.price)}
              </span>
              {property.purpose === 'rent' && (
                <span className="text-xs text-slate-500 font-normal"> / month</span>
              )}
            </div>
            {property.priceNegotiable && (
              <span className="text-[11px] text-slate-500">Negotiable</span>
            )}
          </div>

          {/* Bed / Bath / Area metrics strip */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            {property.details.bedrooms !== undefined && property.details.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-slate-400" />
                <span className="tabular-nums font-medium">{property.details.bedrooms} Beds</span>
              </div>
            )}

            {property.details.bathrooms !== undefined && property.details.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span className="tabular-nums font-medium">{property.details.bathrooms} Baths</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="tabular-nums font-medium">
                {formatArea(property.details.coveredArea, property.details.areaUnit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
