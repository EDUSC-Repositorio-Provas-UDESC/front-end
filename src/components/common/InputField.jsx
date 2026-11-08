import { FormControl, FormLabel, TextField, Box, Typography } from '@mui/material';

export default function InputField({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    helperText,
    helperIcon,
    helperColor = 'var(--c-text-muted)',
    required = false,
    inputSx = {},
    ...props
}) {
    // Suporte defensivo a camelCase e kebab-case
    const resolvedHelperText = helperText || props['helper-text'];
    const resolvedHelperIcon = helperIcon || props['helper-icon'];
    const resolvedHelperColor = helperColor || props['helper-color'] || 'var(--c-text-muted)';

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
                        fontSize: '0.7812rem',
                        fontWeight: 600,
                        color: 'var(--c-text)',
                        marginBottom: '3px',
                        '&.Mui-focused': { color: 'var(--c-text)' },
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
                        backgroundColor: 'var(--c-surface)',
                        '& fieldset': { borderColor: 'var(--c-border-strong)' },
                        '&:hover fieldset': { borderColor: 'var(--c-text-subtle)' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--c-primary)', borderWidth: '1.5px' },
                    },
                    '& .MuiOutlinedInput-input': {
                        padding: '8px 12px',
                        fontSize: '0.8438rem',
                        color: 'var(--c-text)',
                    },
                    ...inputSx,
                }}
                {...props}
            />
            {resolvedHelperText && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    {resolvedHelperIcon}
                    <Typography sx={{ fontSize: '0.6875rem', color: resolvedHelperColor, fontWeight: 500 }}>
                        {resolvedHelperText}
                    </Typography>
                </Box>
            )}
        </FormControl>
    );
}
