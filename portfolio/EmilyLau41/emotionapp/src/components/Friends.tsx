import { useState, useEffect } from 'react';
import { UserPlus, Check, X, Users } from 'lucide-react';
import { supabase, Friendship } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type FriendWithEmail = Friendship & {
  friend_email?: string;
  user_email?: string;
};

export function Friends() {
  const [friends, setFriends] = useState<FriendWithEmail[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithEmail[]>([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadFriends();
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    const { data: friendshipsData } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (friendshipsData) {
      const accepted = friendshipsData.filter(f => f.status === 'accepted');
      const pending = friendshipsData.filter(
        f => f.status === 'pending' && f.friend_id === user.id
      );

      const friendsWithEmails = await Promise.all(
        accepted.map(async (f) => {
          const friendId = f.user_id === user.id ? f.friend_id : f.user_id;
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', friendId)
            .maybeSingle();
          return { ...f, friend_email: profile?.email };
        })
      );

      const pendingWithEmails = await Promise.all(
        pending.map(async (f) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('id', f.user_id)
            .maybeSingle();
          return { ...f, user_email: profile?.email };
        })
      );

      setFriends(friendsWithEmails);
      setPendingRequests(pendingWithEmails);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data: friendProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', friendEmail)
        .maybeSingle();

      if (!friendProfile) {
        setError('User not found');
        return;
      }

      if (friendProfile.id === user.id) {
        setError('You cannot add yourself as a friend');
        return;
      }

      const { error: insertError } = await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friendProfile.id,
        status: 'pending',
      });

      if (insertError) {
        setError('Failed to send friend request. You may have already sent a request.');
      } else {
        setFriendEmail('');
        loadFriends();
      }
    } catch (err) {
      setError('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
    loadFriends();
  };

  const handleRejectRequest = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    loadFriends();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-pink-500" />
        <h2 className="text-2xl font-bold text-gray-800">Friends</h2>
      </div>

      <form onSubmit={handleAddFriend} className="mb-6">
        <label htmlFor="friendEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Add a friend by email
        </label>
        <div className="flex gap-2">
          <input
            id="friendEmail"
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="friend@example.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Pending Requests</h3>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
              >
                <span className="text-gray-800">{request.user_email}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Friends</h3>
        {friends.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No friends yet. Add some to share emotions!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-800">{friend.friend_email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
