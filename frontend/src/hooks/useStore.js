import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create(
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

export const useProjectStore = create(
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

export const useTaskStore = create(
  devtools((set) => ({
    tasks: [],
    isLoading: false,
    setTasks: (tasks) => set({ tasks }),
    addTask: (task) =>
      set((state) => ({ tasks: [...state.tasks, task] })),
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
