import { useState, useEffect, FormEvent } from 'react';
import Layout from '../components/Layout';
import TaskForm from '../components/TaskForm';
import PersonProgressTracker from '../components/PersonProgressTracker';
import { api, Task, AnalyticsDashboard, ApiError } from '../api/client';
import { statusClass, statusLabel, formatDate } from '../utils/helpers';

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState<'analytics' | 'tasks'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
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
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const tasksRes = await api.getTasks();
      setTasks(tasksRes.data || []);
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message || 'Failed to load tasks' });
    }

    try {
      const analyticsRes = await api.getAnalytics();
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message || 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    setActiveNav('tasks');
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
      await fetchData();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id);
      setMessage({ type: 'success', text: 'Task deleted' });
      await fetchData();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message });
    }
  };

  const handleMarkDone = async (id: string) => {
    setMarkingDoneId(id);
    setMessage(null);
    try {
      await api.updateTask(id, { status: 'DONE' });
      setMessage({ type: 'success', text: 'Task marked as done' });
      await fetchData();
    } catch (err) {
      const apiErr = err as ApiError;
      setMessage({ type: 'error', text: apiErr.message });
    } finally {
      setMarkingDoneId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.user?.name.toLowerCase().includes(q) ||
      t.user?.email.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

  const overview = analytics?.overview;

  return (
    <Layout
      title={activeNav === 'analytics' ? 'Analytics' : 'All Tasks'}
      subtitle={
        activeNav === 'analytics'
          ? 'Organization-wide progress and team performance'
          : 'View and manage every task across all users'
      }
      activeNav={activeNav}
      onNavChange={setActiveNav}
      showAdminNav
    >
      {message && <div className={`toast toast-${message.type}`}>{message.text}</div>}

      {loading ? (
        <div className="empty-panel">Loading admin dashboard...</div>
      ) : activeNav === 'analytics' ? (
        <div className="admin-analytics">
          <div className="stats-row">
            <div className="stat-card highlight">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{overview?.totalUsers ?? 0}</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{overview?.totalTasks ?? 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value success">{overview?.completionRate ?? 0}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">In Progress</span>
              <span className="stat-value accent">{overview?.inProgress ?? 0}</span>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="panel">
              <div className="panel-header">
                <h2>Status Breakdown</h2>
                <p>Distribution of tasks by current status</p>
              </div>
              <div className="chart-bars">
                {analytics?.statusBreakdown.map((item) => (
                  <div key={item.status} className="chart-bar-row">
                    <div className="chart-bar-label">
                      <span>{statusLabel(item.status)}</span>
                      <span>{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar-fill ${statusClass(item.status)}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Progress Overview</h2>
                <p>Completion at a glance</p>
              </div>
              <div className="donut-wrap">
                <div
                  className="donut-chart"
                  style={{
                    background: `conic-gradient(
                      var(--success) 0 ${overview?.completionRate ?? 0}%,
                      var(--border) ${overview?.completionRate ?? 0}% 100%
                    )`,
                  }}
                >
                  <div className="donut-center">
                    <strong>{overview?.completionRate ?? 0}%</strong>
                    <span>Done</span>
                  </div>
                </div>
                <ul className="donut-legend">
                  <li><span className="dot done" /> Done: {overview?.done ?? 0}</li>
                  <li><span className="dot progress" /> In Progress: {overview?.inProgress ?? 0}</li>
                  <li><span className="dot todo" /> To Do: {overview?.todo ?? 0}</li>
                </ul>
              </div>
            </div>
          </div>

          <PersonProgressTracker
            people={analytics?.tasksByUser ?? []}
            title="Person-wise Progress"
            subtitle="Track each team member's task completion individually"
          />

          <div className="panel">
            <div className="panel-header">
              <h2>Team Performance</h2>
              <p>Task progress per team member</p>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>To Do</th>
                    <th>In Progress</th>
                    <th>Done</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.tasksByUser.map((u) => (
                    <tr key={u.userId}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className={`role-pill role-${u.role.toLowerCase()}`}>{u.role}</span></td>
                      <td>{u.todo}</td>
                      <td>{u.inProgress}</td>
                      <td>{u.done}</td>
                      <td>
                        <div className="mini-progress">
                          <div className="mini-progress-fill" style={{ width: `${u.completionRate}%` }} />
                          <span>{u.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Recent Activity</h2>
              <p>Latest task updates across the organization</p>
            </div>
            <div className="activity-list">
              {analytics?.recentTasks.map((t) => (
                <div key={t.id} className="activity-item">
                  <div>
                    <strong>{t.title}</strong>
                    <span className="activity-meta">{t.owner} · {formatDate(t.updatedAt)}</span>
                  </div>
                  <span className={`status-badge ${statusClass(t.status)}`}>{statusLabel(t.status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <input
              type="search"
              className="search-input"
              placeholder="Search by task, user, email, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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

          <div className="panel">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <strong>{task.title}</strong>
                        {task.description && <p className="table-sub">{task.description}</p>}
                      </td>
                      <td>{task.user?.name ?? '—'}</td>
                      <td>{task.user?.email ?? '—'}</td>
                      <td>
                        <span className={`status-badge ${statusClass(task.status)}`}>
                          {statusLabel(task.status)}
                        </span>
                      </td>
                      <td>{formatDate(task.updatedAt)}</td>
                      <td className="table-actions">
                        {task.status !== 'DONE' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-done"
                            onClick={() => handleMarkDone(task.id)}
                            disabled={markingDoneId === task.id}
                          >
                            Done
                          </button>
                        )}
                        <button type="button" className="btn btn-sm" onClick={() => handleEdit(task)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(task.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTasks.length === 0 && (
                <div className="empty-panel">No tasks match your search.</div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
