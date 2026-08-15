import { create } from "zustand";

interface AuthState {
  token: string | null;
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userName: null,
  login: (name) => set({ token: `demo-token-${name}`, userName: name }),
  logout: () => set({ token: null, userName: null }),
}));

export default useAuthStore;
