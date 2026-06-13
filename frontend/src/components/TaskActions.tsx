import { Task } from '../api/client';

interface TaskActionsProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMarkDone: (id: string) => void;
  markingDone?: boolean;
}

export default function TaskActions({
  task,
  onEdit,
  onDelete,
  onMarkDone,
  markingDone,
}: TaskActionsProps) {
  return (
    <div className="task-card-actions">
      {task.status !== 'DONE' && (
        <button
          type="button"
          className="btn btn-sm btn-done"
          onClick={() => onMarkDone(task.id)}
          disabled={markingDone}
        >
          Done
        </button>
      )}
      <button type="button" className="btn btn-sm" onClick={() => onEdit(task)}>
        Edit
      </button>
      <button type="button" className="btn btn-sm btn-danger" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </div>
  );
}
