const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
}

export interface AnalyticsDashboard {
  overview: {
    totalUsers: number;
    totalTasks: number;
    todo: number;
    inProgress: number;
    done: number;
    completionRate: number;
  };
  statusBreakdown: { status: string; count: number; percentage: number }[];
  tasksByUser: {
    userId: string;
    name: string;
    email: string;
    role: string;
    todo: number;
    inProgress: number;
    done: number;
    total: number;
    completionRate: number;
  }[];
  recentTasks: {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    owner: string;
    ownerEmail: string;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch {
      throw {
        status: 0,
        message: `Cannot reach API at ${API_BASE}. Set VITE_API_URL on the frontend and CORS_ORIGIN on the backend.`,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Request failed',
        errors: data.errors,
      };
    }

    return data;
  }

  async register(email: string, password: string, name: string, role: 'USER' | 'ADMIN' = 'USER') {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<User>('/auth/profile');
  }

  async getTasks() {
    return this.request<Task[]>('/tasks');
  }

  async createTask(data: { title: string; description?: string; status?: string }) {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    id: string,
    data: { title?: string; description?: string; status?: string }
  ) {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request<void>(`/tasks/${id}`, { method: 'DELETE' });
  }

  async getAnalytics() {
    return this.request<AnalyticsDashboard>('/analytics');
  }
}

export const api = new ApiClient();

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
