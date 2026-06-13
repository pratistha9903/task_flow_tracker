import { useState, useEffect, FormEvent } from 'react';
import Layout from '../components/Layout';
import TaskForm from '../components/TaskForm';
import TaskActions from '../components/TaskActions';
import PersonProgressTracker from '../components/PersonProgressTracker';
import { api, Task, ApiError } from '../api/client';
import { statusClass, statusLabel } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [submitting, setSubmitting] = useState(false);
  const [markingDoneId, setMarkingDoneId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchTasks = async () => {
    try {
      const res = await api.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('TODO');
    setEditingTask(null);
    setShowForm(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, { title, description, status });
        setMessage({ type: 'success', text: 'Task updated successfully' });
      } else {
        await api.createTask({ title, description, status });
        setMessage({ type: 'success', text: 'Task created successfully' });
      }
      resetForm();
      await fetchTasks();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    setMarkingDoneId(id);
    setMessage(null);
    try {
      await api.updateTask(id, { status: 'DONE' });
      setMessage({ type: 'success', text: 'Task marked as done' });
      await fetchTasks();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message });
    } finally {
      setMarkingDoneId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      setMessage({ type: 'success', text: 'Task deleted' });
      await fetchTasks();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message });
    }
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter);
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    progress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const personalProgress = user
    ? [
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          todo: stats.todo,
          inProgress: stats.progress,
          done: stats.done,
          total: stats.total,
          completionRate,
        },
      ]
    : [];

  return (
    <Layout title="My Tasks" subtitle="Manage and track your personal workload">
      {message && <div className={`toast toast-${message.type}`}>{message.text}</div>}

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">To Do</span>
          <span className="stat-value">{stats.todo}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In Progress</span>
          <span className="stat-value accent">{stats.progress}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value success">{stats.done}</span>
        </div>
      </div>

      <PersonProgressTracker
        people={personalProgress}
        title="My Progress"
        subtitle="Your personal task completion tracker"
      />

      <div className="toolbar">
        <div className="filter-tabs">
          {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : statusLabel(f)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-compact"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          + New Task
        </button>
      </div>

      {showForm && (
        <TaskForm
          editingTask={editingTask}
          title={title}
          description={description}
          status={status}
          submitting={submitting}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onStatusChange={setStatus}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {loading ? (
        <div className="empty-panel">Loading your tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-panel">
          <h3>No tasks found</h3>
          <p>Create your first task to get started.</p>
        </div>
      ) : (
        <div className="task-grid">
          {filtered.map((task) => (
            <article key={task.id} className="task-card premium">
              <div className="task-card-top">
                <span className={`status-badge ${statusClass(task.status)}`}>
                  {statusLabel(task.status)}
                </span>
              </div>
              <h3>{task.title}</h3>
              {task.description && <p className="task-desc">{task.description}</p>}
              <TaskActions
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkDone={handleMarkDone}
                markingDone={markingDoneId === task.id}
              />
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}
