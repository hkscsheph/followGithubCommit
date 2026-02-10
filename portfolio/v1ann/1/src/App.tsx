import { useState, useEffect } from 'react';
import { supabase, Project } from './lib/supabase';
import Calendar from './components/Calendar';
import ProjectList from './components/ProjectList';
import ProjectModal from './components/ProjectModal';
import { Code2 } from 'lucide-react';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDateProjects, setSelectedDateProjects] = useState<Project[]>([]);
  const [projectDates, setProjectDates] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      const filtered = projects.filter(p => p.project_date === dateStr);
      setSelectedDateProjects(filtered);
    } else {
      setSelectedDateProjects([]);
    }
  }, [selectedDate, projects]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('project_date', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
      return;
    }

    if (data) {
      setProjects(data);
      const dates = new Set(data.map(p => p.project_date));
      setProjectDates(dates);
    }
  };

  const handleMonthChange = (increment: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = async (project: Partial<Project>) => {
    if (project.id) {
      const { error } = await supabase
        .from('projects')
        .update({
          title: project.title,
          description: project.description,
          project_url: project.project_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);

      if (error) {
        console.error('Error updating project:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: project.title,
          description: project.description,
          project_url: project.project_url,
          project_date: project.project_date,
        });

      if (error) {
        console.error('Error creating project:', error);
        return;
      }
    }

    loadProjects();
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('確定要刪除這個專案嗎？')) {
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return;
    }

    loadProjects();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Code2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">專案行事曆</h1>
          </div>
          <p className="text-gray-600">記錄您的 Vibe 編碼專案</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <Calendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            projectDates={projectDates}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />

          <ProjectList
            selectedDate={selectedDate}
            projects={selectedDateProjects}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        selectedDate={selectedDate}
        existingProject={editingProject}
      />
    </div>
  );
}

export default App;
