import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

// create<AuthState>()( persist(...) ) -- note the extra (). Without middleware
// this was create<AuthState>((set) => ...); with middleware TypeScript needs
// that empty call first or the generic stops working.
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      login: (name) => set({ token: `demo-token-${name}`, userName: name }),
      logout: () => set({ token: null, userName: null }),
    }),
    {
      name: "itelect4-auth", // the localStorage key it writes to
      partialize: (state) => ({
        // save ONLY these two fields. Functions cannot become JSON, so without
        // partialize login and logout would silently vanish instead of being
        // left out on purpose.
        token: state.token,
        userName: state.userName,
      }),
    }
  )
);

// This token is the fake string demo-token-<name>, so localStorage is fine for
// it. A real JWT belongs in an httpOnly cookie the server sets -- localStorage
// is plain text that every script on the page can read.

export default useAuthStore;
