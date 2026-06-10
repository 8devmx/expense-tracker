import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_LIGHT = 'expense-tracker';
const THEME_DARK = 'expense-tracker-dark';

export const ThemeProvider = ({ children }) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || (prefersDark ? THEME_DARK : THEME_LIGHT)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === THEME_LIGHT ? THEME_DARK : THEME_LIGHT));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
