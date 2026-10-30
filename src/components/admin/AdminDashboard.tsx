import React, { useState, useMemo } from 'react';
import {
  AppUser,
  Property,
  PaymentRequest,
  WebsiteReview,
  AdminAuditLog,
  SiteSettings,
} from '../../types';
import { formatPricePKR, formatArea, getCategoryLabel } from '../../lib/formatters';
import {
  Shield,
  Users,
  Building,
  CreditCard,
  MessageSquare,
  Settings,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Star,
  Search,
  Check,
  X,
  Lock,
  Unlock,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
  Save,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: AppUser;
  allProperties: Property[];
  allUsers: AppUser[];
  allPayments: PaymentRequest[];
  allReviews: WebsiteReview[];
  auditLogs: AdminAuditLog[];
  siteSettings: SiteSettings;
  onApproveProperty: (id: string) => { success: boolean; error?: string };
  onRejectProperty: (id: string, reason: string) => boolean;
  onToggleFeaturedProperty: (id: string) => boolean;
  onDeleteProperty: (id: string) => boolean;
  onSuspendUser: (userId: string, reason: string) => boolean;
  onReactivateUser: (userId: string) => boolean;
  onAdjustCredits: (userId: string, freeDelta: number, paidDelta: number, reason: string) => boolean;
  onApprovePayment: (paymentId: string) => { success: boolean; error?: string };
  onRejectPayment: (paymentId: string, reason: string) => boolean;
  onModerateReview: (reviewId: string, status: 'approved' | 'rejected') => boolean;
  onToggleFeaturedReview: (reviewId: string) => boolean;
  onDeleteReview: (reviewId: string) => boolean;
  onUpdateSiteSettings: (settings: Partial<SiteSettings>) => boolean;
  onSelectPropertyLive: (property: Property) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allProperties,
  allUsers,
  allPayments,
  allReviews,
  auditLogs,
  siteSettings,
  onApproveProperty,
  onRejectProperty,
  onToggleFeaturedProperty,
  onDeleteProperty,
  onSuspendUser,
  onReactivateUser,
  onAdjustCredits,
  onApprovePayment,
  onRejectPayment,
  onModerateReview,
  onToggleFeaturedReview,
  onDeleteReview,
  onUpdateSiteSettings,
  onSelectPropertyLive,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'pending_listings' | 'all_listings' | 'users' | 'payments' | 'reviews' | 'settings' | 'logs'
  >('overview');

  // Modals & form state
  const [rejectListingModal, setRejectListingModal] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [rejectPaymentModal, setRejectPaymentModal] = useState<PaymentRequest | null>(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState('');

  const [suspendUserModal, setSuspendUserModal] = useState<AppUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  const [adjustCreditsModal, setAdjustCreditsModal] = useState<AppUser | null>(null);
  const [creditFreeDelta, setCreditFreeDelta] = useState(0);
  const [creditPaidDelta, setCreditPaidDelta] = useState(0);
  const [creditAdjustReason, setCreditAdjustReason] = useState('');

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable settings state
  const [receivingMeezanTitle, setReceivingMeezanTitle] = useState(siteSettings.receivingAccounts.meezanBank.accountTitle);
  const [receivingMeezanNumber, setReceivingMeezanNumber] = useState(siteSettings.receivingAccounts.meezanBank.accountNumber);
  const [receivingMeezanIban, setReceivingMeezanIban] = useState(siteSettings.receivingAccounts.meezanBank.iban);
  const [receivingJazzCashNumber, setReceivingJazzCashNumber] = useState(siteSettings.receivingAccounts.jazzCash.mobileNumber);
  const [receivingEasyPaisaNumber, setReceivingEasyPaisaNumber] = useState(siteSettings.receivingAccounts.easyPaisa.mobileNumber);

  // Role Security Check
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl text-center shadow-lg space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          You are signed in as <strong>{currentUser.email}</strong>. Administrator operations require authentication with the authorized account (<strong>xylofydigitalcompany@gmail.com</strong>).
        </p>
      </div>
    );
  }

  // Calculated Stats
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => !u.isSuspended).length;
  const suspendedUsers = allUsers.filter((u) => u.isSuspended).length;

  const totalSubmissions = allProperties.length;
  const publishedListings = allProperties.filter((p) => p.status === 'approved').length;
  const pendingListings = allProperties.filter((p) => p.status === 'pending').length;
  const rejectedListings = allProperties.filter((p) => p.status === 'rejected').length;

  const totalPayments = allPayments.length;
  const pendingPayments = allPayments.filter((p) => p.status === 'pending').length;
  const approvedPayments = allPayments.filter((p) => p.status === 'approved').length;
  const totalVerifiedRevenue = approvedPayments * 500;

  const approvedReviews = allReviews.filter((r) => r.status === 'approved');
  const pendingReviews = allReviews.filter((r) => r.status === 'pending');
  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
      : '5.0';

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleApprovePropertyClick = (propertyId: string) => {
    const res = onApproveProperty(propertyId);
    if (res.success) {
      showNotification('success', 'Property approved and published to public search. 1 credit deducted.');
    } else {
      showNotification('error', res.error || 'Failed to approve property.');
    }
  };

  const handleConfirmRejectProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectListingModal || !rejectionReason.trim()) return;

    onRejectProperty(rejectListingModal.id, rejectionReason.trim());
    showNotification('success', `Listing "${rejectListingModal.title}" rejected with reason recorded.`);
    setRejectListingModal(null);
    setRejectionReason('');
  };

  const handleApprovePaymentClick = (paymentId: string) => {
    const res = onApprovePayment(paymentId);
    if (res.success) {
      showNotification('success', 'Payment verified! Exactly 14 credits granted to user account.');
    } else {
      showNotification('error', res.error || 'Failed to approve payment.');
    }
  };

  const handleConfirmRejectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectPaymentModal || !paymentRejectReason.trim()) return;

    onRejectPayment(rejectPaymentModal.id, paymentRejectReason.trim());
    showNotification('success', `Payment ${rejectPaymentModal.id} rejected.`);
    setRejectPaymentModal(null);
    setPaymentRejectReason('');
  };

  const handleConfirmSuspendUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendUserModal || !suspensionReason.trim()) return;

    onSuspendUser(suspendUserModal.uid, suspensionReason.trim());
    showNotification('success', `User ${suspendUserModal.email} suspended.`);
    setSuspendUserModal(null);
    setSuspensionReason('');
  };

  const handleConfirmAdjustCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustCreditsModal || !creditAdjustReason.trim()) return;

    onAdjustCredits(adjustCreditsModal.uid, creditFreeDelta, creditPaidDelta, creditAdjustReason.trim());
    showNotification('success', `Credits updated for ${adjustCreditsModal.email}.`);
    setAdjustCreditsModal(null);
    setCreditFreeDelta(0);
    setCreditPaidDelta(0);
    setCreditAdjustReason('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings({
      receivingAccounts: {
        ...siteSettings.receivingAccounts,
        meezanBank: {
          ...siteSettings.receivingAccounts.meezanBank,
          accountTitle: receivingMeezanTitle,
          accountNumber: receivingMeezanNumber,
          iban: receivingMeezanIban,
        },
        jazzCash: {
          ...siteSettings.receivingAccounts.jazzCash,
          mobileNumber: receivingJazzCashNumber,
        },
        easyPaisa: {
          ...siteSettings.receivingAccounts.easyPaisa,
          mobileNumber: receivingEasyPaisaNumber,
        },
      },
    });
    showNotification('success', 'Official receiving accounts updated successfully.');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">Makani Central Administration</h1>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Root Role
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Authenticated: <span className="font-mono text-emerald-400">{currentUser.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                Pending Approvals: <strong className="text-amber-400 font-mono">{pendingListings}</strong>
              </span>
              <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                Pending Payments: <strong className="text-emerald-400 font-mono">{pendingPayments}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Notification Toast */}
        {actionNotice && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-xs ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{actionNotice.text}</span>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 mb-6 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('pending_listings')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pending_listings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Listings ({pendingListings})</span>
          </button>

          <button
            onClick={() => setActiveTab('all_listings')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all_listings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>All Listings ({allProperties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'payments' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            <span>Payments ({pendingPayments} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reviews ({pendingReviews.length} New)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Site Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2 px-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Log</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block">Total Registered Users</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{totalUsers}</span>
                <span className="text-[11px] text-emerald-700 block mt-1">{activeUsers} Active · {suspendedUsers} Suspended</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block">Approved Live Listings</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{publishedListings}</span>
                <span className="text-[11px] text-amber-700 block mt-1">{pendingListings} Pending Approval</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block">Verified Revenue</span>
                <span className="text-2xl font-bold text-emerald-800 tabular-nums">PKR {totalVerifiedRevenue.toLocaleString()}</span>
                <span className="text-[11px] text-slate-500 block mt-1">{approvedPayments} packages (14 credits ea)</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 block">Average Rating</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">{avgRating} / 5.0</span>
                <span className="text-[11px] text-slate-500 block mt-1">{approvedReviews.length} Public Reviews</span>
              </div>
            </div>

            {/* Quick Action Tables Split: Pending Submissions & Pending Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Listings Quick Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-amber-600" />
                    Pending Submissions ({pendingListings})
                  </h3>
                  <button
                    onClick={() => setActiveTab('pending_listings')}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {pendingListings === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No pending listings awaiting review.</p>
                ) : (
                  <div className="space-y-3">
                    {allProperties
                      .filter((p) => p.status === 'pending')
                      .slice(0, 4)
                      .map((prop) => (
                        <div key={prop.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={prop.images[0]} alt={prop.title} className="w-12 h-10 rounded object-cover" />
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{prop.title}</p>
                              <p className="text-[11px] text-slate-500">{prop.location.city} · {formatPricePKR(prop.price)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprovePropertyClick(prop.id)}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectListingModal(prop)}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Pending Payments Quick Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    Pending Payments ({pendingPayments})
                  </h3>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {pendingPayments === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No pending payments to verify.</p>
                ) : (
                  <div className="space-y-3">
                    {allPayments
                      .filter((p) => p.status === 'pending')
                      .slice(0, 4)
                      .map((pay) => (
                        <div key={pay.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{pay.userName}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              TxID: {pay.transactionId} · {pay.paymentMethod}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprovePaymentClick(pay.id)}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded font-semibold text-[11px]"
                            >
                              Verify & Grant 14
                            </button>
                            <button
                              onClick={() => setRejectPaymentModal(pay)}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING LISTINGS */}
        {activeTab === 'pending_listings' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Listing Submissions Awaiting Quality Review ({pendingListings})
            </h2>

            {pendingListings === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                All submitted properties have been reviewed. No pending listings!
              </div>
            ) : (
              <div className="space-y-4">
                {allProperties
                  .filter((p) => p.status === 'pending')
                  .map((prop) => (
                    <div key={prop.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row gap-6 justify-between">
                      <div className="flex gap-4">
                        <img src={prop.images[0]} alt={prop.title} className="w-36 h-28 rounded-xl object-cover" />
                        <div className="space-y-1 text-xs">
                          <span className="font-mono text-slate-400">Ref: {prop.id}</span>
                          <h3 className="font-bold text-slate-900 text-sm">{prop.title}</h3>
                          <p className="text-slate-600">{prop.location.area}, {prop.location.city} · {formatArea(prop.details.coveredArea, prop.details.areaUnit)}</p>
                          <p className="font-bold text-slate-900 text-sm">{formatPricePKR(prop.price)}</p>
                          <p className="text-slate-500">
                            Advertiser: <strong className="text-slate-800">{prop.contact.ownerName}</strong> ({prop.contact.phone})
                          </p>
                          <p className="text-emerald-700 font-semibold">{prop.images.length} verified photographs attached</p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectPropertyLive(prop)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Inspect Full Details
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRejectListingModal(prop)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Reject Listing
                          </button>
                          <button
                            onClick={() => handleApprovePropertyClick(prop.id)}
                            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Approve & Publish (Deduct 1 Credit)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL LISTINGS */}
        {activeTab === 'all_listings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">All Marketplace Listings ({allProperties.length})</h2>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter listings..."
                  value={propertySearchTerm}
                  onChange={(e) => setPropertySearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-2">Title / ID</th>
                    <th className="py-3 px-2">City</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2">Views</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Featured</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allProperties
                    .filter((p) => p.title.toLowerCase().includes(propertySearchTerm.toLowerCase()) || p.location.city.toLowerCase().includes(propertySearchTerm.toLowerCase()))
                    .map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50">
                        <td className="py-3 px-2 font-medium text-slate-900 max-w-[220px] truncate">
                          {prop.title}
                          <span className="block text-[10px] text-slate-400 font-mono">{prop.id}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-600">{prop.location.city}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{formatPricePKR(prop.price)}</td>
                        <td className="py-3 px-2 text-slate-600 tabular-nums">{prop.viewsCount}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              prop.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prop.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prop.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => onToggleFeaturedProperty(prop.id)}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                              prop.featured ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {prop.featured ? '★ Featured' : 'Standard'}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-right space-x-1">
                          <button
                            onClick={() => onSelectPropertyLive(prop)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                            title="Inspect"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProperty(prop.id)}
                            className="p-1 text-rose-600 hover:text-rose-800"
                            title="Delete"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENTS MANAGEMENT */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Payment Verification & Credit Grants</h2>
            <p className="text-xs text-slate-500">
              Verify Pakistani bank transfer screenshots and transaction IDs. Approving grants exactly 14 credits to the user.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-2">User / Email</th>
                    <th className="py-3 px-2">Method</th>
                    <th className="py-3 px-2">Transaction ID</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Receipt</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <span className="font-bold text-slate-900 block">{pay.userName}</span>
                        <span className="text-[10px] text-slate-500">{pay.userEmail}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-700">{pay.paymentMethod}</td>
                      <td className="py-3 px-2 font-mono font-bold text-slate-900">{pay.transactionId}</td>
                      <td className="py-3 px-2 font-bold text-emerald-800">PKR {pay.amountPKR}</td>
                      <td className="py-3 px-2">
                        <a
                          href={pay.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          View Receipt <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            pay.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pay.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1.5">
                        {pay.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePaymentClick(pay.id)}
                              className="px-3 py-1 bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800 cursor-pointer text-[11px]"
                            >
                              Approve (+14 Credits)
                            </button>
                            <button
                              onClick={() => setRejectPaymentModal(pay)}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded font-semibold hover:bg-rose-700 cursor-pointer text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {pay.status === 'approved' && (
                          <span className="text-emerald-700 text-[11px] font-semibold">14 Credits Granted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">Registered Users & Credit Balances ({allUsers.length})</h2>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-3 px-2">User / Email</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Phone</th>
                    <th className="py-3 px-2">Free Credits</th>
                    <th className="py-3 px-2">Paid Credits</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers
                    .filter((u) => u.displayName.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(userSearchTerm.toLowerCase()))
                    .map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-50">
                        <td className="py-3 px-2">
                          <span className="font-bold text-slate-900 block">{user.displayName}</span>
                          <span className="text-[10px] text-slate-500">{user.email}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {user.phoneNumber ? (
                            <span className="text-emerald-700 font-semibold">{user.phoneNumber}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900 tabular-nums">{user.freeCreditsRemaining}</td>
                        <td className="py-3 px-2 font-bold text-emerald-800 tabular-nums">{user.paidCreditsRemaining}</td>
                        <td className="py-3 px-2">
                          {user.isSuspended ? (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Suspended ({user.suspensionReason})
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right space-x-1.5">
                          <button
                            onClick={() => setAdjustCreditsModal(user)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] cursor-pointer"
                          >
                            Adjust Credits
                          </button>
                          {user.isSuspended ? (
                            <button
                              onClick={() => onReactivateUser(user.uid)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded font-semibold text-[11px] cursor-pointer"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => setSuspendUserModal(user)}
                              className="px-2 py-1 bg-rose-600 text-white rounded font-semibold text-[11px] cursor-pointer"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Website Reviews Moderation ({allReviews.length})</h2>
            <div className="space-y-3">
              {allReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <span className="font-bold text-slate-900">{rev.userName} ({rev.city})</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {rev.status}
                      </span>
                    </div>
                    <p className="text-slate-700 italic">&ldquo;{rev.feedback}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => onModerateReview(rev.id, 'approved')}
                        className="px-3 py-1 bg-emerald-700 text-white rounded font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => onModerateReview(rev.id, 'rejected')}
                        className="px-3 py-1 bg-amber-600 text-white rounded font-semibold"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => onToggleFeaturedReview(rev.id)}
                      className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold"
                    >
                      {rev.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => onDeleteReview(rev.id)}
                      className="px-2 py-1 bg-rose-50 text-rose-700 rounded font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SITE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-2xl">
            <h2 className="text-base font-bold text-slate-900">Update Official Pakistani Receiving Accounts</h2>
            
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-xs">Meezan Bank Account</h3>
              <div>
                <label className="block text-slate-600 mb-1">Account Title</label>
                <input
                  type="text"
                  value={receivingMeezanTitle}
                  onChange={(e) => setReceivingMeezanTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={receivingMeezanNumber}
                  onChange={(e) => setReceivingMeezanNumber(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">IBAN Number</label>
                <input
                  type="text"
                  value={receivingMeezanIban}
                  onChange={(e) => setReceivingMeezanIban(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 text-xs pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-xs">Mobile Wallets</h3>
              <div>
                <label className="block text-slate-600 mb-1">JazzCash Mobile</label>
                <input
                  type="text"
                  value={receivingJazzCashNumber}
                  onChange={(e) => setReceivingJazzCashNumber(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">EasyPaisa Mobile</label>
                <input
                  type="text"
                  value={receivingEasyPaisaNumber}
                  onChange={(e) => setReceivingEasyPaisaNumber(e.target.value)}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </form>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Administrative Audit Trail ({auditLogs.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-2">Timestamp</th>
                    <th className="py-2.5 px-2">Action</th>
                    <th className="py-2.5 px-2">Performed By</th>
                    <th className="py-2.5 px-2">Target Type</th>
                    <th className="py-2.5 px-2">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.slice(0, 100).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 text-slate-500">{new Date(log.timestamp).toLocaleString('en-PK')}</td>
                      <td className="py-2.5 px-2 font-bold text-emerald-800">{log.action}</td>
                      <td className="py-2.5 px-2 text-slate-700">{log.performedBy}</td>
                      <td className="py-2.5 px-2 text-slate-500">{log.targetType}</td>
                      <td className="py-2.5 px-2 text-slate-800 font-sans text-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Reject Listing Modal */}
      {rejectListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleConfirmRejectProperty} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Reject Property Listing</h3>
            <p className="text-slate-600">
              Rejecting &ldquo;{rejectListingModal.title}&rdquo;. Please specify the reason so the owner can correct it.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Low quality / stock photographs, unrealistic price, missing room count..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectListingModal(null)}
                className="px-3 py-2 border rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleConfirmRejectPayment} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Reject Payment Submission</h3>
            <p className="text-slate-600">
              TxID: <strong>{rejectPaymentModal.transactionId}</strong> from {rejectPaymentModal.userName}.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection</label>
              <input
                type="text"
                required
                placeholder="e.g. Duplicate TxID, transaction not received in Meezan Bank account..."
                value={paymentRejectReason}
                onChange={(e) => setPaymentRejectReason(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectPaymentModal(null)}
                className="px-3 py-2 border rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suspend User Modal */}
      {suspendUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleConfirmSuspendUser} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Suspend User Account</h3>
            <p className="text-slate-600">
              User: <strong>{suspendUserModal.email}</strong>. Suspended users cannot post new listings or access owner contacts.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Suspension Reason</label>
              <input
                type="text"
                required
                placeholder="e.g. Repeated scam listings, false contact information..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendUserModal(null)}
                className="px-3 py-2 border rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                Confirm Suspension
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adjust Credits Modal */}
      {adjustCreditsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleConfirmAdjustCredits} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Adjust Listing Credits</h3>
            <p className="text-slate-600">
              User: <strong>{adjustCreditsModal.email}</strong> (Current: {adjustCreditsModal.freeCreditsRemaining} Free, {adjustCreditsModal.paidCreditsRemaining} Paid)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Free Credits (Delta +/-)</label>
                <input
                  type="number"
                  value={creditFreeDelta}
                  onChange={(e) => setCreditFreeDelta(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Paid Credits (Delta +/-)</label>
                <input
                  type="number"
                  value={creditPaidDelta}
                  onChange={(e) => setCreditPaidDelta(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrative Reason</label>
              <input
                type="text"
                required
                placeholder="e.g. Promotional courtesy grant / manual payment settlement"
                value={creditAdjustReason}
                onChange={(e) => setCreditAdjustReason(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustCreditsModal(null)}
                className="px-3 py-2 border rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
