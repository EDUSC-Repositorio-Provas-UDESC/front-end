import React, { useEffect, useState, useCallback } from 'react';
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
    Button,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CheckIcon from '@mui/icons-material/Check';
import SideBar from '../../components/sideBar/sideBar';
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
                sx={{ fontWeight: 600, color: '#374151', mb: 0.75 }}
            >
                {label}
                {required && <span style={{ color: '#005c3b' }}> *</span>}
            </Typography>
            {children}
            {helperText && (
                <Typography variant="caption" sx={{ color: helperColor || '#6b7280', mt: 0.5, display: 'block' }}>
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
                border: '1px solid #d1d5db',
                borderRadius: 2,
                px: 2,
                py: multiline ? 1.5 : 0,
                fontSize: '0.9375rem',
                color: '#111827',
                bgcolor: '#fff',
                alignItems: multiline ? 'flex-start' : 'center',
                '&.Mui-focused': { borderColor: '#005c3b', boxShadow: '0 0 0 3px rgba(0,92,59,0.08)' },
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

    const codeHelperColor = codeStatus === 'available' ? '#005c3b' : codeStatus === 'unavailable' ? '#dc2626' : '#6b7280';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <SideBar
                userName={user.name}
                userRole="Professor"
                userInitials={initials}
                defaultActive="criar-materia"
                userRoleKey="professor"
            />

            <Box
                component="main"
                sx={{
                    flex: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    mt: { xs: '56px', md: 0 },
                    maxWidth: '800px',
                    mx: 'auto',
                    width: '100%',
                }}
            >
                {/* Breadcrumb */}
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 3 }}>
                    Espaço acadêmico / Painel do professor / Criar matéria
                </Typography>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, color: '#111827', fontSize: { xs: '1.5rem', md: '2rem' }, mb: 0.5 }}
                    >
                        Uma nova matéria, novas possibilidades.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Organize uma disciplina e prepare um espaço de aprendizagem para a turma.
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
                <Card variant="outlined" sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                            Informações da disciplina
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 3 }}>
                            Campos com * são obrigatórios. Matéria é uma disciplina vinculada a um curso de graduação.
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
                                sx={{ fontWeight: 600, color: '#374151', mb: 0.75 }}
                            >
                                Curso de graduação <span style={{ color: '#005c3b' }}>*</span>
                            </Typography>
                            {loadingCourses ? (
                                <CircularProgress size={20} sx={{ color: '#005c3b' }} />
                            ) : (
                                <Select
                                    fullWidth
                                    value={courseId}
                                    onChange={(e) => setCourseId(e.target.value)}
                                    displayEmpty
                                    sx={{
                                        border: '1px solid #d1d5db',
                                        borderRadius: 2,
                                        bgcolor: '#fff',
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&.Mui-focused': { borderColor: '#005c3b', boxShadow: '0 0 0 3px rgba(0,92,59,0.08)' },
                                        fontSize: '0.9375rem',
                                        '& .MuiSelect-select': {
                                            py: 1.25,
                                            px: 2,
                                        },
                                    }}
                                    renderValue={(v) => {
                                        if (!v) {
                                            return <span style={{ color: '#9ca3af' }}>Selecione o curso</span>;
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
                                sx={{ fontWeight: 600, color: '#374151', mb: 0.75 }}
                            >
                                Professor responsável <span style={{ color: '#005c3b' }}>*</span>
                            </Typography>
                            <Select
                                fullWidth
                                value="current"
                                disabled
                                sx={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: 2,
                                    bgcolor: '#f9fafb',
                                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                    fontSize: '0.9375rem',
                                    color: '#374151',
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
                            <Button
                                variant="outlined"
                                onClick={() => handleSave('rascunho')}
                                disabled={saving}
                                sx={{
                                    borderColor: '#d1d5db',
                                    color: '#374151',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.25,
                                    '&:hover': { borderColor: '#005c3b', color: '#005c3b', bgcolor: 'transparent' },
                                }}
                            >
                                {saving ? 'Salvando...' : 'Salvar rascunho'}
                            </Button>

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
    );
}