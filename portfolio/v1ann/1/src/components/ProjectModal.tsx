import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Project } from '../lib/supabase';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
  selectedDate: Date | null;
  existingProject?: Project | null;
}

export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingProject,
}: ProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');

  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setDescription(existingProject.description);
      setProjectUrl(existingProject.project_url);
    } else {
      setTitle('');
      setDescription('');
      setProjectUrl('');
    }
  }, [existingProject, isOpen]);

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    onSave({
      id: existingProject?.id,
      title,
      description,
      project_url: projectUrl,
      project_date: projectDate,
    });

    setTitle('');
    setDescription('');
    setProjectUrl('');
    onClose();
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            {existingProject ? '編輯專案' : '新增專案'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日期
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
              {formatDate(selectedDate)}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              專案標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="輸入專案標題"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              專案描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="輸入專案描述"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Vibe 專案連結
            </label>
            <input
              type="url"
              id="projectUrl"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
            >
              {existingProject ? '更新' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
