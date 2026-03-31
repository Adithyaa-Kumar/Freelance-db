export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'freelancer' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  freelancerId?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  budget: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
