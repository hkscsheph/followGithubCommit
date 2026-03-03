import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Smile, Frown, Sparkles, CloudRain, Wind, Flame, Heart, Moon } from 'lucide-react';
import { supabase, Emotion } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { EmotionPicker } from './EmotionPicker';

const emotionIcons = {
  happy: { icon: Smile, color: 'text-yellow-500' },
  sad: { icon: Frown, color: 'text-blue-500' },
  excited: { icon: Sparkles, color: 'text-orange-500' },
  anxious: { icon: CloudRain, color: 'text-gray-500' },
  calm: { icon: Wind, color: 'text-teal-500' },
  angry: { icon: Flame, color: 'text-red-500' },
  loved: { icon: Heart, color: 'text-pink-500' },
  tired: { icon: Moon, color: 'text-indigo-500' },
};

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [emotions, setEmotions] = useState<Map<string, Emotion>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadEmotions();
  }, [currentDate, user]);

  const loadEmotions = async () => {
    if (!user) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('emotions')
      .select('*')
      .eq('user_id', user.id)
      .gte('emotion_date', firstDay)
      .lte('emotion_date', lastDay);

    if (!error && data) {
      const emotionMap = new Map(data.map(e => [e.emotion_date, e]));
      setEmotions(emotionMap);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    setSelectedDate(dateStr);
  };

  const handleEmotionSaved = () => {
    setSelectedDate(null);
    loadEmotions();
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{monthYear}</h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              .toISOString().split('T')[0];
            const emotion = emotions.get(dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const EmotionIcon = emotion ? emotionIcons[emotion.emotion_type].icon : null;
            const emotionColor = emotion ? emotionIcons[emotion.emotion_type].color : '';

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-lg border-2 transition-all hover:shadow-md ${
                  isToday ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                } flex flex-col items-center justify-center p-2`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-pink-600' : 'text-gray-700'}`}>
                  {day}
                </span>
                {EmotionIcon && (
                  <EmotionIcon className={`w-6 h-6 mt-1 ${emotionColor}`} fill="currentColor" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <EmotionPicker
          date={selectedDate}
          existingEmotion={emotions.get(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onSaved={handleEmotionSaved}
        />
      )}
    </>
  );
}
