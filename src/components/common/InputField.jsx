import React from 'react';
import { FormControl, FormLabel, TextField, Box, Typography } from '@mui/material';

export default function InputField({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    helperText,
    helperIcon,
    helperColor = '#6b7280',
    required = false,
    inputSx = {},
    ...props
}) {
    // Suporte defensivo a camelCase e kebab-case
    const resolvedHelperText = helperText || props['helper-text'];
    const resolvedHelperIcon = helperIcon || props['helper-icon'];
    const resolvedHelperColor = helperColor || props['helper-color'] || '#6b7280';

    // Evita duplicar asterisco se o label já contiver '*'
    const renderLabel = () => {
        if (!label) return null;
        if (label.endsWith('*') || !required) return label;
        return `${label} *`;
    };

    return (
        <FormControl fullWidth>
            {label && (
                <FormLabel
                    sx={{
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#1f2937',
                        marginBottom: '3px',
                        '&.Mui-focused': { color: '#1f2937' },
                    }}
                >
                    {renderLabel()}
                </FormLabel>
            )}
            <TextField
                fullWidth
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                variant="outlined"
                size="small"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '7px',
                        backgroundColor: '#ffffff',
                        '& fieldset': { borderColor: '#d1d5db' },
                        '&:hover fieldset': { borderColor: '#9ca3af' },
                        '&.Mui-focused fieldset': { borderColor: '#006b47', borderWidth: '1.5px' },
                    },
                    '& .MuiOutlinedInput-input': {
                        padding: '8px 12px',
                        fontSize: '13.5px',
                        color: '#111827',
                    },
                    ...inputSx,
                }}
                {...props}
            />
            {resolvedHelperText && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    {resolvedHelperIcon}
                    <Typography sx={{ fontSize: '11px', color: resolvedHelperColor, fontWeight: 500 }}>
                        {resolvedHelperText}
                    </Typography>
                </Box>
            )}
        </FormControl>
    );
}
