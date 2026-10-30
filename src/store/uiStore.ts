import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  isDarkMode: boolean;
  isCompact: boolean;
  searchTerm: string;
  toggleDarkMode: () => void;
  toggleCompact: () => void;
  setSearchTerm: (term: string) => void;
}

const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isCompact: false,
      searchTerm: "",

      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleCompact: () => set((state) => ({ isCompact: !state.isCompact })),

      setSearchTerm: (term) => set({ searchTerm: term }),
    }),
    {
      name: "itelect4-ui",
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isCompact: state.isCompact,
      }),
    }
  )
);

export default useUiStore;
