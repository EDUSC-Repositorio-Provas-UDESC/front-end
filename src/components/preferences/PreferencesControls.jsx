import { Box, IconButton, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { FONT_SIZES, usePreferences } from '../../context/preferences';

// Tamanho visual do "A" de cada opção (não depende da escala atual)
const SAMPLE_SIZE = { small: '11px', medium: '13px', large: '15px' };

// Controles de acessibilidade: alternar tema claro/escuro e tamanho da fonte.
export default function PreferencesControls() {
    const { theme, toggleTheme, fontSize, setFontSize } = usePreferences();
    const isDark = theme === 'dark';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 0.75 }}>
            <Typography
                component="p"
                sx={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.6px', color: 'var(--c-text-muted)', ml: 1 }}
            >
                PREFERÊNCIAS
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={fontSize}
                    onChange={(_, value) => value && setFontSize(value)}
                    aria-label="Tamanho da fonte"
                    sx={{
                        bgcolor: 'var(--c-surface)',
                        '& .MuiToggleButton-root': {
                            px: 1.1,
                            py: 0.25,
                            minWidth: 32,
                            lineHeight: 1.6,
                            fontWeight: 700,
                            color: 'var(--c-text-muted)',
                            borderColor: 'var(--c-border)',
                            '&.Mui-selected': {
                                color: 'var(--c-primary)',
                                bgcolor: 'var(--c-primary-soft)',
                                '&:hover': { bgcolor: 'var(--c-primary-soft-hover)' },
                            },
                        },
                    }}
                >
                    {FONT_SIZES.map((option) => (
                        <ToggleButton
                            key={option.value}
                            value={option.value}
                            aria-label={`Fonte ${option.label.toLowerCase()}`}
                            title={`Fonte ${option.label.toLowerCase()}`}
                            sx={{ fontSize: SAMPLE_SIZE[option.value] }}
                        >
                            A
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <Tooltip title={isDark ? 'Usar modo claro' : 'Usar modo escuro'}>
                    <IconButton
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
                        size="small"
                        sx={{
                            color: 'var(--c-text-muted)',
                            border: '1px solid var(--c-border)',
                            borderRadius: '8px',
                            bgcolor: 'var(--c-surface)',
                            '&:hover': { color: 'var(--c-primary)', bgcolor: 'var(--c-primary-soft)' },
                        }}
                    >
                        {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}
