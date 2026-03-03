import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, MoodRecord } from '../lib/supabase';
import { MOOD_OPTIONS, getMoodOption } from '../types/mood';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [moodRecords, setMoodRecords] = useState<Map<string, MoodRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadMoodRecords();
  }, [year, month]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = formatDate(selectedDate);
      const record = moodRecords.get(dateStr);
      if (record) {
        setSelectedMood(record.mood);
        setNote(record.note);
      } else {
        setSelectedMood('');
        setNote('');
      }
    }
  }, [selectedDate, moodRecords]);

  async function loadMoodRecords() {
    setLoading(true);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const { data, error } = await supabase
      .from('mood_records')
      .select('*')
      .gte('date', formatDate(firstDay))
      .lte('date', formatDate(lastDay));

    if (!error && data) {
      const recordMap = new Map<string, MoodRecord>();
      data.forEach(record => {
        recordMap.set(record.date, record);
      });
      setMoodRecords(recordMap);
    }
    setLoading(false);
  }

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDaysInMonth() {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1));
    setSelectedDate(null);
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1));
    setSelectedDate(null);
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }

  function handleDateClick(date: Date) {
    setSelectedDate(date);
  }

  async function saveMood() {
    if (!selectedDate || !selectedMood) return;

    const dateStr = formatDate(selectedDate);
    const existingRecord = moodRecords.get(dateStr);

    if (existingRecord) {
      const { error } = await supabase
        .from('mood_records')
        .update({ mood: selectedMood, note, updated_at: new Date().toISOString() })
        .eq('date', dateStr);

      if (!error) {
        await loadMoodRecords();
      }
    } else {
      const { error } = await supabase
        .from('mood_records')
        .insert({ date: dateStr, mood: selectedMood, note });

      if (!error) {
        await loadMoodRecords();
      }
    }
  }

  async function deleteMood() {
    if (!selectedDate) return;

    const dateStr = formatDate(selectedDate);
    const { error } = await supabase
      .from('mood_records')
      .delete()
      .eq('date', dateStr);

    if (!error) {
      await loadMoodRecords();
      setSelectedMood('');
      setNote('');
    }
  }

  const days = getDaysInMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {year} 年 {MONTHS[month]}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors font-medium"
          >
            回到今天
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                星期{day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateStr = formatDate(date);
              const record = moodRecords.get(dateStr);
              const moodOption = record ? getMoodOption(record.mood) : null;
              const isToday = date.getTime() === today.getTime();
              const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square rounded-lg border-2 transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : isToday
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full p-1">
                    <span className={`text-sm md:text-base ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                      {date.getDate()}
                    </span>
                    {moodOption && (
                      <span className="text-xl md:text-2xl mt-1">{moodOption.emoji}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {formatDate(selectedDate)} 的心情
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              選擇今天的心情
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedMood === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備註 (選填)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="寫下今天發生的事情或你的感受..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveMood}
              disabled={!selectedMood}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              儲存心情
            </button>
            {moodRecords.get(formatDate(selectedDate)) && (
              <button
                onClick={deleteMood}
                className="px-6 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                刪除
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
