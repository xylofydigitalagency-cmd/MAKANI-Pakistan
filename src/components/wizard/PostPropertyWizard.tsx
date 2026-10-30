import React, { useState } from 'react';
import {
  ListingPurpose,
  PropertyCategory,
  PropertyClassification,
  AreaUnit,
  AppUser,
  Property,
} from '../../types';
import { formatPricePKR, formatArea, getCategoryLabel, normalizePkMobile } from '../../lib/formatters';
import { uploadToCloudinary } from '../../lib/firebase';
import {
  Home,
  MapPin,
  FileText,
  Image as ImageIcon,
  Phone,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface PostPropertyWizardProps {
  currentUser: AppUser | null;
  onOpenGoogleAuth: () => void;

  onSubmitProperty: (data: any) => { success: boolean; property?: Property; error?: string };
  onNavigateDashboard: () => void;
  onNavigateBuyCredits: () => void;
}



export const PostPropertyWizard: React.FC<PostPropertyWizardProps> = ({
  currentUser,
  onOpenGoogleAuth,

  onSubmitProperty,
  onNavigateDashboard,
  onNavigateBuyCredits,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedProperty, setSubmittedProperty] = useState<Property | null>(null);

  // Form State
  // Step 1
  const [purpose, setPurpose] = useState<ListingPurpose>('sale');
  const [category, setCategory] = useState<PropertyCategory>('houses');
  const [classification, setClassification] = useState<PropertyClassification>('residential');

  // Step 2
  const [province, setProvince] = useState('Islamabad Capital Territory');
  const [city, setCity] = useState('Islamabad');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');

  // Step 3
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePKR, setPricePKR] = useState<number | ''>('');
  const [priceNegotiable, setPriceNegotiable] = useState(true);
  const [coveredArea, setCoveredArea] = useState<number | ''>('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('Marla');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [floors, setFloors] = useState<number>(2);
  const [parkingSpaces, setParkingSpaces] = useState<number>(2);
  const [furnishing, setFurnishing] = useState<'Unfurnished' | 'Semi-Furnished' | 'Furnished'>('Unfurnished');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Sui Gas Connected',
    'Electricity Meter Installed',
    'Water Supply Bore',
  ]);

  // Step 4: Images (Strict requirement: AT LEAST 3 PHOTOS)
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 5: Contact
  const [ownerName, setOwnerName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.phoneNumber || '');
  const [contactPreference, setContactPreference] = useState<'call' | 'whatsapp' | 'both'>('both');

  const standardAmenitiesList = [
    'Sui Gas Connected',
    'Electricity Meter Installed',
    'Water Supply Bore',
    'Solar Inverter Backup',
    '24/7 Security Guard',
    'CCTV Surveillance',
    'Servant Quarter',
    'Corner Plot Orientation',
    'Park Facing',
    'Italian / Modern Kitchen',
    'Imported Marble Flooring',
    'Gated Community',
  ];

  const totalCredits = (currentUser?.freeCreditsRemaining || 0) + (currentUser?.paidCreditsRemaining || 0);

  // Check login requirement
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign in to Post Your Property</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Makani Pakistan requires Google authentication and a valid Pakistani mobile number to prevent duplicate listings and protect genuine buyers. Every new user receives <strong>5 Free Published Listings</strong>.
          </p>
          <button
            onClick={onOpenGoogleAuth}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Continue with Google</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Quota exhausted notice
  if (totalCredits <= 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4">
        <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center shadow-lg space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Listing Credits Exhausted</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            You have used all 5 of your free listing credits. To publish new advertisements, purchase our Standard Seller Package: <strong>14 listing credits for only PKR 500</strong>.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onNavigateBuyCredits}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Purchase 14 Credits (Rs. 500)
            </button>
            <button
              onClick={onNavigateDashboard}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submission Completed View
  if (submittedProperty) {
    return (
      <div className="max-w-2xl mx-auto my-16 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xl space-y-5 animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Property Submitted Successfully!</h2>
            <p className="text-xs text-emerald-800 font-semibold mt-1">
              Status: Awaiting Administrator Approval (Pending)
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Property Title:</span>
              <span className="font-bold text-slate-900">{submittedProperty.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reference ID:</span>
              <span className="font-mono text-slate-800">{submittedProperty.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Price:</span>
              <span className="font-bold text-slate-900">{formatPricePKR(submittedProperty.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">City / Location:</span>
              <span>{submittedProperty.location.area}, {submittedProperty.location.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Photographs:</span>
              <span>{submittedProperty.images.length} verified photos uploaded</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Our quality compliance team inspects every listing before making it visible in public search results. Your credit will be consumed once approved. You can track this listing in your advertiser dashboard.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onNavigateDashboard}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              View in My Dashboard
            </button>
            <button
              onClick={() => {
                setSubmittedProperty(null);
                setCurrentStep(1);
                setTitle('');
                setDescription('');
                setPricePKR('');
                setArea('');
              }}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Submit Another Property
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step Validation Helpers
  const handleNext = () => {
    setErrorMsg('');

    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!area.trim()) {
        setErrorMsg('Please specify the Area or Neighbourhood (e.g. DHA Phase 2, Bahria Town, Sector F-8).');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!title.trim() || title.length < 8) {
        setErrorMsg('Please provide a clear property title (at least 8 characters).');
        return;
      }
      if (!pricePKR || pricePKR <= 0) {
        setErrorMsg('Please enter a valid price in PKR.');
        return;
      }
      if (!coveredArea || coveredArea <= 0) {
        setErrorMsg('Please specify covered area size.');
        return;
      }
      if (!description.trim() || description.length < 20) {
        setErrorMsg('Please enter a comprehensive description (at least 20 characters).');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Step 4 Validation: REQUIRE AT LEAST 3 PHOTOS
      if (images.length < 3) {
        setErrorMsg('Validation Error: You must include AT LEAST 3 valid property photographs.');
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!ownerName.trim()) {
        setErrorMsg('Apna poora naam likhen.');
        return;
      }
      if (!normalizePkMobile(phone)) {
        setErrorMsg('Sahi Pakistani mobile number likhen (e.g. 0300 1234567 ya +92 300 1234567).');
        return;
      }
      if (whatsapp.trim() && !normalizePkMobile(whatsapp)) {
        setErrorMsg('WhatsApp number sahi format mein likhen ya khali chhor den.');
        return;
      }
      setCurrentStep(6);
    }
  };

  const handleFinalSubmit = () => {
    setErrorMsg('');

    if (!normalizePkMobile(phone)) {
      setErrorMsg('Sahi Pakistani mobile number zaroori hai (e.g. 0300 1234567).');
      return;
    }

    if (images.length < 3) {
      setErrorMsg('At least 3 valid photographs are required.');
      return;
    }

    const payload = {
      title,
      description,
      price: Number(pricePKR),
      priceNegotiable,
      purpose,
      category,
      classification,
      location: {
        country: 'Pakistan' as const,
        province,
        city,
        area,
        street,
        coordinates: {
          lat: city === 'Islamabad' ? 33.6844 : city === 'Lahore' ? 31.5204 : 24.8607,
          lng: city === 'Islamabad' ? 73.0479 : city === 'Lahore' ? 74.3587 : 67.0011,
        },
      },
      details: {
        bedrooms: ['houses', 'apartments'].includes(category) ? bedrooms : undefined,
        bathrooms: ['houses', 'apartments', 'offices'].includes(category) ? bathrooms : undefined,
        coveredArea: Number(coveredArea),
        areaUnit,
        floors,
        parkingSpaces,
        furnishing,
        amenities: selectedAmenities,
        builtYear: 2025,
      },
      images,
      contact: {
        ownerName: ownerName || currentUser.displayName,
        phone: normalizePkMobile(phone) || phone,
        whatsapp: normalizePkMobile(whatsapp) || normalizePkMobile(phone) || phone,
        contactPreference,
        ownerEmail: currentUser.email,
        ownerId: currentUser.uid,
      },
      featured: false,
    };

    const res = onSubmitProperty(payload);
    if (res.success && res.property) {
      setSubmittedProperty(res.property);
    } else {
      setErrorMsg(res.error || 'Failed to submit property.');
    }
  };

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const removePhoto = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (images.length + files.length > 15) {
      setErrorMsg('Maximum 15 photos allowed hain.');
      return;
    }
    setErrorMsg('');
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        urls.push(await uploadToCloudinary(f));
      }
      setImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Image upload fail ho gayi. Dobara try karen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wizard Header & Quota Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Submit Property for Sale or Rent
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Multi-step listing wizard · Quality verified Pakistani real estate
              </p>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-emerald-900 font-semibold">Available Quota: </span>
                <span className="font-bold text-emerald-800">
                  {currentUser.freeCreditsRemaining} Free · {currentUser.paidCreditsRemaining} Paid
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-900">
                Step {currentStep} of 6: {
                  currentStep === 1 ? 'Purpose & Category' :
                  currentStep === 2 ? 'Location Details' :
                  currentStep === 3 ? 'Property Details' :
                  currentStep === 4 ? 'Property Photographs' :
                  currentStep === 5 ? 'Contact Information' :
                  'Review & Submit'
                }
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">
                {Math.round((currentStep / 6) * 100)}% Completed
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Step Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          
          {/* STEP 1: Purpose & Category */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  1. Listing Purpose & Property Category
                </h3>
                <p className="text-xs text-slate-500">
                  Select whether you are listing for sale or for rent, and pick the appropriate property type.
                </p>
              </div>

              {/* Purpose Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Listing Purpose
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setPurpose('sale')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      purpose === 'sale'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Sell Property
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurpose('rent')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      purpose === 'rent'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Rent Out Property
                  </button>
                </div>
              </div>

              {/* Classification */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Classification
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="classification"
                      value="residential"
                      checked={classification === 'residential'}
                      onChange={() => setClassification('residential')}
                      className="text-emerald-600"
                    />
                    <span>Residential</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="classification"
                      value="commercial"
                      checked={classification === 'commercial'}
                      onChange={() => setClassification('commercial')}
                      className="text-emerald-600"
                    />
                    <span>Commercial / Industrial</span>
                  </label>
                </div>
              </div>

              {/* Category Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'houses', label: 'Houses & Villas' },
                    { id: 'apartments', label: 'Apartments & Flats' },
                    { id: 'residential_plots', label: 'Residential Plots' },
                    { id: 'commercial_plots', label: 'Commercial Plots' },
                    { id: 'files', label: 'Plot Files' },
                    { id: 'shops', label: 'Shops & Showrooms' },
                    { id: 'offices', label: 'Commercial Offices' },
                    { id: 'buildings', label: 'Complete Buildings' },
                    { id: 'warehouses', label: 'Warehouses / Godowns' },
                    { id: 'agricultural', label: 'Agricultural & Farmhouses' },
                    { id: 'commercial', label: 'Other Commercial' },
                    { id: 'other', label: 'Other Real Estate' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as PropertyCategory)}
                      className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        category === cat.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  2. Location & Address in Pakistan
                </h3>
                <p className="text-xs text-slate-500">
                  Accurate Pakistani location helps buyers discover your property on maps and nearby searches.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Province / Region
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Area / Society / Sector <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DHA Phase 2, Bahria Town, Sector F-8, Gulberg III"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street / Block / Lane (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Street 34, Sector B, Main Boulevard"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Geocoded to Pakistan. Exact coordinates will be mapped automatically.</span>
              </div>
            </div>
          )}

          {/* STEP 3: Property Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  3. Property Details, Specifications & Pricing
                </h3>
                <p className="text-xs text-slate-500">
                  Provide descriptive information and Pakistani unit sizing (Marla, Kanal, Sq. Ft).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Property Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Kanal Modern Luxury Designer Villa with Margalla View"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Price in PKR <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45000000 (4.5 Crore)"
                    value={pricePKR}
                    onChange={(e) => setPricePKR(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                  {pricePKR && typeof pricePKR === 'number' && (
                    <div className="mt-1 text-xs font-bold text-emerald-700">
                      PKR Verbal Format: {formatPricePKR(pricePKR)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceNegotiable}
                      onChange={(e) => setPriceNegotiable(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Price is Negotiable (کمی بیشی ممکن ہے)</span>
                  </label>
                </div>
              </div>

              {/* Area Size & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Area Size Value <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10 or 1"
                    value={coveredArea}
                    onChange={(e) => setCoveredArea(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Area Unit
                  </label>
                  <select
                    value={areaUnit}
                    onChange={(e: any) => setAreaUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Marla">Marla (مرلہ)</option>
                    <option value="Kanal">Kanal (کنال - 20 Marla)</option>
                    <option value="Sq. Ft">Square Feet (Sq. Ft)</option>
                    <option value="Sq. Yd">Square Yards (Gaz / گج)</option>
                  </select>
                </div>
              </div>

              {/* Bedrooms & Bathrooms (If applicable) */}
              {['houses', 'apartments'].includes(category) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bedrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bathrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Floors</label>
                    <input
                      type="number"
                      min={1}
                      value={floors}
                      onChange={(e) => setFloors(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Furnishing</label>
                    <select
                      value={furnishing}
                      onChange={(e: any) => setFurnishing(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Furnished">Furnished</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the layout, architectural finishes, tile flooring, electricity load, water connection, nearby commercial amenities, schools, and hospitals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Key Amenities & Utilities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {standardAmenitiesList.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 p-2 rounded border border-slate-200 text-xs text-slate-800 cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(item)}
                        onChange={() => toggleAmenity(item)}
                        className="rounded text-emerald-600"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Photographs (Strict Minimum 3 Rule) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  4. Property Photographs (Minimum 3 Required)
                </h3>
                <p className="text-xs text-slate-500">
                  Strict quality standards: A minimum of <strong>3 high-quality property photographs</strong> are required to submit an advertisement. Listings with fewer than 3 photos cannot be submitted.
                </p>
              </div>

              {/* Current Photos Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Selected Images ({images.length} added · {images.length >= 3 ? '✓ Minimum met' : '⚠️ Need 3 photos'}):
                  </span>
                  <span className="text-[11px] text-slate-500">First image is primary hero thumbnail</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-slate-200 group bg-slate-100"
                    >
                      <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {i === 0 ? 'Primary' : `#${i + 1}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer shadow-xs"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloudinary photo upload */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-800 block">
                  Apni property ki photos upload karen (kam az kam 3, zyada se zyada 15):
                </span>
                <label
                  className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    uploading
                      ? 'border-slate-300 text-slate-400 bg-slate-100'
                      : 'border-emerald-400 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Uploading... please wait' : 'Click karke photos select karen (JPG / PNG / WEBP, max 10MB each)'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Contact Information & Phone OTP Requirement */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  5. Owner Contact Information & Phone Number
                </h3>
                <p className="text-xs text-slate-500">
                  Sahi Pakistani mobile number zaroori hai. Buyers isi number par aap se contact karenge.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Owner / Advertiser Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              {/* Phone Number (mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number (Call) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="0300 1234567 ya +92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
                {phone && (
                  <p className={`text-[11px] mt-1 ${normalizePkMobile(phone) ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {normalizePkMobile(phone)
                      ? `✓ ${normalizePkMobile(phone)}`
                      : 'Number sahi nahi — format: 03XX XXXXXXX (Jazz, Zong, Ufone, Telenor, SCOM sab chalenge)'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Preference
                </label>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contactPref"
                      value="both"
                      checked={contactPreference === 'both'}
                      onChange={() => setContactPreference('both')}
                    />
                    <span>Phone Call & WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contactPref"
                      value="call"
                      checked={contactPreference === 'call'}
                      onChange={() => setContactPreference('call')}
                    />
                    <span>Phone Call Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contactPref"
                      value="whatsapp"
                      checked={contactPreference === 'whatsapp'}
                      onChange={() => setContactPreference('whatsapp')}
                    />
                    <span>WhatsApp Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  6. Review Your Listing Before Submission
                </h3>
                <p className="text-xs text-slate-500">
                  Please confirm all details. On submission, the listing will be saved as <strong>Pending</strong> for administrator verification.
                </p>
              </div>

              {/* Preview Summary Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="aspect-16/9 relative bg-slate-900">
                  <img src={images[0]} alt="Primary" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded font-bold uppercase">
                    For {purpose} · {getCategoryLabel(category)}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{title}</h4>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{area}, {city}, Pakistan</span>
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-lg font-bold text-slate-900">
                        {formatPricePKR(Number(pricePKR))}
                      </span>
                      {priceNegotiable && <span className="text-xs text-slate-500 ml-2">(Negotiable)</span>}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {formatArea(Number(coveredArea), areaUnit)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed">
                    <p className="font-semibold mb-1">Description:</p>
                    <p className="line-clamp-3">{description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Advertiser: <strong>{ownerName}</strong></span>
                    <span>Photos: <strong>{images.length} verified</strong></span>
                    <span>Initial Status: <strong className="text-amber-700">Pending Review</strong></span>
                  </div>
                </div>
              </div>

              {/* Submission Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Administrator Approval Process
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Upon submission, your listing is stored in the database with status &apos;pending&apos;. The administrator will review your photos and description. Once approved, exactly 1 credit will be deducted from your balance.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Submit Property for Approval</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
