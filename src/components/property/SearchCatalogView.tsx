import React, { useState, useMemo } from 'react';
import { Property, ListingPurpose, PropertyCategory, AreaUnit } from '../../types';
import { PropertyCard } from './PropertyCard';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  Home,
  Check,
  Building,
} from 'lucide-react';

interface SearchCatalogViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  initialFilters?: {
    purpose?: ListingPurpose;
    city?: string;
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export const SearchCatalogView: React.FC<SearchCatalogViewProps> = ({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  initialFilters,
}) => {
  const [purpose, setPurpose] = useState<ListingPurpose | 'all'>(initialFilters?.purpose || 'all');
  const [city, setCity] = useState<string>(initialFilters?.city || '');
  const [areaKeyword, setAreaKeyword] = useState<string>(initialFilters?.keyword || '');
  const [category, setCategory] = useState<string>(initialFilters?.category || 'all');
  const [minPrice, setMinPrice] = useState<string>(
    initialFilters?.minPrice ? initialFilters.minPrice.toString() : ''
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialFilters?.maxPrice ? initialFilters.maxPrice.toString() : ''
  );
  const [bedrooms, setBedrooms] = useState<string>('all');
  const [bathrooms, setBathrooms] = useState<string>('all');
  const [areaUnit, setAreaUnit] = useState<AreaUnit | 'all'>('all');
  const [minArea, setMinArea] = useState<string>('');
  const [maxArea, setMaxArea] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const popularCities = [
    'Islamabad',
    'Lahore',
    'Karachi',
    'Rawalpindi',
    'Faisalabad',
    'Peshawar',
    'Multan',
  ];

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (purpose !== 'all') count++;
    if (city) count++;
    if (areaKeyword) count++;
    if (category !== 'all') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (bedrooms !== 'all') count++;
    if (bathrooms !== 'all') count++;
    if (areaUnit !== 'all') count++;
    if (minArea || maxArea) count++;
    return count;
  }, [purpose, city, areaKeyword, category, minPrice, maxPrice, bedrooms, bathrooms, areaUnit, minArea, maxArea]);

  const handleResetFilters = () => {
    setPurpose('all');
    setCity('');
    setAreaKeyword('');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('all');
    setBathrooms('all');
    setAreaUnit('all');
    setMinArea('');
    setMaxArea('');
    setSortBy('newest');
  };

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    // Only approved properties can appear in public search
    return properties.filter((p) => {
      if (p.status !== 'approved') return false;

      // Purpose
      if (purpose !== 'all' && p.purpose !== purpose) return false;

      // City
      if (city && p.location.city.toLowerCase() !== city.toLowerCase()) return false;

      // Area keyword
      if (areaKeyword) {
        const kw = areaKeyword.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(kw);
        const matchArea = p.location.area.toLowerCase().includes(kw);
        const matchStreet = p.location.street?.toLowerCase().includes(kw);
        const matchCity = p.location.city.toLowerCase().includes(kw);
        if (!matchTitle && !matchArea && !matchStreet && !matchCity) return false;
      }

      // Category
      if (category !== 'all' && p.category !== category) return false;

      // Price range
      const numericMin = minPrice ? parseFloat(minPrice) : null;
      const numericMax = maxPrice ? parseFloat(maxPrice) : null;
      if (numericMin !== null && p.price < numericMin) return false;
      if (numericMax !== null && p.price > numericMax) return false;

      // Bedrooms
      if (bedrooms !== 'all') {
        const targetBeds = parseInt(bedrooms, 10);
        if (targetBeds === 5) {
          if ((p.details.bedrooms || 0) < 5) return false;
        } else {
          if (p.details.bedrooms !== targetBeds) return false;
        }
      }

      // Bathrooms
      if (bathrooms !== 'all') {
        const targetBaths = parseInt(bathrooms, 10);
        if (targetBaths === 4) {
          if ((p.details.bathrooms || 0) < 4) return false;
        } else {
          if (p.details.bathrooms !== targetBaths) return false;
        }
      }

      // Area Unit
      if (areaUnit !== 'all' && p.details.areaUnit !== areaUnit) return false;

      // Area Range
      const nMinArea = minArea ? parseFloat(minArea) : null;
      const nMaxArea = maxArea ? parseFloat(maxArea) : null;
      if (nMinArea !== null && p.details.coveredArea < nMinArea) return false;
      if (nMaxArea !== null && p.details.coveredArea > nMaxArea) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.viewsCount || 0) - (a.viewsCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    properties,
    purpose,
    city,
    areaKeyword,
    category,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    areaUnit,
    minArea,
    maxArea,
    sortBy,
  ]);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {purpose === 'sale'
                ? 'Properties for Sale in Pakistan'
                : purpose === 'rent'
                ? 'Properties for Rent in Pakistan'
                : 'Browse Verified Real Estate in Pakistan'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing <span className="font-bold text-slate-900 tabular-nums">{filteredProperties.length}</span> verified approved listings
              {city ? ` in ${city}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular (Views)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar Filter + Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-sm text-slate-900">Search Filters</h3>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              <div className="py-4 space-y-5 text-xs">
                {/* Purpose Tab */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    Purpose
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPurpose('all')}
                      className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                        purpose === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose('sale')}
                      className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                        purpose === 'sale' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose('rent')}
                      className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                        purpose === 'rent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Rent
                    </button>
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">All Pakistan</option>
                    {popularCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area / Keyword */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    Location / Area
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. DHA, F-8, Gulberg"
                      value={areaKeyword}
                      onChange={(e) => setAreaKeyword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    Property Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="all">All Categories</option>
                    <option value="houses">Houses & Villas</option>
                    <option value="apartments">Apartments & Flats</option>
                    <option value="residential_plots">Residential Plots</option>
                    <option value="commercial_plots">Commercial Plots</option>
                    <option value="offices">Offices</option>
                    <option value="shops">Shops</option>
                    <option value="agricultural">Agricultural & Farmhouses</option>
                    <option value="files">Plot Files</option>
                  </select>
                </div>

                {/* Price Range (PKR) */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    Price Range (PKR)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono text-[11px]"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono text-[11px]"
                    />
                  </div>
                  {/* Quick price chips */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice('5000000');
                        setMaxPrice('20000000');
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700"
                    >
                      50 Lac - 2 Cr
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice('20000000');
                        setMaxPrice('60000000');
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700"
                    >
                      2 Cr - 6 Cr
                    </button>
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    Bedrooms
                  </label>
                  <div className="flex gap-1">
                    {['all', '1', '2', '3', '4', '5'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBedrooms(b)}
                        className={`flex-1 py-1 rounded text-[11px] font-semibold border transition-colors ${
                          bedrooms === b
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {b === 'all' ? 'Any' : b === '5' ? '5+' : b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area Unit & Size */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    Area Unit
                  </label>
                  <select
                    value={areaUnit}
                    onChange={(e: any) => setAreaUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 mb-2"
                  >
                    <option value="all">Any Unit</option>
                    <option value="Marla">Marla</option>
                    <option value="Kanal">Kanal</option>
                    <option value="Sq. Ft">Sq. Ft</option>
                    <option value="Sq. Yd">Sq. Yd</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid (3 Columns) */}
          <main className="lg:col-span-3">
            {/* Active Filter Pills bar */}
            {activeFilterCount > 0 && (
              <div className="bg-white p-3 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Active Filters:</span>
                {purpose !== 'all' && (
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1">
                    For {purpose}
                    <button onClick={() => setPurpose('all')} className="hover:text-black">×</button>
                  </span>
                )}
                {city && (
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1">
                    {city}
                    <button onClick={() => setCity('')} className="hover:text-black">×</button>
                  </span>
                )}
                {category !== 'all' && (
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1">
                    {category}
                    <button onClick={() => setCategory('all')} className="hover:text-black">×</button>
                  </span>
                )}
                {bedrooms !== 'all' && (
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1">
                    {bedrooms === '5' ? '5+ Beds' : `${bedrooms} Beds`}
                    <button onClick={() => setBedrooms('all')} className="hover:text-black">×</button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-rose-600 hover:underline font-semibold ml-auto text-[11px]"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Results Grid */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">No Matching Properties Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your price range, clearing specific filters, or expanding your city search.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelect={onSelectProperty}
                    isFavorite={favorites.includes(prop.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

      </div>

      {/* Mobile Filters Slide-in Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs">
                {/* Purpose */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e: any) => setPurpose(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="all">All Purpose</option>
                    <option value="sale">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="">All Pakistan</option>
                    {popularCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="all">All</option>
                    <option value="houses">Houses</option>
                    <option value="apartments">Apartments</option>
                    <option value="residential_plots">Residential Plots</option>
                    <option value="offices">Offices</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Apply Filters ({filteredProperties.length} Results)
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full py-2 text-slate-600 font-semibold text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
