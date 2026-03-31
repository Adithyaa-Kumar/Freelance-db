import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Project, Task } from '../types/index';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  setIsLoading: (loading: boolean) => void;
}

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isLoading: false,
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),
        setIsLoading: (isLoading) => set({ isLoading }),
        logout: () => set({ user: null, token: null }),
      }),
      {
        name: 'auth-storage',
      }
    )
  )
);

export const useProjectStore = create<ProjectStore>()(
  devtools((set) => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    setProjects: (projects) => set({ projects }),
    setCurrentProject: (currentProject) => set({ currentProject }),
    addProject: (project) =>
      set((state) => ({ projects: [...state.projects, project] })),
    updateProject: (updatedProject) =>
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === updatedProject.id
            ? updatedProject
            : state.currentProject,
      })),
    removeProject: (projectId) =>
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
      })),
    setIsLoading: (isLoading) => set({ isLoading }),
  }))
);

export const useTaskStore = create<TaskStore>()(
  devtools((set) => ({
    tasks: [],
    isLoading: false,
    setTasks: (tasks) => set({ tasks }),
    addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    updateTask: (updatedTask) =>
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === updatedTask.id ? updatedTask : t
        ),
      })),
    removeTask: (taskId) =>
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      })),
    setIsLoading: (isLoading) => set({ isLoading }),
  }))
);
