import { useEffect } from 'react';

export const ADMIN_ROLES = ['admin', 'administrador'];
export const isAdminUser = (user) => !!user && ADMIN_ROLES.includes(String(user.role).toLowerCase());

export const COLORS = {
    primary: 'var(--c-primary)',
    primaryDark: 'var(--c-primary-strong)',
    primarySoft: 'var(--c-primary-soft)',
    text: 'var(--c-text)',
    muted: 'var(--c-text-muted)',
    border: 'var(--c-border)',
    danger: 'var(--c-danger)',
    dangerSoft: 'var(--c-danger-soft)',
    warning: 'var(--c-warning)',
    warningSoft: 'var(--c-warning-soft)',
    infoText: 'var(--c-info)',
    infoSoft: 'var(--c-info-soft)',
    neutralSoft: 'var(--c-surface-muted)',
};

export const outlinedButtonSx = {
    borderColor: 'var(--c-border-strong)',
    color: COLORS.primary,
    bgcolor: 'var(--c-surface)',
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    px: 2,
    height: 42,
    '&:hover': { borderColor: COLORS.primary, bgcolor: COLORS.primarySoft },
};

// Foca o campo de busca com Ctrl/⌘ + K
export function useSearchShortcut(inputRef) {
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [inputRef]);
}
