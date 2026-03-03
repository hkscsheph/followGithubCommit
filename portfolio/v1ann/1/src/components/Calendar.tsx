import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentDate: Date;
  selectedDate: Date | null;
  projectDates: Set<string>;
  onDateSelect: (date: Date) => void;
  onMonthChange: (increment: number) => void;
}

export default function Calendar({
  currentDate,
  selectedDate,
  projectDates,
  onDateSelect,
  onMonthChange,
}: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const hasProject = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return projectDates.has(dateStr);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    onDateSelect(date);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="上個月"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {year} 年 {monthNames[month]}
        </h2>
        <button
          onClick={() => onMonthChange(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="下個月"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={index}
            className="aspect-square"
          >
            {day ? (
              <button
                onClick={() => handleDateClick(day)}
                className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all relative
                  ${isSelected(day)
                    ? 'bg-blue-500 text-white font-semibold shadow-md'
                    : isToday(day)
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <span>{day}</span>
                {hasProject(day) && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    isSelected(day) ? 'bg-white' : 'bg-blue-500'
                  }`} />
                )}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
