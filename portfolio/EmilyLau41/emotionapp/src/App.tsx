import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Calendar } from './components/Calendar';
import { Friends } from './components/Friends';
import { FriendEmotions } from './components/FriendEmotions';
import { LogOut, Calendar as CalendarIcon, Users } from 'lucide-react';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'calendar' | 'friends' | 'feed'>('calendar');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Emotion Calendar</h1>
            <p className="text-gray-600">Track and share your daily emotions with friends</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </header>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            My Calendar
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'friends'
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Friends
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'feed'
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Friends' Emotions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'calendar' && <Calendar />}
            {activeTab === 'friends' && <Friends />}
            {activeTab === 'feed' && <FriendEmotions />}
          </div>
          <div className="space-y-6">
            {activeTab === 'calendar' && (
              <>
                <Friends />
                <FriendEmotions />
              </>
            )}
            {activeTab === 'friends' && <FriendEmotions />}
            {activeTab === 'feed' && <Friends />}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
