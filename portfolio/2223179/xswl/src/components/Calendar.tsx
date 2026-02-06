import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { supabase, Project } from '../lib/supabase';
import {
  getDaysInMonth,
  formatDate,
  isSameDay,
  isToday,
  isSameMonth,
  MONTH_NAMES,
  DAY_NAMES
} from '../utils/dateUtils';
import ProjectModal from './ProjectModal';
import ProjectList from './ProjectList';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getDaysInMonth(year, month);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('project_date', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
    } else {
      setProjects(data || []);
    }
  }

  function getProjectsForDate(date: Date): Project[] {
    const dateStr = formatDate(date);
    return projects.filter(p => p.project_date === dateStr);
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1));
  }

  function handleDateClick(date: Date) {
    setSelectedDate(date);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedDate(null);
  }

  async function handleSaveProject(project: Partial<Project>) {
    await loadProjects();
    handleCloseModal();
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Coding Projects Calendar</h1>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <h2 className="text-2xl font-semibold text-white">
              {MONTH_NAMES[month]} {year}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAY_NAMES.map(day => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 text-sm py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayProjects = getProjectsForDate(date);
              const isCurrentMonth = isSameMonth(date, year, month);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative min-h-24 p-2 rounded-lg border-2 transition-all
                    ${isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'}
                    ${isTodayDate ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                    hover:border-blue-300 hover:shadow-md
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`
                        text-sm font-medium
                        ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                        ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                      `}
                    >
                      {date.getDate()}
                    </span>

                    {dayProjects.length > 0 && (
                      <div className="mt-1 flex-1 flex flex-col gap-1">
                        {dayProjects.slice(0, 2).map(project => (
                          <div
                            key={project.id}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate"
                            title={project.title}
                          >
                            {project.title}
                          </div>
                        ))}
                        {dayProjects.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayProjects.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ProjectList projects={projects} onUpdate={loadProjects} />

      {isModalOpen && selectedDate && (
        <ProjectModal
          date={selectedDate}
          projects={getProjectsForDate(selectedDate)}
          onClose={handleCloseModal}
          onSave={handleSaveProject}
          onUpdate={loadProjects}
        />
      )}
    </div>
  );
}
