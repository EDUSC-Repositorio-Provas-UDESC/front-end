import { createTheme } from '@mui/material/styles';

// ============================================================
// Tema MUI espelhando a paleta de src/index.css.
// O MUI precisa de cores reais (não variáveis CSS) para calcular contrastes
// e estilizar componentes internos (Menu, Dialog, Tooltip, Inputs...).
// Nos componentes, prefira as variáveis CSS: sx={{ color: 'var(--c-text)' }}.
// ============================================================

const PALETTES = {
    light: {
        primary: '#006b47',
        background: '#f4f6f5',
        paper: '#ffffff',
        text: '#1f2d27',
        textSecondary: '#6b7280',
        divider: '#e5e7eb',
        error: '#c62828',
        warning: '#8a5a00',
        info: '#2f4f8a',
    },
    dark: {
        primary: '#4cc38a',
        background: '#0f1412',
        paper: '#171d1a',
        text: '#e6ece9',
        textSecondary: '#9aa6a0',
        divider: '#2a332f',
        error: '#f87171',
        warning: '#f2b84b',
        info: '#8fb4f0',
    },
};

export function createAppTheme(mode = 'light') {
    const p = PALETTES[mode] || PALETTES.light;

    return createTheme({
        palette: {
            mode,
            primary: { main: p.primary },
            error: { main: p.error },
            warning: { main: p.warning },
            info: { main: p.info },
            background: { default: p.background, paper: p.paper },
            text: { primary: p.text, secondary: p.textSecondary },
            divider: p.divider,
        },
        typography: {
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            // Títulos mais contidos que o padrão do MUI
            h1: { fontSize: '2rem', fontWeight: 700 },
            h2: { fontSize: '1.75rem', fontWeight: 700 },
            h3: { fontSize: '1.5rem', fontWeight: 700 },
            h4: { fontSize: '1.375rem', fontWeight: 700 },
            h5: { fontSize: '1.2rem', fontWeight: 700 },
            h6: { fontSize: '1.05rem', fontWeight: 700 },
            button: { textTransform: 'none' },
        },
        components: {
            MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
            MuiDivider: { styleOverrides: { root: { borderColor: 'var(--c-border)' } } },
        },
    });
}
