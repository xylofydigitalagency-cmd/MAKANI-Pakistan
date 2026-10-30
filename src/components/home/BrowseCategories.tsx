import React from 'react';
import { Home, Building2, Map, Landmark, Store, Briefcase, Trees, FileText } from 'lucide-react';
import { PropertyCategory } from '../../types';

interface BrowseCategoriesProps {
  onSelectCategory: (category: PropertyCategory) => void;
}

export const BrowseCategories: React.FC<BrowseCategoriesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'houses' as PropertyCategory,
      title: 'Houses & Villas',
      count: '3,800+ listings',
      icon: Home,
    },
    {
      id: 'apartments' as PropertyCategory,
      title: 'Flats & Apartments',
      count: '1,420+ listings',
      icon: Building2,
    },
    {
      id: 'residential_plots' as PropertyCategory,
      title: 'Residential Plots',
      count: '4,100+ plots',
      icon: Map,
    },
    {
      id: 'commercial_plots' as PropertyCategory,
      title: 'Commercial Plots',
      count: '820+ plots',
      icon: Landmark,
    },
    {
      id: 'shops' as PropertyCategory,
      title: 'Shops & Plazas',
      count: '640+ spaces',
      icon: Store,
    },
    {
      id: 'offices' as PropertyCategory,
      title: 'Commercial Offices',
      count: '590+ offices',
      icon: Briefcase,
    },
    {
      id: 'agricultural' as PropertyCategory,
      title: 'Farmhouses & Land',
      count: '310+ farmhouses',
      icon: Trees,
    },
    {
      id: 'files' as PropertyCategory,
      title: 'Plot Files',
      count: '1,200+ files',
      icon: FileText,
    },
  ];

  return (
    <section className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Browse by Property Type
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore residential, commercial, and investment opportunities across Pakistan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {cat.title}
                  </h3>

                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
