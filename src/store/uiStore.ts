import { create } from "zustand";
import { persist } from "zustand/middleware";

// Dark mode and the density pill lived in Layout; the search term lived in
// CoursesPage. None of the three belonged there -- they are settings ABOUT the
// whole app, and two components already needed to agree on them.
//
// authStore answers "who is logged in". This one answers "how does the app
// look". Different questions, different files, no overlap.

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

      // set() takes a FUNCTION when the new value depends on the old one --
      // exactly like setValue((prev) => !prev) in Session 4's useToggle.
      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleCompact: () => set((state) => ({ isCompact: !state.isCompact })),

      // The plain form, for when the new value ignores the old one entirely.
      setSearchTerm: (term) => set({ searchTerm: term }),
    }),
    {
      name: "itelect4-ui",
      // Only the two appearance settings are worth remembering. A search box
      // still full of last week's text after a reload would only confuse
      // people, so searchTerm is deliberately left out.
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isCompact: state.isCompact,
      }),
    }
  )
);

export default useUiStore;
