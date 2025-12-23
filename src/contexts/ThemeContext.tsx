import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  syncThemeToIframe: (iframe: HTMLIFrameElement | null) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  syncThemeToIframe: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return (savedTheme === 'dark' ? 'dark' : 'light');
  });

  const iframesRef = useRef<Set<HTMLIFrameElement>>(new Set());

  // Send theme to a specific iframe
  const sendThemeToIframe = useCallback((iframe: HTMLIFrameElement, themeToSend: Theme) => {
    try {
      iframe.contentWindow?.postMessage({
        type: 'THEME_SYNC',
        theme: themeToSend,
        source: 'parent',
        timestamp: Date.now()
      }, '*');
    } catch (error) {
      console.warn('Failed to send theme to iframe:', error);
    }
  }, []);

  // Broadcast theme to all registered iframes
  const broadcastTheme = useCallback((themeToSend: Theme) => {
    iframesRef.current.forEach(iframe => {
      sendThemeToIframe(iframe, themeToSend);
    });
  }, [sendThemeToIframe]);

  // Register an iframe for theme sync
  const syncThemeToIframe = useCallback((iframe: HTMLIFrameElement | null) => {
    if (iframe) {
      iframesRef.current.add(iframe);
      // Send current theme immediately
      sendThemeToIframe(iframe, theme);
    }
  }, [theme, sendThemeToIframe]);

  // Update theme and save to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  // Toggle between light and dark modes
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Listen for theme sync requests from iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'IFRAME_READY' || event.data?.type === 'IFRAME_THEME_READY') {
        // Iframe is ready, send current theme
        broadcastTheme(theme);
      } else if (event.data?.type === 'THEME_SYNC' && event.data.source === 'iframe') {
        // Iframe requested theme sync - respond with current theme
        broadcastTheme(theme);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [theme, broadcastTheme]);

  // Update document classes and broadcast to iframes when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('color-scheme', 'light');
    }

    // Broadcast theme change to all registered iframes
    broadcastTheme(theme);
  }, [theme, broadcastTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, syncThemeToIframe }}>
      {children}
    </ThemeContext.Provider>
  );
};
