import React, { useState } from 'react';
import { WebsiteReview, AppUser } from '../../types';
import { Star, MessageSquarePlus, ShieldCheck, CheckCircle2, User } from 'lucide-react';

interface CustomerReviewsSectionProps {
  reviews: WebsiteReview[];
  currentUser: AppUser | null;
  onOpenGoogleAuth: () => void;
  onSubmitReview: (rating: number, feedback: string, city?: string) => { success: boolean; error?: string };
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  reviews,
  currentUser,
  onOpenGoogleAuth,
  onSubmitReview,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [city, setCity] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const handleOpenModal = () => {
    if (!currentUser) {
      onOpenGoogleAuth();
    } else {
      setShowReviewModal(true);
      setStatusMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    const res = onSubmitReview(rating, feedback, city);
    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: 'Your review has been submitted and is pending administrator moderation before public display.',
      });
      setFeedback('');
      setTimeout(() => {
        setShowReviewModal(false);
        setStatusMessage(null);
      }, 2000);
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to submit review.',
      });
    }
  };

  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {averageRating} / 5.0
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{reviews.length} Verified Reviews</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Community Ratings & Reviews
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Genuine feedback from Pakistani home buyers, tenants, and verified property owners
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
            <span>Write a Website Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8">
            <p className="text-xs text-slate-600 mb-2">No approved reviews yet.</p>
            <button
              onClick={handleOpenModal}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Be the first verified user to leave a review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('en-PK', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic mb-4">
                    &ldquo;{rev.feedback}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{rev.userName}</p>
                      <p className="text-[10px] text-slate-500">{rev.city || 'Pakistan'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified User
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Write a Review for Makani Pakistan</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {statusMessage && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Overall Star Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          starVal <= rating ? 'fill-current' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-800 ml-2">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Islamabad, Lahore, Karachi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Feedback / Experience
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience discovering properties or communicating with verified sellers..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Logged in as <strong className="text-slate-800">{currentUser?.email}</strong>. All reviews are vetted by administrators to prevent defamatory or spam content.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
