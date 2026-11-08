import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme/theme';
import { PreferencesContext, PREFERENCES_STORAGE_KEY, THEMES, FONT_SIZES } from './preferences';

// Lê as preferências salvas; na primeira visita segue o tema do sistema.
function loadPreferences() {
    const systemDark =
        typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const defaults = { theme: systemDark ? 'dark' : 'light', fontSize: 'medium' };

    try {
        const saved = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}');
        return {
            theme: THEMES.includes(saved.theme) ? saved.theme : defaults.theme,
            fontSize: FONT_SIZES.some((f) => f.value === saved.fontSize) ? saved.fontSize : defaults.fontSize,
        };
    } catch {
        return defaults;
    }
}

export default function PreferencesProvider({ children }) {
    const [prefs, setPrefs] = useState(loadPreferences);

    // Aplica no <html> (as variáveis CSS de src/index.css reagem a esses atributos) e persiste
    useEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = prefs.theme;
        root.dataset.fontSize = prefs.fontSize;
        try {
            localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
        } catch {
            // armazenamento indisponível (modo privado): mantém só na sessão
        }
    }, [prefs]);

    const muiTheme = useMemo(() => createAppTheme(prefs.theme), [prefs.theme]);

    const value = useMemo(
        () => ({
            ...prefs,
            setTheme: (theme) => setPrefs((p) => ({ ...p, theme })),
            toggleTheme: () => setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' })),
            setFontSize: (fontSize) => setPrefs((p) => ({ ...p, fontSize })),
        }),
        [prefs]
    );

    return (
        <PreferencesContext.Provider value={value}>
            <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
        </PreferencesContext.Provider>
    );
}
