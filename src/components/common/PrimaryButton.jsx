import { Button, CircularProgress } from '@mui/material';

export default function PrimaryButton({
    children,
    endIcon,
    startIcon,
    loading = false,
    disabled = false,
    fullWidth = true,
    sx = {},
    ...props
}) {
    return (
        <Button
            variant="contained"
            fullWidth={fullWidth}
            disabled={disabled || loading}
            startIcon={!loading ? startIcon : null}
            endIcon={!loading ? endIcon : null}
            sx={{
                backgroundColor: 'var(--c-brand)',
                color: 'var(--c-on-brand)',
                borderRadius: '7px',
                padding: '9px 18px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                marginTop: 'clamp(12px, 2vh, 18px)',
                height: '40px',
                '&:hover': {
                    backgroundColor: 'var(--c-brand-hover)',
                    boxShadow: 'none',
                },
                '&.Mui-disabled': {
                    backgroundColor: 'var(--c-brand-disabled)',
                    color: 'var(--c-on-brand)',
                },
                ...sx,
            }}
            {...props}
        >
            {loading ? <CircularProgress size={20} color="inherit" /> : children}
        </Button>
    );
}
