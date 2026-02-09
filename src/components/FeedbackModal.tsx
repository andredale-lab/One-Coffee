import React, { useState } from 'react';
import { Star, X, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  tableName: string;
  lang: 'IT' | 'EN';
}

export default function FeedbackModal({ isOpen, onClose, tableId, tableName, lang }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [madeConnection, setMadeConnection] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert(lang === 'IT' ? 'Per favore dai una valutazione.' : 'Please provide a rating.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: session.user.id,
          table_id: tableId,
          rating,
          comment,
          made_connection: madeConnection
        });

      if (error) throw error;

      alert(lang === 'IT' ? 'Grazie per il tuo feedback!' : 'Thank you for your feedback!');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(lang === 'IT' ? 'Errore durante l\'invio del feedback.' : 'Error submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-amber-50">
          <h3 className="text-lg font-semibold text-gray-900">
            {lang === 'IT' ? 'Com\'è andato il caffè?' : 'How was the coffee?'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-500 text-center">
            {lang === 'IT' 
              ? `Hai partecipato al tavolo "${tableName}". Raccontaci la tua esperienza!`
              : `You participated in "${tableName}". Tell us about your experience!`}
          </p>

          {/* Rating */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* New Connection? */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              {lang === 'IT' ? 'Hai fatto nuove conoscenze interessanti?' : 'Did you make interesting new connections?'}
            </label>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setMadeConnection(true)}
                className={`flex items-center px-4 py-2 rounded-full border ${
                  madeConnection === true
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ThumbsUp size={16} className="mr-2" />
                {lang === 'IT' ? 'Sì' : 'Yes'}
              </button>
              <button
                onClick={() => setMadeConnection(false)}
                className={`flex items-center px-4 py-2 rounded-full border ${
                  madeConnection === false
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ThumbsDown size={16} className="mr-2" />
                {lang === 'IT' ? 'No' : 'No'}
              </button>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {lang === 'IT' ? 'Commenti aggiuntivi (opzionale)' : 'Additional comments (optional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder={lang === 'IT' ? 'Scrivi qui...' : 'Write here...'}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check size={20} className="mr-2" />
                {lang === 'IT' ? 'Invia Feedback' : 'Submit Feedback'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
