import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, SlidersHorizontal, ArrowRight, ShieldCheck } from 'lucide-react';
import { ListingPurpose } from '../../types';

interface HeroSearchProps {
  onSearch: (params: {
    purpose: ListingPurpose;
    city?: string;
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  onPostProperty: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, onPostProperty }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'sell'>('buy');
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const popularCities = [
    'Islamabad',
    'Lahore',
    'Karachi',
    'Rawalpindi',
    'Peshawar',
    'Multan',
    'Faisalabad',
  ];

  const handleTabChange = (tab: 'buy' | 'rent' | 'sell') => {
    if (tab === 'sell') {
      onPostProperty();
    } else {
      setActiveTab(tab);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (priceRange === 'under_50lac') {
      maxPrice = 5000000;
    } else if (priceRange === '50lac_1crore') {
      minPrice = 5000000;
      maxPrice = 10000000;
    } else if (priceRange === '1crore_3crore') {
      minPrice = 10000000;
      maxPrice = 30000000;
    } else if (priceRange === '3crore_5crore') {
      minPrice = 30000000;
      maxPrice = 50000000;
    } else if (priceRange === 'above_5crore') {
      minPrice = 50000000;
    }

    onSearch({
      purpose: activeTab === 'rent' ? 'rent' : 'sale',
      city: city || undefined,
      keyword: keyword || undefined,
      category: category === 'all' ? undefined : category,
      minPrice,
      maxPrice,
    });
  };

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Image with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_pakistan_luxury_villa_1792498552523.jpg"
          alt="Contemporary luxury villa in Islamabad Pakistan"
          className="w-full h-full object-cover object-center filter brightness-65 scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        
        {/* Trust pill / kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs text-emerald-400 font-medium mb-5 shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pakistan&apos;s Verified Real Estate Network · 5 Free Listing Credits</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-4 text-balance">
          Find Your Place. <br className="hidden sm:block" />
          <span className="text-emerald-400">Make Your Move.</span>
        </h1>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto mb-8 font-normal leading-relaxed text-balance">
          Browse verified houses, apartments, residential plots, and commercial properties across Islamabad, Lahore, Karachi, Rawalpindi, and all major Pakistani cities.
        </p>

        {/* Search Module Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 text-left border border-slate-200 max-w-4xl mx-auto backdrop-blur-md">
          {/* Segmented Tabs (Buy, Rent, Sell) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 w-fit">
            <button
              type="button"
              onClick={() => handleTabChange('buy')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'buy'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('rent')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'rent'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rent
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('sell')}
              className="px-5 py-2 text-xs font-semibold rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Post / Sell</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                Free 5 Ads
              </span>
            </button>
          </div>

          {/* Search Fields Grid */}
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* City Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="">All Pakistan</option>
                    {popularCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location or Area Keyword */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location / Area
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. DHA, Bahria, F-8, Gulberg"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Property Category */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Property Type
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="all">All Types</option>
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
              </div>

              {/* Price Range (in Lacs / Crores) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Price Budget (PKR)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="all">Any Price</option>
                    <option value="under_50lac">Under 50 Lacs</option>
                    <option value="50lac_1crore">50 Lacs - 1 Crore</option>
                    <option value="1crore_3crore">1 Crore - 3 Crores</option>
                    <option value="3crore_5crore">3 Crores - 5 Crores</option>
                    <option value="above_5crore">Above 5 Crores</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom action row with City Quick tags & Search Button */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
                <span className="font-medium text-slate-700">Quick Cities:</span>
                {popularCities.slice(0, 5).map((quickCity) => (
                  <button
                    key={quickCity}
                    type="button"
                    onClick={() => setCity(quickCity)}
                    className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                      city === quickCity
                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                        : 'hover:text-slate-900 bg-slate-100'
                    }`}
                  >
                    {quickCity}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
};
