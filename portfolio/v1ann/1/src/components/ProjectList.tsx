import { Plus, ExternalLink, Edit2, Trash2, Calendar } from 'lucide-react';
import { Project } from '../lib/supabase';

interface ProjectListProps {
  selectedDate: Date | null;
  projects: Project[];
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectList({
  selectedDate,
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject,
}: ProjectListProps) {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">專案列表</h2>
          {selectedDate ? (
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedDate)}
            </p>
          ) : (
            <p className="text-sm text-gray-600">請選擇日期</p>
          )}
        </div>
        {selectedDate && (
          <button
            onClick={onAddProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
          >
            <Plus className="w-5 h-5" />
            新增專案
          </button>
        )}
      </div>

      <div className="space-y-4">
        {!selectedDate ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>請從行事曆選擇日期來查看或新增專案</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">這天還沒有專案</p>
            <button
              onClick={onAddProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              新增第一個專案
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex-1">
                  {project.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditProject(project)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    aria-label="編輯專案"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="刪除專案"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                  {project.description}
                </p>
              )}

              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  開啟 Vibe 專案
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
