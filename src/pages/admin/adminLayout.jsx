import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    InputBase,
    Select,
    MenuItem,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SideBar from '../../components/sideBar/sideBar';
import Header from '../../components/header/header';
import { loginService } from '../../services/loginService';
import { getRequestsSummary } from '../../services/adminService';
import { COLORS, isAdminUser, outlinedButtonSx } from './adminTheme';

const { getCurrentUser } = loginService;

// ---- Layout base das páginas do administrador ----
// Protege a rota (apenas administrador), renderiza sidebar + header e o título da página.
export default function AdminLayout({ active, breadcrumb, title, action, pendingCount, children }) {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const allowed = isAdminUser(user);
    const [fetchedPending, setFetchedPending] = useState(0);

    useEffect(() => {
        if (!allowed) navigate('/home');
    }, [allowed, navigate]);

    useEffect(() => {
        if (!allowed || pendingCount !== undefined) return;
        getRequestsSummary()
            .then((s) => setFetchedPending(s.pendente))
            .catch(() => setFetchedPending(0));
    }, [allowed, pendingCount]);

    if (!allowed) return null;

    const initials = user.name
        ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : 'AD';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                bgcolor: 'var(--c-bg)',
            }}
        >
            <SideBar
                userName={user.name}
                userRole="Administrador"
                userInitials={initials}
                defaultActive={active}
                userRoleKey="admin"
                badges={{ solicitacoes: pendingCount ?? fetchedPending }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={[{ label: 'Administração' }, { label: breadcrumb }]} />

                <Box
                    component="main"
                    sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 5 } }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            mb: 4,
                        }}
                    >
                        <Typography
                            component="h2"
                            sx={{ fontWeight: 700, color: COLORS.text, fontSize: { xs: '1.2812rem', md: '1.7188rem' }, letterSpacing: '-0.5px' }}
                        >
                            {title}
                        </Typography>
                        {action}
                    </Box>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

// ---- Card / painel branco ----
export function Panel({ children, sx = {} }) {
    return (
        <Box
            sx={{
                bgcolor: 'var(--c-surface)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '12px',
                overflow: 'hidden',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

// ---- Campo de busca com atalho ⌘K ----
export function SearchField({ value, onChange, placeholder, inputRef }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: 'var(--c-surface)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '10px',
                px: 2,
                height: 46,
                '&:focus-within': { borderColor: COLORS.primary, boxShadow: '0 0 0 3px var(--c-focus-ring)' },
            }}
        >
            <SearchIcon sx={{ fontSize: 20, color: COLORS.muted }} />
            <InputBase
                inputRef={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                sx={{ flex: 1, fontSize: '0.875rem' }}
            />
            <Typography sx={{ fontSize: '0.7rem', color: COLORS.muted, display: { xs: 'none', sm: 'block' } }}>
                ⌘ K
            </Typography>
        </Box>
    );
}

// ---- Rótulo de campo ----
export function FieldLabel({ children, required }) {
    return (
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.text, mb: 0.75 }}>
            {children}
            {required && ' *'}
        </Typography>
    );
}

const fieldSx = {
    bgcolor: 'var(--c-surface)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: 'var(--c-border-strong)' },
    '&:hover fieldset': { borderColor: 'var(--c-text-subtle)' },
    '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: '1.5px' },
};

// ---- Select estilizado ----
export function StyledSelect({ value, onChange, options, placeholder, sx = {} }) {
    return (
        <Select
            fullWidth
            size="small"
            value={value}
            displayEmpty
            onChange={(e) => onChange(e.target.value)}
            sx={{ ...fieldSx, '& .MuiSelect-select': { py: 1.4, px: 1.5 }, ...sx }}
            renderValue={(v) => {
                if (v === '' && placeholder) return <span style={{ color: COLORS.text }}>{placeholder}</span>;
                return options.find((o) => o.value === v)?.label ?? v;
            }}
        >
            {placeholder && <MenuItem value="">{placeholder}</MenuItem>}
            {options.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                    {o.label}
                </MenuItem>
            ))}
        </Select>
    );
}

// ---- Input de texto estilizado ----
export function StyledInput({ value, onChange, placeholder, multiline, rows, error }) {
    return (
        <InputBase
            fullWidth
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            multiline={multiline}
            rows={rows}
            sx={{
                bgcolor: 'var(--c-surface)',
                border: `1px solid ${error ? COLORS.danger : 'var(--c-border-strong)'}`,
                borderRadius: '8px',
                px: 1.5,
                py: multiline ? 1.25 : 0,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                alignItems: 'flex-start',
                '& input': { py: 1.4 },
                '&.Mui-focused': { borderColor: COLORS.primary, boxShadow: '0 0 0 3px var(--c-focus-ring)' },
            }}
        />
    );
}

// ---- Etiqueta de estado (tons do design) ----
const TONES = {
    success: { color: COLORS.primary, bg: COLORS.primarySoft },
    warning: { color: COLORS.warning, bg: COLORS.warningSoft },
    neutral: { color: 'var(--c-text-secondary)', bg: COLORS.neutralSoft },
    info: { color: COLORS.infoText, bg: COLORS.infoSoft },
    danger: { color: COLORS.danger, bg: COLORS.dangerSoft },
};

export function StatusChip({ label, tone = 'neutral', sx = {} }) {
    const t = TONES[tone] || TONES.neutral;
    return (
        <Chip
            label={label}
            size="small"
            sx={{
                height: 26,
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.72rem',
                color: t.color,
                bgcolor: t.bg,
                '& .MuiChip-label': { px: 1.1 },
                ...sx,
            }}
        />
    );
}

// ---- Cabeçalho de tabela ----
export function TableHead({ columns, template }) {
    return (
        <Box
            sx={{
                display: { xs: 'none', sm: 'grid' },
                gridTemplateColumns: template,
                alignItems: 'center',
                px: 2.5,
                py: 1.5,
                bgcolor: 'var(--c-table-head)',
            }}
        >
            {columns.map((c, i) => (
                <Typography
                    key={c}
                    sx={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: 'var(--c-text-secondary)',
                        letterSpacing: '0.04em',
                        textAlign: i === 0 ? 'left' : 'center',
                    }}
                >
                    {c}
                </Typography>
            ))}
        </Box>
    );
}

// ---- Diálogo de confirmação (exclusões) ----
export function ConfirmDialog({ open, title, message, confirmLabel = 'Excluir', loading, onConfirm, onClose }) {
    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 600, fontSize: '1.05rem' }}>{title}</DialogTitle>
            <DialogContent>
                <Typography sx={{ fontSize: '0.875rem', color: COLORS.muted }}>{message}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose} disabled={loading} sx={{ ...outlinedButtonSx, height: 38 }} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    disableElevation
                    sx={{
                        bgcolor: COLORS.danger,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        height: 38,
                        '&:hover': { bgcolor: 'var(--c-danger)' },
                    }}
                >
                    {loading ? 'Excluindo...' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
