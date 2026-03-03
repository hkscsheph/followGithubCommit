import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase, CarPost } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Calendar from './Calendar';
import PostModal from './PostModal';
import PostList from './PostList';

export default function Dashboard() {
  const [posts, setPosts] = useState<CarPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [user]);

  async function loadPosts() {
    try {
      const { data, error } = await supabase
        .from('car_posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('載入貼文時發生錯誤:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDateClick(date: Date) {
    setSelectedDate(date);
    setIsModalOpen(true);
  }

  function handlePostCreated() {
    loadPosts();
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('確定要刪除這張照片嗎？')) return;

    try {
      const { error } = await supabase
        .from('car_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('刪除貼文時發生錯誤:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <Calendar
              posts={posts}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-4 rounded-xl font-medium hover:from-blue-600 hover:to-orange-600 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              新增愛車照片
            </button>
          </div>

          <div>
            <PostList
              posts={posts}
              selectedDate={selectedDate}
              onDeletePost={handleDeletePost}
            />
          </div>
        </div>
      </main>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate || new Date()}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
