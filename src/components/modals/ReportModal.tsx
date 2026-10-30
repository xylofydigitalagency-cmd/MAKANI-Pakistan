import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  propertyId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  propertyTitle,
  propertyId,
}) => {
  const [reason, setReason] = useState('fake_photos');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Report Property Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Report Submitted for Admin Review</h4>
              <p className="text-xs text-slate-500">
                Thank you for helping keep the Pakistani property marketplace transparent and trustworthy.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
              <p className="text-slate-500">
                Reporting: <strong className="text-slate-900">{propertyTitle}</strong> (ID: {propertyId})
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for reporting
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="fake_photos">Misleading or stock photographs</option>
                  <option value="incorrect_price">Unrealistic / fake pricing</option>
                  <option value="duplicate_listing">Duplicate advertisement</option>
                  <option value="sold_unavailable">Property already sold or rented out</option>
                  <option value="fraud_scammer">Suspected fraud or fake owner</option>
                  <option value="wrong_location">Inaccurate map pin or area</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Please describe why this listing violates Pakistani real estate standards..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
