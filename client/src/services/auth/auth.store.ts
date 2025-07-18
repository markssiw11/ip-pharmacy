import { create } from "zustand";
import { IAuthStore, ILogin } from "./auth.type";
import { persist } from "zustand/middleware";

export const useUserStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: (user: ILogin) =>
        set({
          user,
          isLoading: false,
        }),
      logout: () =>
        set({
          user: null,
          isLoading: false,
        }),
      changePassword: (data: any) => Promise<void>,
    }),
    {
      name: "app-user-storage",
    }
  )
);
