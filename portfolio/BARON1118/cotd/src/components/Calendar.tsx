import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CarPost } from '../lib/supabase';

type CalendarProps = {
  posts: CarPost[];
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
};

export default function Calendar({ posts, onDateClick, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<(Date | null)[]>([]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    setCalendarDays(days);
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  }

  function getPostsForDate(date: Date): CarPost[] {
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(post => post.post_date === dateStr);
  }

  function isSelectedDate(date: Date): boolean {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayPosts = getPostsForDate(date);
          const isSelected = isSelectedDate(date);
          const isTodayDate = isToday(date);

          return (
            <button
              key={index}
              onClick={() => onDateClick(date)}
              className={`aspect-square p-2 rounded-xl transition-all relative group ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-orange-500 text-white shadow-lg scale-105'
                  : isTodayDate
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-600 hover:bg-blue-100'
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="text-sm font-medium">{date.getDate()}</div>

              {dayPosts.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  {dayPosts.slice(0, 3).map((post, i) => (
                    <div
                      key={post.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-orange-500'
                      }`}
                    />
                  ))}
                </div>
              )}

              {dayPosts.length === 0 && !isSelected && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
