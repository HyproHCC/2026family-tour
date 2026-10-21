import { useState, useEffect } from 'react';

const STORAGE_FONT_KEY = 'family_trip_font_mode_v1';

export type FontMode = 'normal' | 'large';

export function getFontMode(): FontMode {
  try {
    const val = localStorage.getItem(STORAGE_FONT_KEY);
    return val === 'large' ? 'large' : 'normal';
  } catch {
    return 'normal';
  }
}

export function setFontMode(mode: FontMode): void {
  try {
    localStorage.setItem(STORAGE_FONT_KEY, mode);
    document.documentElement.dataset.fontMode = mode;
    window.dispatchEvent(new Event('font_mode_changed'));
  } catch (e) {
    console.error('Failed to save font mode', e);
  }
}

// 初始化時立即套用到 html 標籤
if (typeof document !== 'undefined') {
  document.documentElement.dataset.fontMode = getFontMode();
}

export function useFontMode(): [FontMode, (mode?: FontMode) => void] {
  const [mode, setMode] = useState<FontMode>(() => getFontMode());

  useEffect(() => {
    const update = () => {
      const current = getFontMode();
      setMode(current);
      document.documentElement.dataset.fontMode = current;
    };

    window.addEventListener('font_mode_changed', update);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_FONT_KEY) update();
    });

    return () => {
      window.removeEventListener('font_mode_changed', update);
    };
  }, []);

  const toggle = (nextMode?: FontMode) => {
    const target = nextMode !== undefined ? nextMode : mode === 'normal' ? 'large' : 'normal';
    setFontMode(target);
    setMode(target);
  };

  return [mode, toggle];
}
