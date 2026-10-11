import { create } from "zustand";

export type NotificationIconType =
  | "heart"
  | "heart-off"
  | "shuffle-on"
  | "shuffle-off"
  | "repeat-all"
  | "repeat-one"
  | "repeat-off"
  | "theme-dark"
  | "theme-light"
  | "palette"
  | "globe"
  | "quality";

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  iconType: NotificationIconType;
  createdAt: number;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (
    data: Omit<AppNotification, "id" | "createdAt">,
    durationMs?: number
  ) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (data, durationMs = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: AppNotification = {
      ...data,
      id,
      createdAt: Date.now(),
    };

    // Keep only last 3 notifications at a time to prevent UI clutter
    set((state) => ({
      notifications: [...state.notifications.slice(-2), newNotif],
    }));

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, durationMs);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
