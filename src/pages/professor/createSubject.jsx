import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    InputBase,
    Select,
    MenuItem,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CheckIcon from '@mui/icons-material/Check';
import SideBar from '../../components/sideBar/sideBar';
import Header from '../../components/header/header';
import PrimaryButton from '../../components/common/PrimaryButton';
import { loginService } from '../../services/loginService';
const { getCurrentUser } = loginService;
import {
    getAvailableCourses,
    validateSubjectCode,
    createSubject,
} from '../../services/professorService';

// ---- Componente: Campo de Formulário ----
function FormField({ label, required, children, helperText, helperColor }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'var(--c-text-secondary)', mb: 0.75 }}
            >
                {label}
                {required && <span style={{ color: 'var(--c-primary-strong)' }}> *</span>}
            </Typography>
            {children}
            {helperText && (
                <Typography variant="caption" sx={{ color: helperColor || 'var(--c-text-muted)', mt: 0.5, display: 'block' }}>
                    {helperText}
                </Typography>
            )}
        </Box>
    );
}

// ---- Componente: Input Estilizado ----
function StyledInput({ value, onChange, placeholder, multiline, rows, ...props }) {
    return (
        <InputBase
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            multiline={multiline}
            rows={rows}
            fullWidth
            {...props}
            sx={{
                border: '1px solid var(--c-border-strong)',
                borderRadius: 2,
                px: 2,
                py: multiline ? 1.5 : 0,
                fontSize: '0.9375rem',
                color: 'var(--c-text)',
                bgcolor: 'var(--c-surface)',
                alignItems: multiline ? 'flex-start' : 'center',
                '&.Mui-focused': { borderColor: 'var(--c-primary-strong)', boxShadow: '0 0 0 3px var(--c-focus-ring)' },
                '& input': { py: 1.25 },
                ...props.sx,
            }}
        />
    );
}

