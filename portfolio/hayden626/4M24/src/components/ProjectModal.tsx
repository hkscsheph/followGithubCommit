import { useState, useEffect } from 'react';
import { X, ExternalLink, Trash2 } from 'lucide-react';
import type { Project } from '../lib/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { title: string; description: string; project_url: string; created_date: string }) => void;
  onDelete?: (id: string) => void;
  selectedDate: Date | null;
  projects: Project[];
}

export function ProjectModal({ isOpen, onClose, onSave, onDelete, selectedDate, projects }: ProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setProjectUrl('');
    }
  }, [isOpen]);

  if (!isOpen || !selectedDate) return null;

  const dateStr = selectedDate.toISOString().split('T')[0];
  const dateProjects = projects.filter(p => p.created_date === dateStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      project_url: projectUrl,
      created_date: dateStr,
    });
    setTitle('');
    setDescription('');
    setProjectUrl('');
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {formatDate(selectedDate)} 的專案
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {dateProjects.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">已有的專案</h4>
              <div className="space-y-3">
                {dateProjects.map(project => (
                  <div
                    key={project.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-1">{project.title}</h5>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                        )}
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                        >
                          <ExternalLink size={16} />
                          開啟專案
                        </a>
                      </div>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(project.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700">新增專案</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                專案標題 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="輸入專案名稱"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                專案描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="專案簡介（選填）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                專案連結 *
              </label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                儲存專案
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
