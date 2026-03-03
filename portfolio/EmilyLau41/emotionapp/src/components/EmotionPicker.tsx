import { useState } from 'react';
import { X, Smile, Frown, Sparkles, CloudRain, Wind, Flame, Heart, Moon } from 'lucide-react';
import { supabase, Emotion } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type EmotionType = 'happy' | 'sad' | 'excited' | 'anxious' | 'calm' | 'angry' | 'loved' | 'tired';

const emotionOptions = [
  { type: 'happy' as EmotionType, label: 'Happy', icon: Smile, color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' },
  { type: 'sad' as EmotionType, label: 'Sad', icon: Frown, color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
  { type: 'excited' as EmotionType, label: 'Excited', icon: Sparkles, color: 'bg-orange-100 text-orange-600 hover:bg-orange-200' },
  { type: 'anxious' as EmotionType, label: 'Anxious', icon: CloudRain, color: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
  { type: 'calm' as EmotionType, label: 'Calm', icon: Wind, color: 'bg-teal-100 text-teal-600 hover:bg-teal-200' },
  { type: 'angry' as EmotionType, label: 'Angry', icon: Flame, color: 'bg-red-100 text-red-600 hover:bg-red-200' },
  { type: 'loved' as EmotionType, label: 'Loved', icon: Heart, color: 'bg-pink-100 text-pink-600 hover:bg-pink-200' },
  { type: 'tired' as EmotionType, label: 'Tired', icon: Moon, color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' },
];

type EmotionPickerProps = {
  date: string;
  existingEmotion?: Emotion;
  onClose: () => void;
  onSaved: () => void;
};

export function EmotionPicker({ date, existingEmotion, onClose, onSaved }: EmotionPickerProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(
    existingEmotion?.emotion_type || null
  );
  const [note, setNote] = useState(existingEmotion?.note || '');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!selectedEmotion || !user) return;

    setLoading(true);
    try {
      const emotionData = {
        user_id: user.id,
        emotion_date: date,
        emotion_type: selectedEmotion,
        note,
        updated_at: new Date().toISOString(),
      };

      if (existingEmotion) {
        await supabase
          .from('emotions')
          .update(emotionData)
          .eq('id', existingEmotion.id);
      } else {
        await supabase.from('emotions').insert(emotionData);
      }

      onSaved();
    } catch (error) {
      console.error('Error saving emotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEmotion) return;

    setLoading(true);
    try {
      await supabase.from('emotions').delete().eq('id', existingEmotion.id);
      onSaved();
    } catch (error) {
      console.error('Error deleting emotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">How are you feeling?</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">{formattedDate}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {emotionOptions.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => setSelectedEmotion(type)}
              className={`p-4 rounded-xl transition-all ${color} ${
                selectedEmotion === type ? 'ring-2 ring-offset-2 ring-pink-500 scale-105' : ''
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          {existingEmotion && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!selectedEmotion || loading}
            className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
