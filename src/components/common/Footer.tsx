import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Building, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, extraParams?: Record<string, any>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
                M
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Makani<span className="text-emerald-400">.pk</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan&apos;s premier real estate marketplace. Browse verified houses, apartments, residential plots, and commercial properties across Islamabad, Lahore, Karachi, Rawalpindi, and major Pakistani metropolitan regions with complete transparency.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-400">

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>xylofydigitalcompany@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pakistan</span>
              </div>
            </div>
          </div>

          {/* Popular Cities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Popular Cities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('search', { city: 'Islamabad' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Properties in Islamabad
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { city: 'Lahore' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Properties in Lahore
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { city: 'Karachi' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Properties in Karachi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { city: 'Rawalpindi' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Properties in Rawalpindi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { city: 'Peshawar' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Properties in Peshawar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { city: 'Multan' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Properties in Multan
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('search', { purpose: 'sale' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Houses for Sale
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { purpose: 'rent' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Apartments for Rent
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'residential_plots' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Residential Plots
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search', { category: 'offices' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Commercial Offices
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reviews')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Website Ratings & Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard', { tab: 'payments' })}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Seller Packages (Rs. 500)
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('safety')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Property Safety Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  About Our Platform
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Help Centre & Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Pakistani Verification Standards */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Google Verified Sellers</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every listing requires Google sign-in and a valid Pakistani mobile number before ad submission.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Minimum 3 Authentic Photos</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Strict listing quality standards require at least 3 genuine property images and administrator approval.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">5 Free Listings Quota</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every genuine Pakistani property owner gets 5 free published listings. Paid package provides 14 credits at Rs. 500.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Makani Pakistan. All rights reserved. Built for Pakistani Real Estate.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Islamabad</span>
            <span>·</span>
            <span>Lahore</span>
            <span>·</span>
            <span>Karachi</span>
            <span>·</span>
            <span>Rawalpindi</span>
            <span>·</span>
            <span>Peshawar</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
