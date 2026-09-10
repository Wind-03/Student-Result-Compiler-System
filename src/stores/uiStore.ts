import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface UIState {
  sidebarCollapsed: boolean;
  /** Whether the off-canvas sidebar drawer is open on small (mobile) screens. */
  mobileNavOpen: boolean;
  activeCourseId: string | null;
  toasts: Toast[];
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setActiveCourse: (courseId: string | null) => void;
  pushToast: (message: string, variant?: Toast['variant']) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  activeCourseId: null,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  setActiveCourse: (courseId) => set({ activeCourseId: courseId }),
  pushToast: (message, variant = 'info') =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), message, variant }],
    })),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
