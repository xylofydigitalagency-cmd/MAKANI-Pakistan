import React, { useState } from 'react';
import { AppUser, Property, PaymentRequest, SiteSettings } from '../../types';
import { formatPricePKR, formatArea, getCategoryLabel } from '../../lib/formatters';
import { uploadToCloudinary } from '../../lib/firebase';
import {
  LayoutDashboard,
  Building,
  CreditCard,
  PlusCircle,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Smartphone,
  ExternalLink,
  Trash2,
  PauseCircle,
  PlayCircle,
  Upload,
  ShieldCheck,
  Copy,
  Receipt,
  RotateCcw,
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: AppUser;
  userProperties: Property[];
  payments: PaymentRequest[];
  siteSettings: SiteSettings;
  onPostProperty: () => void;

  onSelectProperty: (property: Property) => void;
  onUpdatePropertyStatus: (propertyId: string, status: 'approved' | 'paused') => void;
  onDeleteProperty: (propertyId: string) => void;
  onSubmitPayment: (
    method: 'Meezan Bank' | 'JazzCash' | 'EasyPaisa' | 'Nayapay',
    txId: string,
    screenshot: string
  ) => { success: boolean; payment?: PaymentRequest; error?: string };
  initialTab?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  userProperties,
  payments,
  siteSettings,
  onPostProperty,

  onSelectProperty,
  onUpdatePropertyStatus,
  onDeleteProperty,
  onSubmitPayment,
  initialTab = 'properties',
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'payments' | 'buy_credits' | 'analytics'>(
    (initialTab as any) || 'properties'
  );

  // Buy Credits Form state
  const [paymentMethod, setPaymentMethod] = useState<'Meezan Bank' | 'JazzCash' | 'EasyPaisa' | 'Nayapay'>('Meezan Bank');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentRequest | null>(null);
  const [copiedBankText, setCopiedBankText] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const handleReceiptSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPaymentError('');
    setUploadingReceipt(true);
    try {
      setScreenshotUrl(await uploadToCloudinary(file));
    } catch (err: any) {
      setPaymentError(err?.message || 'Receipt upload fail ho gayi. Dobara try karen.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Property deletion confirmation modal
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Metrics
  const totalListings = userProperties.length;
  const publishedCount = userProperties.filter((p) => p.status === 'approved').length;
  const pendingCount = userProperties.filter((p) => p.status === 'pending').length;
  const rejectedCount = userProperties.filter((p) => p.status === 'rejected').length;
  const totalViews = userProperties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!transactionId.trim()) {
      setPaymentError('Please enter your transfer Transaction ID / Reference Number.');
      return;
    }

    if (!screenshotUrl) {
      setPaymentError('Payment receipt screenshot upload karna zaroori hai.');
      return;
    }

    const res = onSubmitPayment(paymentMethod, transactionId.trim(), screenshotUrl);

    if (res.success && res.payment) {
      setPaymentSuccess(res.payment);
      setTransactionId('');
      setScreenshotUrl('');
    } else {
      setPaymentError(res.error || 'Failed to submit payment.');
    }
  };

  const copyBankDetails = () => {
    const text = `Bank: Meezan Bank Ltd\nAccount: ${siteSettings.receivingAccounts.meezanBank.accountTitle}\nIBAN: ${siteSettings.receivingAccounts.meezanBank.iban}\nAccount No: ${siteSettings.receivingAccounts.meezanBank.accountNumber}`;
    navigator.clipboard.writeText(text);
    setCopiedBankText(true);
    setTimeout(() => setCopiedBankText(false), 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card & Credits Summary Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* User Info */}
            <div className="flex items-center gap-4">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xl">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">{currentUser.displayName}</h1>
                  {currentUser.role === 'admin' ? (
                    <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Administrator
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Verified Advertiser
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {currentUser.phoneNumber ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Phone className="w-3.5 h-3.5" />
                      {currentUser.phoneNumber}
                    </span>
                  ) : (
                    <span className="text-slate-500">Phone number pehli property post karte waqt add hoga</span>
                  )}
                </div>
              </div>
            </div>

            {/* Publication Credit Meters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Free Allowance
                </span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {currentUser.freeCreditsRemaining}
                  <span className="text-xs font-normal text-slate-400"> / 5</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Approved Ads</span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center min-w-[120px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Paid Credits
                </span>
                <span className="text-2xl font-bold text-emerald-800 tabular-nums">
                  {currentUser.paidCreditsRemaining}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">From Packages</span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onPostProperty}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post New Property</span>
                </button>
                <button
                  onClick={() => setActiveTab('buy_credits')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Buy 14 Credits (Rs. 500)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-1">Total Submissions</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{totalListings}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-emerald-800 block mb-1">Published Active</span>
              <span className="text-lg font-bold text-emerald-800 tabular-nums">{publishedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-amber-800 block mb-1">Pending Approval</span>
              <span className="text-lg font-bold text-amber-800 tabular-nums">{pendingCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
              <span className="text-rose-800 block mb-1">Rejected</span>
              <span className="text-lg font-bold text-rose-800 tabular-nums">{rejectedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-1">Total Property Views</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{totalViews}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-2.5 px-4 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'properties'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>My Properties ({userProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('buy_credits')}
            className={`py-2.5 px-4 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'buy_credits'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Buy Listing Credits (PKR 500)</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2.5 px-4 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Payment History ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 px-4 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Traffic & Views</span>
          </button>
        </div>

        {/* TAB 1: My Properties */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {userProperties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">You haven&apos;t posted any properties yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Take advantage of your 5 free publication credits and reach thousands of verified buyers across Pakistan.
                  </p>
                </div>
                <button
                  onClick={onPostProperty}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Your First Property</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-5 justify-between"
                  >
                    {/* Thumbnail & Core Info */}
                    <div className="flex gap-4">
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-28 h-24 sm:w-36 sm:h-28 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {/* Status Badge */}
                          {prop.status === 'approved' && (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Published / Active
                            </span>
                          )}
                          {prop.status === 'pending' && (
                            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Awaiting Admin Approval
                            </span>
                          )}
                          {prop.status === 'rejected' && (
                            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Rejected by Admin
                            </span>
                          )}
                          {prop.status === 'paused' && (
                            <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              Paused
                            </span>
                          )}
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-mono text-[11px]">ID: {prop.id}</span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors cursor-pointer" onClick={() => onSelectProperty(prop)}>
                          {prop.title}
                        </h3>

                        <p className="text-xs text-slate-500">
                          {prop.location.area}, {prop.location.city} · {formatArea(prop.details.coveredArea, prop.details.areaUnit)}
                        </p>

                        <div className="font-bold text-slate-900 text-sm">
                          {formatPricePKR(prop.price)}
                        </div>

                        {/* Rejection Reason Notice */}
                        {prop.status === 'rejected' && prop.rejectionReason && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 mt-2">
                            <strong>Admin feedback:</strong> {prop.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex sm:flex-col justify-between sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right sm:text-right">
                        <span className="text-xs text-slate-500 block">Unique Views</span>
                        <span className="text-base font-bold text-slate-900 tabular-nums flex items-center gap-1 sm:justify-end">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {prop.viewsCount || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectProperty(prop)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          View Live
                        </button>

                        {prop.status === 'approved' && (
                          <button
                            onClick={() => onUpdatePropertyStatus(prop.id, 'paused')}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Pause Listing"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        )}

                        {prop.status === 'paused' && (
                          <button
                            onClick={() => onUpdatePropertyStatus(prop.id, 'approved')}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="Activate Listing"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setPropertyToDelete(prop)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Buy Credits (PKR 500 for 14 Credits) */}
        {activeTab === 'buy_credits' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Purchase Seller Package (14 Listing Credits)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fixed price: PKR 500 · Subject to manual administrator verification
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-emerald-800">Rs. 500</span>
                    <span className="text-[10px] text-slate-400 block font-medium">14 Credits</span>
                  </div>
                </div>

                {paymentSuccess ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-emerald-900 text-base">Payment Request Submitted!</h3>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                      Your reference number is <strong className="font-mono">{paymentSuccess.id}</strong> (TxID: {paymentSuccess.transactionId}). An administrator will review your transfer and grant 14 credits to your account.
                    </p>
                    <button
                      onClick={() => {
                        setPaymentSuccess(null);
                        setActiveTab('payments');
                      }}
                      className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900"
                    >
                      View in Payment History
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-5 text-xs text-slate-700">
                    {paymentError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {/* Step A: Select Payment Channel */}
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Step 1: Select Payment Method Used
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Meezan Bank', 'JazzCash', 'EasyPaisa', 'Nayapay'] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                              paymentMethod === method
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step B: Enter Transaction ID */}
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Step 2: Transaction ID / Ref Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MEZN99201083 or TID 849201934"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono uppercase"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Must match the transaction reference generated by your bank or mobile wallet app.
                      </p>
                    </div>

                    {/* Step C: Payment Screenshot (Cloudinary) */}
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Step 3: Transfer Receipt Screenshot <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingReceipt}
                        onChange={handleReceiptSelected}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                      />
                      {uploadingReceipt && <p className="text-[10px] text-amber-700 mt-1">Receipt upload ho rahi hai...</p>}
                      {screenshotUrl && !uploadingReceipt && (
                        <p className="text-[10px] text-emerald-700 mt-1">✓ Receipt upload ho gayi.</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        Bank / wallet transfer ka saaf screenshot upload karen.
                      </p>
                    </div>

                    {/* Safe Payment Guarantee notice */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Manual Verification Security
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        We never ask for your bank password, debit card PIN, or OTP. Credits will be credited to your account balance strictly after administrative inspection.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Payment for Verification (PKR 500)</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right 1 Col: Official Receiving Bank Accounts */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Official Receiving Accounts
                  </h3>
                  <button
                    onClick={copyBankDetails}
                    className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedBankText ? 'Copied!' : 'Copy Info'}
                  </button>
                </div>

                {/* Meezan Bank */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Meezan Bank Ltd</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Title: <strong>{siteSettings.receivingAccounts.meezanBank.accountTitle}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-slate-800">
                    A/C: {siteSettings.receivingAccounts.meezanBank.accountNumber}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    IBAN: {siteSettings.receivingAccounts.meezanBank.iban}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {siteSettings.receivingAccounts.meezanBank.branch}
                  </p>
                </div>

                {/* JazzCash */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-1 text-xs">
                  <span className="font-bold text-slate-900">JazzCash Account</span>
                  <p className="text-[11px] text-slate-600">
                    Title: <strong>{siteSettings.receivingAccounts.jazzCash.title}</strong>
                  </p>
                  <p className="text-[11px] font-mono font-bold text-slate-900">
                    Mobile: {siteSettings.receivingAccounts.jazzCash.mobileNumber}
                  </p>
                </div>

                {/* EasyPaisa */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-900">EasyPaisa Account</span>
                  <p className="text-[11px] text-slate-600">
                    Title: <strong>{siteSettings.receivingAccounts.easyPaisa.title}</strong>
                  </p>
                  <p className="text-[11px] font-mono font-bold text-slate-900">
                    Mobile: {siteSettings.receivingAccounts.easyPaisa.mobileNumber}
                  </p>
                </div>
              </div>

              {/* Package Details Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">Standard Seller Package</span>
                  <span className="font-bold text-white text-sm">PKR 500</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li>• Grants 14 verified publication credits</li>
                  <li>• Kept completely separate from free 5 credits</li>
                  <li>• Deducted only when an ad is admin-approved</li>
                  <li>• Credits do not expire</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Payment History */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">Payment Requests & Status</h2>

            {payments.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No payments submitted yet. When you purchase credits, transaction receipts and approval statuses appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-3 px-2">Ref ID</th>
                      <th className="py-3 px-2">Package</th>
                      <th className="py-3 px-2">Amount</th>
                      <th className="py-3 px-2">Method</th>
                      <th className="py-3 px-2">TxID</th>
                      <th className="py-3 px-2">Submitted</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="py-3 px-2 font-mono text-slate-600">{pay.id}</td>
                        <td className="py-3 px-2 font-medium text-slate-900">{pay.packageName}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">PKR {pay.amountPKR}</td>
                        <td className="py-3 px-2 text-slate-600">{pay.paymentMethod}</td>
                        <td className="py-3 px-2 font-mono text-slate-800">{pay.transactionId}</td>
                        <td className="py-3 px-2 text-slate-500">
                          {new Date(pay.submittedAt).toLocaleDateString('en-PK')}
                        </td>
                        <td className="py-3 px-2">
                          {pay.status === 'approved' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Approved (+14 Credits)
                            </span>
                          )}
                          {pay.status === 'pending' && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Pending Verification
                            </span>
                          )}
                          {pay.status === 'rejected' && (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Rejected ({pay.rejectionReason})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Property Analytics & Visitor Views</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Approximate unique view estimates. Page refreshes within the same browsing session are automatically deduplicated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Views (All Listings)</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalViews}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Average Views / Listing</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  {userProperties.length > 0 ? Math.round(totalViews / userProperties.length) : 0}
                </span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-xs text-emerald-800 font-semibold block">Active Marketplace Visibility</span>
                <span className="text-2xl font-bold text-emerald-800">100% Verified</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Views by Listing</h3>
              {userProperties.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{p.title}</p>
                      <p className="text-[11px] text-slate-500">{p.location.city} · {formatPricePKR(p.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{p.viewsCount} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Property Listing?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete &ldquo;{propertyToDelete.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProperty(propertyToDelete.id);
                  setPropertyToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
