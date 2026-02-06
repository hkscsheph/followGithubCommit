import { ExternalLink, Calendar, Trash2 } from 'lucide-react';
import { Project, supabase } from '../lib/supabase';

interface ProjectListProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function ProjectList({ projects, onUpdate }: ProjectListProps) {
  async function handleDelete(projectId: string) {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    } else {
      onUpdate();
    }
  }

  if (projects.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-lg p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects yet</h3>
        <p className="text-gray-500">Click on any date to add your first coding project</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
        <h2 className="text-2xl font-bold text-white">All Projects</h2>
        <p className="text-blue-100 mt-1">{projects.length} total projects</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {projects.map(project => {
            const projectDate = new Date(project.project_date);
            const formattedDate = projectDate.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={project.id}
                className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formattedDate}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-gray-600 mb-3">{project.description}</p>
                    )}

                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                        View Project
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
