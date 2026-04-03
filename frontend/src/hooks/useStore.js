import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    devtools((set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => {
        console.log('[Zustand] Setting user:', user);
        set({ user });
      },
      setToken: (token) => {
        console.log('[Zustand] Setting token:', token ? 'present' : 'null');
        set({ token });
      },
      setIsLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        console.log('[Zustand] Logging out');
        set({ user: null, token: null });
      },
    })),
    {
      name: 'auth-storage',
      version: 1,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Zustand] Failed to rehydrate auth store:', error);
        } else {
          console.log('[Zustand] Rehydrated from storage, token:', state?.token ? 'present' : 'null');
        }
      },
    }
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
