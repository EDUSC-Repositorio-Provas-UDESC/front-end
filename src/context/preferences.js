import { createContext, useContext } from 'react';

// ============================================================
// Preferências de interface (tema e tamanho de fonte).
// O Provider fica em PreferencesProvider.jsx; aqui ficam o contexto,
// as constantes e o hook (separados para o Fast Refresh do Vite).
// ============================================================

export const PREFERENCES_STORAGE_KEY = 'udesc_estuda_prefs';

export const THEMES = ['light', 'dark'];

export const FONT_SIZES = [
    { value: 'small', label: 'Pequena' },
    { value: 'medium', label: 'Média' },
    { value: 'large', label: 'Grande' },
];

export const PreferencesContext = createContext({
    theme: 'light',
    fontSize: 'medium',
    setTheme: () => {},
    toggleTheme: () => {},
    setFontSize: () => {},
});

export const usePreferences = () => useContext(PreferencesContext);
