import { FormControl, FormLabel, Select, MenuItem } from '@mui/material';

export default function Combobox({
    label,
    value,
    onChange,
    options = [{ value: '', label: 'Nada Inserido' }],
    required = false,
}) {
    return (
        <FormControl fullWidth>
            <FormLabel
                sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--c-text)',
                    marginBottom: '2px',
                    '&.Mui-focused': { color: 'var(--c-text)' },
                }}
            >
                {label}
            </FormLabel>
            <Select
                fullWidth
                value={value}
                onChange={(e) => onChange(e.target.value)}
                displayEmpty
                required={required}
                size="small"
                sx={{
                    borderRadius: '7px',
                    backgroundColor: 'var(--c-surface)',
                    '& fieldset': { borderColor: 'var(--c-border-strong)' },
                    '&:hover fieldset': { borderColor: 'var(--c-text-subtle)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--c-primary)', borderWidth: '1.5px' },
                    '& .MuiSelect-select': {
                        padding: '7px 12px',
                        fontSize: '0.8438rem',
                        color: 'var(--c-text)',
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
