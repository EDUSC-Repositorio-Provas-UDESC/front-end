import React from 'react';
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
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1f2937',
                    marginBottom: '2px',
                    '&.Mui-focused': { color: '#1f2937' },
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
                    backgroundColor: '#ffffff',
                    '& fieldset': { borderColor: '#d1d5db' },
                    '&:hover fieldset': { borderColor: '#9ca3af' },
                    '&.Mui-focused fieldset': { borderColor: '#006b47', borderWidth: '1.5px' },
                    '& .MuiSelect-select': {
                        padding: '7px 12px',
                        fontSize: '13.5px',
                        color: '#111827',
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
