// src/store/authStore.ts
// Who is logged in is needed by three separate places: the nav bar (to swap
// Login for Logout), ProtectedRoute (to decide), and LoginPage (to set it).
// Passing that down as props would mean every component in between carries a
// value it never uses, so it lives in a store instead -- a box outside the
// component tree that any component reads from directly.
import { create } from "zustand";

// The shape of the store: its data AND the functions that change it.
// login: (name: string) => void is a function type -- the same syntax as
// GT1's Formatter alias in types/index.ts.
interface AuthState {
  token: string | null;
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

// There is no real password here. Typing a name is enough -- the point of the
// task is the guard and the redirect, not authentication.
const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userName: null,
  // set() is the only way to change the store. Pass just the keys that
  // change; Zustand merges them in and re-renders whoever reads them.
  login: (name) => set({ token: `demo-token-${name}`, userName: name }),
  logout: () => set({ token: null, userName: null }),
}));

export default useAuthStore;
