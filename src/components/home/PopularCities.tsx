import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';

interface PopularCitiesProps {
  onSelectCity: (city: string) => void;
}

export const PopularCities: React.FC<PopularCitiesProps> = ({ onSelectCity }) => {
  const cities = [
    {
      name: 'Islamabad',
      tagline: 'Margalla Foothills, Diplomatic & CDA Sectors',
      count: '2,400+ properties',
      image: '/MAKANI-Pakistan/images/hero_pakistan_luxury_villa_1792498552523.jpg',
      areas: ['DHA Phase 2', 'Sector F-8', 'Sector F-7', 'Gulberg Greens'],
    },
    {
      name: 'Lahore',
      tagline: 'Heart of Punjab, Historic & Designer Mansions',
      count: '3,850+ properties',
      image: '/MAKANI-Pakistan/images/lahore_dha_designer_house_1792498553392.jpg',
      areas: ['DHA Phase 6', 'Gulberg III', 'Bahria Town', 'Model Town'],
    },
    {
      name: 'Karachi',
      tagline: 'Economic Engine, Arabian Sea Coastline & Towers',
      count: '3,120+ properties',
      image: '/MAKANI-Pakistan/images/karachi_clifton_apartment_1792498554473.jpg',
      areas: ['Clifton', 'DHA Phase 8', 'Bahria Karachi', 'PECHS'],
    },
    {
      name: 'Rawalpindi',
      tagline: 'Twin City Hub, Bahria Town & Cantt Estates',
      count: '1,840+ properties',
      image: '/MAKANI-Pakistan/images/islamabad_sector_bungalow_1792498556078.jpg',
      areas: ['Bahria Town Ph 4', 'Chaklala Scheme 3', 'Safari Valley'],
    },
    {
      name: 'Peshawar',
      tagline: 'Gateway to North, Prime Cantt & University Town',
      count: '680+ properties',
      image: '/MAKANI-Pakistan/images/commercial_gulberg_plaza_1792498554695.jpg',
      areas: ['University Town', 'Hayatabad', 'Regi Model Town'],
    },
    {
      name: 'Multan',
      tagline: 'City of Saints, Expanding DHA & Royal Orchards',
      count: '540+ properties',
      image: '/MAKANI-Pakistan/images/lahore_dha_designer_house_1792498553392.jpg',
      areas: ['DHA Multan', 'Royal Orchard', 'Cantt Residential'],
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Explore Popular Cities in Pakistan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Find verified residential and commercial listings in high-demand Pakistani urban centers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div
              key={city.name}
              onClick={() => onSelectCity(city.name)}
              className="group bg-slate-900 rounded-xl overflow-hidden relative cursor-pointer shadow-sm hover:shadow-xl transition-all h-64 flex flex-col justify-end p-5"
            >
              {/* Background Image */}
              <img
                src={city.image}
                alt={city.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-65 group-hover:brightness-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Content */}
              <div className="relative z-10 text-white">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-lg font-bold flex items-center gap-1.5 text-white">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {city.name}
                  </h3>

                </div>
                <p className="text-xs text-slate-300 line-clamp-1 mb-3">{city.tagline}</p>

                {/* Popular areas */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {city.areas.map((a) => (
                    <span
                      key={a}
                      className="text-[10px] bg-white/15 backdrop-blur-xs text-white px-2 py-0.5 rounded"
                    >
                      {a}
                    </span>
                  ))}
                  <span className="text-[10px] text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5 ml-auto">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
