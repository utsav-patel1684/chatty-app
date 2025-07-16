import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",  // Default to dark
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);  // Store theme in localStorage
    document.documentElement.setAttribute("data-theme", theme);  // Apply theme to <html> tag
    set({ theme });  // Update state in zustand store
  },
}));
