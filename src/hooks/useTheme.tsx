
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  customColors: Record<string, string>;
  updateCustomColors: (colors: Record<string, string>) => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedColors = localStorage.getItem('custom-colors');
    
    if (savedMode) {
      setMode(savedMode);
    }
    
    if (savedColors) {
      setCustomColors(JSON.parse(savedColors));
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = mode;
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('custom-colors', JSON.stringify(customColors));
    
    // Apply custom colors to CSS variables
    Object.entries(customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [customColors]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateCustomColors = (colors: Record<string, string>) => {
    setCustomColors(prev => ({ ...prev, ...colors }));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, customColors, updateCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
