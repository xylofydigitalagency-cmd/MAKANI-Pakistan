import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StaticPageProps {
  page: 'about' | 'contact' | 'safety' | 'terms' | 'privacy' | 'faq';
  onNavigate: (view: string, extra?: Record<string, any>) => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page, onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SAFETY GUIDELINES */}
        {page === 'safety' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pakistani Real Estate Security Protocol</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Property Safety & Verification Guidelines
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Essential safeguards for Pakistani property transactions in Islamabad, Lahore, Karachi, Rawalpindi, and beyond.
              </p>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  Golden Rule: Never Pay Advance Token Without In-Person Inspection
                </h3>
                <p className="text-xs text-amber-800">
                  Never transfer bayana or booking token money via EasyPaisa, JazzCash, or online bank transfer to any seller or agent before meeting them in person, physically inspecting the property, and viewing original documents.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Key Verification Checklist:</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">1. Society Allotment & NDC Check</span>
                    <p className="text-slate-600">
                      In housing authorities like DHA, Bahria Town, or CDA sectors, always request a verified No Demand Certificate (NDC) and official verification slip directly from the authority transfer office.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">2. Title Deed / Fard & Registry</span>
                    <p className="text-slate-600">
                      For revenue land, ensure the Fard Malkiyat (فرد ملکیت) is verified from the local Arazi Record Center (PLRA) and matches the seller’s CNIC.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">3. Approved Building Map</span>
                    <p className="text-slate-600">
                      Verify that houses and commercial plazas have an approved sanctioned plan from the relevant municipal agency (CDA, RDA, LDA, KDA) with zero non-conforming bylaws.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">4. Utility Clearance Slips</span>
                    <p className="text-slate-600">
                      Check paid receipts for Sui Gas, WAPDA/IESCO/LESCO/K-Electric, and WASA to ensure no accumulated arrears exist.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <span>Suspect fraudulent activity on Makani.pk?</span>
                <button
                  onClick={() => onNavigate('contact')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Contact Fraud Prevention Desk →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT US */}
        {page === 'about' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                About Makani Pakistan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Pakistan&apos;s Next-Generation Verified Property Discovery Network
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>Makani Pakistan</strong> was conceived to address the persistent challenges in Pakistan&apos;s real estate classifieds market: phantom listings, expired advertisements, broker price inflations, and unverified contacts.
              </p>
              <p>
                Our platform introduces a strictly moderated ecosystem where every property requires at least 3 genuine photographs, mandatory Google authentication, and a valid Pakistani mobile (+92) contact number.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-2xl font-bold text-slate-900 block">5 Free</span>
                  <span className="text-xs text-slate-500">Listings for Every Seller</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-2xl font-bold text-emerald-800 block">100%</span>
                  <span className="text-xs text-slate-500">Admin-Inspected Listings</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-2xl font-bold text-slate-900 block">Rs. 500</span>
                  <span className="text-xs text-slate-500">14 Verified Paid Credits</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT US & OFFICES */}
        {page === 'contact' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Contact & Regional Offices
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Get in touch with our customer support and verification team across Pakistan.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1 text-xs">
              <span className="font-bold text-slate-900 block">Email Support</span>
              <p className="text-emerald-700 font-mono">xylofydigitalagency@gmail.com</p>
            </div>

            {/* Contact Form */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Send an Official Message</h3>
              {contactSubmitted ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thank you. Your message has been forwarded to our support team.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                      <input type="text" required placeholder="Full Name" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Email</label>
                      <input type="email" required placeholder="name@example.com" className="w-full p-2 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Message / Inquiry</label>
                    <textarea rows={4} required placeholder="How can we assist you with Pakistani property listings or packages?" className="w-full p-2 border rounded-lg" />
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-lg cursor-pointer">
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* FAQS & HELP */}
        {page === 'faq' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Everything you need to know about publishing, quotas, and verified purchases.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Can I browse properties without creating an account?',
                  a: 'Yes! Anyone can freely browse, search, and view all approved property photographs without registering. You only need Google sign-in if you want to publish a property or reveal owner contact details.',
                },
                {
                  q: 'How many free property advertisements do I receive?',
                  a: 'Every registered Google user receives five (5) free published listings, subject to administrator approval. Your credits are only deducted once your ad is reviewed and approved.',
                },
                {
                  q: 'How does the Rs. 500 paid package work?',
                  a: 'Our Standard Seller Package provides 14 additional listing publication credits for PKR 500 via manual bank or mobile wallet transfer (Meezan Bank, JazzCash, EasyPaisa). These 14 credits are kept completely separate from your 5 free credits.',
                },
                {
                  q: 'Why do I need to add my phone number?',
                  a: 'A valid Pakistani mobile number is required on every listing so that genuine buyers can contact the owner directly. Combined with Google sign-in and admin moderation, this keeps broker spam and fake ads away.',
                },
                {
                  q: 'Why is my property in "Pending" status?',
                  a: 'To maintain the highest quality standards, every submitted listing is reviewed by our quality assurance team within a few hours before appearing in public search results.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TERMS & CONDITIONS */}
        {page === 'terms' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl font-extrabold text-slate-900">Terms & Conditions</h1>
            <p>
              By accessing Makani Pakistan, you agree to comply with Pakistani real estate laws and platform guidelines. Advertisers warrant that they have legal authority to sell or lease the advertised property and that photographs represent the genuine property.
            </p>
            <p>
              Administrator decisions on listing approvals, rejections, and quota allocations are final and aimed at maintaining marketplace integrity.
            </p>
          </div>
        )}

        {/* PRIVACY POLICY */}
        {page === 'privacy' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
            <p>
              We respect your privacy. Owner phone numbers are protected from public automated harvesting and only displayed to authenticated Google users. We do not sell or trade user contact information to unauthorized third-party broker networks.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
