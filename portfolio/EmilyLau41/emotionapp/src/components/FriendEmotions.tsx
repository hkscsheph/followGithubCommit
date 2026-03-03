import { useState, useEffect } from 'react';
import { Smile, Frown, Sparkles, CloudRain, Wind, Flame, Heart, Moon, MessageCircle } from 'lucide-react';
import { supabase, Emotion } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

type EmotionWithUser = Emotion & {
  user_email?: string;
};

export function FriendEmotions() {
  const [friendEmotions, setFriendEmotions] = useState<EmotionWithUser[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionWithUser | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadFriendEmotions();
  }, [user]);

  const loadFriendEmotions = async () => {
    if (!user) return;

    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (!friendships) return;

    const friendIds = friendships.map(f =>
      f.user_id === user.id ? f.friend_id : f.user_id
    );

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const { data: emotions } = await supabase
      .from('emotions')
      .select('*')
      .in('user_id', friendIds)
      .gte('emotion_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('emotion_date', { ascending: false });

    if (emotions) {
      const emotionsWithUsers = await Promise.all(
        emotions.map(async (emotion) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', emotion.user_id)
            .maybeSingle();
          return { ...emotion, user_email: profile?.email };
        })
      );
      setFriendEmotions(emotionsWithUsers);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold text-gray-800">Friends' Emotions</h2>
        </div>

        {friendEmotions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No emotions shared yet. Check back when your friends share their feelings!
          </p>
        ) : (
          <div className="space-y-3">
            {friendEmotions.map((emotion) => {
              const EmotionIcon = emotionIcons[emotion.emotion_type].icon;
              const emotionColor = emotionIcons[emotion.emotion_type].color;

              return (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedEmotion(emotion)}
                  className="w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EmotionIcon className={`w-8 h-8 ${emotionColor}`} fill="currentColor" />
                      <div>
                        <p className="font-medium text-gray-800">{emotion.user_email}</p>
                        <p className="text-sm text-gray-600">{formatDate(emotion.emotion_date)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {emotion.emotion_type}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedEmotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedEmotion.user_email}
              </h3>
              <button
                onClick={() => setSelectedEmotion(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-600">&times;</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {formatDate(selectedEmotion.emotion_date)}
            </p>

            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const EmotionIcon = emotionIcons[selectedEmotion.emotion_type].icon;
                const emotionColor = emotionIcons[selectedEmotion.emotion_type].color;
                return (
                  <>
                    <EmotionIcon className={`w-12 h-12 ${emotionColor}`} fill="currentColor" />
                    <span className="text-2xl font-semibold text-gray-800 capitalize">
                      {selectedEmotion.emotion_type}
                    </span>
                  </>
                );
              })()}
            </div>

            {selectedEmotion.note && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{selectedEmotion.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
