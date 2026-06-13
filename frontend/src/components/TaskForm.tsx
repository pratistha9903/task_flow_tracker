import { FormEvent } from 'react';
import { Task } from '../api/client';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

interface TaskFormProps {
  editingTask: Task | null;
  title: string;
  description: string;
  status: string;
  submitting: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export default function TaskForm({
  editingTask,
  title,
  description,
  status,
  submitting,
  onTitleChange,
  onDescriptionChange,
  onStatusChange,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  return (
    <div className="panel task-form-panel">
      <div className="panel-header">
        <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
        <p>{editingTask ? 'Update task details below' : 'Add a new task to your workspace'}</p>
      </div>
      <form onSubmit={onSubmit} className="task-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export { STATUS_OPTIONS };