// ---- Página Principal ----
export default function CreateSubject() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    // Protege a rota
    useEffect(() => {
        if (!user || user.role !== 'professor') {
            navigate('/home');
        }
    }, [user, navigate]);

    // Form state
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [courseId, setCourseId] = useState('');
    const [description, setDescription] = useState('');
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Validação de código
    const [codeStatus, setCodeStatus] = useState(null); // null | 'checking' | 'available' | 'unavailable'

    // Submissão
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Carrega cursos
    useEffect(() => {
        if (!user || user.role !== 'professor') return;
        getAvailableCourses()
            .then(setCourses)
            .finally(() => setLoadingCourses(false));
    }, []);

    // Valida código com debounce
    useEffect(() => {
        if (!code || !courseId) {
            setCodeStatus(null);
            return;
        }
        setCodeStatus('checking');
        const timer = setTimeout(async () => {
            try {
                const result = await validateSubjectCode(code, courseId);
                setCodeStatus(result.available ? 'available' : 'unavailable');
            } catch {
                setCodeStatus(null);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [code, courseId]);

    const professorName = user?.name || 'Professor';

    const validate = () => {
        if (!name.trim()) return 'Informe o nome da matéria.';
        if (!code.trim()) return 'Informe o código da disciplina.';
        if (!courseId) return 'Selecione o curso de graduação.';
        if (!description.trim()) return 'Informe a descrição / ementa.';
        if (codeStatus === 'unavailable') return 'O código informado já está em uso neste curso.';
        return null;
    };

    const handleSave = useCallback(async (status) => {
        setError('');
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        try {
            await createSubject({
                name: name.trim(),
                code: code.trim().toUpperCase(),
                courseId,
                professorId: user?.id,
                description: description.trim(),
                status,
            });
            setSuccess(
                status === 'publicado'
                    ? 'Matéria publicada com sucesso!'
                    : 'Rascunho salvo com sucesso!'
            );
            setTimeout(() => navigate('/professor/painel'), 1200);
        } catch {
            setError('Ocorreu um erro ao salvar. Tente novamente.');
        } finally {
            setSaving(false);
        }
    }, [name, code, courseId, description, user, navigate]);

    if (!user || user.role !== 'professor') return null;

    const initials = user.name
        ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : 'P';

    const codeHelperText = codeStatus === 'checking'
        ? 'Verificando disponibilidade...'
        : codeStatus === 'available'
            ? '✓ Código disponível neste curso.'
            : codeStatus === 'unavailable'
                ? 'Código já utilizado neste curso.'
                : '';

    const codeHelperColor = codeStatus === 'available' ? 'var(--c-primary-strong)' : codeStatus === 'unavailable' ? 'var(--c-danger)' : 'var(--c-text-muted)';

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
                userRole="Professor"
                userInitials={initials}
                defaultActive="criar-materia"
                userRoleKey="professor"
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={[
                        { label: 'Espaço acadêmico', href: '/home' },
                        { label: 'Painel do professor', href: '/professor/painel' },
                        { label: 'Criar matéria' },
                    ]} />

                {/* Área de conteúdo rolável (sidebar e header ficam fixos) */}
                <Box component="main" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    <Box
                        sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            maxWidth: '800px',
                            mx: 'auto',
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ mb: 4 }}>
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: 800, color: 'var(--c-text)', fontSize: { xs: '1.0938rem', md: '1.5625rem' }, mb: 0.5 }}
                            >
                                Criar Matéria
                            </Typography>
                        </Box>

                        {/* Alertas */}
                        {error && (
                            <Alert severity="error" icon={<ErrorOutlinedIcon />} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" icon={<CheckCircleOutlinedIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                                {success}
                            </Alert>
                        )}

                        {/* Card de Formulário */}
                        <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid var(--c-border)' }}>
                            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--c-text)', mb: 0.5 }}>
                                    Informações da disciplina
                                </Typography>

                                <Divider sx={{ mb: 3 }} />

                                {/* Nome da matéria */}
                                <FormField label="Nome da matéria" required>
                                    <StyledInput
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Cálculo II"
                                    />
                                </FormField>

                                {/* Código da disciplina */}
                                <FormField
                                    label="Código da disciplina"
                                    required
                                    helperText={codeHelperText}
                                    helperColor={codeHelperColor}
                                >
                                    <StyledInput
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="Ex: CAL2001"
                                    />
                                </FormField>

                                {/* Curso de graduação */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, color: 'var(--c-text-secondary)', mb: 0.75 }}
                                    >
                                        Curso de graduação <span style={{ color: 'var(--c-primary-strong)' }}>*</span>
                                    </Typography>
                                    {loadingCourses ? (
                                        <CircularProgress size={20} sx={{ color: 'var(--c-primary-strong)' }} />
                                    ) : (
                                        <Select
                                            fullWidth
                                            value={courseId}
                                            onChange={(e) => setCourseId(e.target.value)}
                                            displayEmpty
                                            sx={{
                                                border: '1px solid var(--c-border-strong)',
                                                borderRadius: 2,
                                                bgcolor: 'var(--c-surface)',
                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                '&.Mui-focused': { borderColor: 'var(--c-primary-strong)', boxShadow: '0 0 0 3px var(--c-focus-ring)' },
                                                fontSize: '0.9375rem',
                                                '& .MuiSelect-select': {
                                                    py: 1.25,
                                                    px: 2,
                                                },
                                            }}
                                            renderValue={(v) => {
                                                if (!v) {
                                                    return <span style={{ color: 'var(--c-text-subtle)' }}>Selecione o curso</span>;
                                                }
                                                return courses.find((c) => c.value === v)?.label || v;
                                            }}
                                        >
                                            {courses.map((c) => (
                                                <MenuItem key={c.value} value={c.value}>
                                                    {c.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                </Box>

                                {/* Professor responsável */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, color: 'var(--c-text-secondary)', mb: 0.75 }}
                                    >
                                        Professor responsável <span style={{ color: 'var(--c-primary-strong)' }}>*</span>
                                    </Typography>
                                    <Select
                                        fullWidth
                                        value="current"
                                        disabled
                                        sx={{
                                            border: '1px solid var(--c-border-strong)',
                                            borderRadius: 2,
                                            bgcolor: 'var(--c-surface-alt)',
                                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                            fontSize: '0.9375rem',
                                            color: 'var(--c-text-secondary)',
                                            '& .MuiSelect-select': {
                                                py: 1.25,
                                                px: 2,
                                            },
                                        }}
                                    >
                                        <MenuItem value="current">{professorName} (você)</MenuItem>
                                    </Select>
                                </Box>

                                {/* Descrição / ementa */}
                                <FormField label="Descrição / ementa" required>
                                    <StyledInput
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Descreva o conteúdo programático, objetivos e informações relevantes da disciplina."
                                        multiline
                                        rows={4}
                                    />
                                </FormField>

                                {/* Rodapé: Botões */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 2,
                                        mt: 1,
                                    }}
                                >
                                    <PrimaryButton
                                        startIcon={<CheckIcon />}
                                        onClick={() => handleSave('publicado')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Publicando...' : 'Publicar matéria'}
                                    </PrimaryButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}