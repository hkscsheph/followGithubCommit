import { Calendar, User, Trash2 } from 'lucide-react';
import { CarPost } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PostListProps = {
  posts: CarPost[];
  selectedDate: Date | null;
  onDeletePost: (postId: string) => void;
};

export default function PostList({ posts, selectedDate, onDeletePost }: PostListProps) {
  const { user } = useAuth();

  const filteredPosts = selectedDate
    ? posts.filter(post => post.post_date === selectedDate.toISOString().split('T')[0])
    : posts;

  const sortedPosts = [...filteredPosts].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (sortedPosts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {selectedDate ? '這天還沒有照片' : '還沒有任何照片'}
        </h3>
        <p className="text-gray-600">
          {selectedDate ? '點擊日期開始新增你的愛車照片' : '選擇日期來新增你的第一張照片'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        {selectedDate
          ? `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日的照片`
          : '所有照片'}
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({sortedPosts.length})
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img
                src={post.photo_url}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=無法載入圖片';
                }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800 text-lg">{post.title}</h4>
                {user?.id === post.user_id && (
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {post.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{post.profiles?.username || '未知使用者'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(post.post_date).toLocaleDateString('zh-TW')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
