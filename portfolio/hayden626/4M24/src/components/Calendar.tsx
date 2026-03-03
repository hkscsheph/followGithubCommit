import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Project } from '../lib/types';

interface CalendarProps {
  projects: Project[];
  onDateClick: (date: Date) => void;
  onAddProject: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

export function Calendar({ projects, onDateClick, onAddProject }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getProjectsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return projects.filter(p => p.created_date === dateStr);
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateProjects = getProjectsForDate(date);
      const isToday =
        date.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          onClick={() => onDateClick(date)}
          className={`
            aspect-square p-2 rounded-lg border-2 transition-all hover:border-blue-400
            ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
            ${dateProjects.length > 0 ? 'bg-green-50 border-green-300' : ''}
          `}
        >
          <div className="text-sm font-medium text-gray-900">{day}</div>
          {dateProjects.length > 0 && (
            <div className="mt-1 flex justify-center gap-1">
              {dateProjects.slice(0, 3).map((_, idx) => (
                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-green-500" />
              ))}
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {year}年 {MONTHS[month]}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            新增專案
          </button>
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50" />
          今天
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-green-300 bg-green-50" />
          有專案
        </div>
      </div>
    </div>
  );
}
