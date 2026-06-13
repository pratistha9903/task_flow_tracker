import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ApiError } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await register(email, password, name, role);
      navigate('/dashboard');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Registration failed');
      if (apiErr.errors) setFieldErrors(apiErr.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="brand-icon lg">T</div>
          <h1>Join TaskFlow</h1>
          <p>Create your account and choose how you want to work — as a team member or administrator.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card premium">
          <h2>Create account</h2>
          <p className="subtitle">Set up your profile and account type</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
              {fieldErrors.name?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
              {fieldErrors.email?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars with upper, lower & number"
                required
              />
              {fieldErrors.password?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <div className="form-group">
              <label>Account type</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-option ${role === 'USER' ? 'selected' : ''}`}
                  onClick={() => setRole('USER')}
                >
                  <span className="role-option-icon">👤</span>
                  <span className="role-option-title">User</span>
                  <span className="role-option-desc">Manage your own tasks and track personal progress</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${role === 'ADMIN' ? 'selected' : ''}`}
                  onClick={() => setRole('ADMIN')}
                >
                  <span className="role-option-icon">⚡</span>
                  <span className="role-option-title">Admin</span>
                  <span className="role-option-desc">Full access — all users, tasks, editing & analytics</span>
                </button>
              </div>
              {fieldErrors.role?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
