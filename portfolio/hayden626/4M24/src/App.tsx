import { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { ProjectModal } from './components/ProjectModal';
import { supabase } from './lib/supabase';
import type { Project } from './lib/types';
import { Calendar as CalendarIcon } from 'lucide-react';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleAddProject = () => {
    setSelectedDate(new Date());
    setIsModalOpen(true);
  };

  const handleSaveProject = async (projectData: {
    title: string;
    description: string;
    project_url: string;
    created_date: string;
  }) => {
    try {
      const { error } = await supabase.from('projects').insert([
        {
          ...projectData,
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      await loadProjects();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('儲存失敗，請稍後再試');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('確定要刪除這個專案嗎？')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CalendarIcon size={40} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">專案日曆</h1>
          </div>
          <p className="text-gray-600">追蹤您的 Vibe 編碼專案</p>
        </div>

        <Calendar
          projects={projects}
          onDateClick={handleDateClick}
          onAddProject={handleAddProject}
        />

        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          selectedDate={selectedDate}
          projects={projects}
        />
      </div>
    </div>
  );
}

export default App;
