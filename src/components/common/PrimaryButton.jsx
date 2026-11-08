import React from 'react';
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
                backgroundColor: '#006b47',
                color: '#ffffff',
                borderRadius: '7px',
                padding: '9px 18px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                marginTop: 'clamp(12px, 2vh, 18px)',
                height: '40px',
                '&:hover': {
                    backgroundColor: '#005236',
                    boxShadow: 'none',
                },
                '&.Mui-disabled': {
                    backgroundColor: '#80b5a3',
                    color: '#ffffff',
                },
                ...sx,
            }}
            {...props}
        >
            {loading ? <CircularProgress size={20} color="inherit" /> : children}
        </Button>
    );
}
