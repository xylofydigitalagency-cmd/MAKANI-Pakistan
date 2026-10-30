import React from 'react';
import { ShieldCheck, Smartphone, CheckCircle, CreditCard, Sparkles, ArrowRight } from 'lucide-react';

interface TrustSafetySectionProps {
  onPostProperty: () => void;
  onNavigateSafety: () => void;
}

export const TrustSafetySection: React.FC<TrustSafetySectionProps> = ({
  onPostProperty,
  onNavigateSafety,
}) => {
  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Guarantees Grid */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Setting the Standard for Real Estate in Pakistan
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Built from the ground up to eradicate phantom listings, broker spam, and unauthorized duplicate advertisements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">
              Admin Verified Approvals
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every single property submission undergoes manual administrator inspection before appearing publicly in search results.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">
              Verified Pakistani Contact Numbers
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              All advertisers must sign in with Google and provide a valid +92 Pakistani mobile number before publishing listings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">
              Minimum 3 Authentic Photos
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No generic placeholder images or single-photo stubs. High standards require at least 3 genuine photographs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">
              5 Free Ads + Rs. 500 Package
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every genuine seller receives 5 free listings. Need more? Get 14 extra verified credits for only PKR 500 via Meezan or JazzCash.
            </p>
          </div>
        </div>

        {/* Post Property Banner CTA */}
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Advertisement Allowance Available</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Are you an Owner, Builder, or Verified Agent?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Publish your property in minutes with direct buyer enquiries, protected contact details, and zero commission intermediaries.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onPostProperty}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Post Your Property for Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigateSafety}
                className="px-5 py-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Read Safety Guidelines
              </button>
            </div>
          </div>

          {/* Decorative subtle backdrop accent */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
            <img
              src="/MAKANI-Pakistan/images/hero_pakistan_luxury_villa_1792498552523.jpg"
              alt="Villa"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
