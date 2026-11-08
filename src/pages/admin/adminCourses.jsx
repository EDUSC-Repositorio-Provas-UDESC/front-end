import { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton, Divider, Button, CircularProgress, Alert, Link as MuiLink, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PrimaryButton from '../../components/common/PrimaryButton';
import AdminLayout, {
    Panel,
    SearchField,
    StatusChip,
    StyledInput,
    StyledSelect,
    FieldLabel,
    TableHead,
    ConfirmDialog,
} from './adminLayout';
import { COLORS, outlinedButtonSx, useSearchShortcut } from './adminTheme';
import { getCourses, getCourseOptions, createCourse, updateCourse, deleteCourse } from '../../services/adminService';

const GRID = { xs: '1fr', sm: '1fr 110px 90px' };

const STATUS_CHIP = {
    ativo: { label: 'Ativo', tone: 'success' },
    novo: { label: 'Criado agora', tone: 'success' },
    inativo: { label: 'Inativo', tone: 'neutral' },
};

const STATUS_OPTIONS = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
];

const EMPTY_FORM = { name: '', code: '', degree: 'bacharelado', campus: '', description: '', status: 'ativo' };

// ---- Linha da tabela de cursos ----
function CourseRow({ course, campusLabel, selected, onEdit, onDelete }) {
    const chip = STATUS_CHIP[course.status] || STATUS_CHIP.ativo;
    return (
        <Box
            onClick={onEdit}
            sx={{
                display: 'grid',
                gridTemplateColumns: GRID,
                alignItems: 'center',
                gap: { xs: 1.5, sm: 0 },
                px: 2.5,
                py: 3,
                cursor: 'pointer',
                bgcolor: selected ? COLORS.primarySoft : 'var(--c-surface)',
                borderBottom: `1px solid ${COLORS.border}`,
                '&:last-of-type': { borderBottom: 'none' },
                '&:hover': { bgcolor: selected ? COLORS.primarySoft : 'var(--c-surface-alt)' },
            }}
        >
            <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: COLORS.text, mb: 0.5 }}>
                    {course.name}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.muted }}>
                    {course.code} • {campusLabel}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.muted, mt: 0.25 }}>
                    {course.subjectsQty} disciplinas
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                <StatusChip
                    label={chip.label}
                    tone={chip.tone}
                    sx={selected ? { bgcolor: 'transparent' } : {}}
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' }, gap: 0.5 }}>
                <Tooltip title="Editar">
                    <IconButton
                        size="small"
                        aria-label={`Editar ${course.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        sx={{ color: COLORS.primary }}
                    >
                        <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                    <IconButton
                        size="small"
                        aria-label={`Excluir ${course.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        sx={{ color: COLORS.danger }}
                    >
                        <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}

// ---- Painel de criação / edição ----
function CourseEditor({ course, options, saving, error, onSave, onCancel, onDelete }) {
    const isEdit = !!course;
    // O componente é remontado (key) ao trocar de curso, então o estado inicial basta
    const [form, setForm] = useState(() =>
        course
            ? {
                  name: course.name,
                  code: course.code,
                  degree: course.degree,
                  campus: course.campus,
                  description: course.description || '',
                  status: course.status === 'inativo' ? 'inativo' : 'ativo',
              }
            : EMPTY_FORM
    );

    const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

    return (
        <Panel sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', color: COLORS.text }}>
                    {isEdit ? 'Editar curso' : 'Criar curso'}
                </Typography>
                <IconButton size="small" onClick={onCancel} aria-label="Fechar">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 2.5 }}>
                <FieldLabel required>Nome do curso</FieldLabel>
                <StyledInput value={form.name} onChange={set('name')} placeholder="Ex: Ciência da Computação" />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
                <Box>
                    <FieldLabel required>Código</FieldLabel>
                    <StyledInput value={form.code} onChange={(v) => set('code')(v.toUpperCase())} placeholder="Ex: BCC" />
                </Box>
                <Box>
                    <FieldLabel required>Grau</FieldLabel>
                    <StyledSelect value={form.degree} onChange={set('degree')} options={options.degrees} />
                </Box>
            </Box>

            <Box sx={{ mb: 2.5 }}>
                <FieldLabel required>Centro / campus</FieldLabel>
                <StyledSelect
                    value={form.campus}
                    onChange={set('campus')}
                    options={options.campuses}
                    placeholder={form.campus ? undefined : 'Selecione o centro'}
                />
            </Box>

            <Box sx={{ mb: 2.5 }}>
                <FieldLabel>Descrição</FieldLabel>
                <StyledInput
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Descreva o perfil do curso."
                    multiline
                    rows={3}
                />
            </Box>

            <Box sx={{ mb: 2.5 }}>
                <FieldLabel required>Estado do curso</FieldLabel>
                <StyledSelect value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
            </Box>

            <Divider sx={{ mb: 2.5, borderColor: COLORS.border }} />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                <Button variant="outlined" onClick={onCancel} disabled={saving} sx={outlinedButtonSx}>
                    Cancelar
                </Button>
                <PrimaryButton
                    fullWidth={false}
                    startIcon={<CheckIcon />}
                    loading={saving}
                    onClick={() => onSave(form)}
                    sx={{ mt: 0, height: 42, px: 2.5 }}
                >
                    {isEdit ? 'Salvar alterações' : 'Criar curso'}
                </PrimaryButton>
            </Box>

            {isEdit && (
                <MuiLink
                    component="button"
                    onClick={onDelete}
                    underline="hover"
                    sx={{ display: 'block', mt: 2.5, fontSize: '0.75rem', fontWeight: 600, color: COLORS.danger }}
                >
                    Excluir este curso
                </MuiLink>
            )}
        </Panel>
    );
}

// ---- Página Principal ----
export default function AdminCourses() {
    const searchRef = useRef(null);
    useSearchShortcut(searchRef);

    const [query, setQuery] = useState('');
    const [courses, setCourses] = useState([]);
    const [options, setOptions] = useState({ campuses: [], degrees: [] });
    const [loading, setLoading] = useState(true);
    // editor: null = fechado | 'new' = criar | id = editar
    const [editor, setEditor] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const firstLoad = useRef(true);

    const load = async (q = query) => {
        const data = await getCourses({ q });
        setCourses(data);
        return data;
    };

    useEffect(() => {
        getCourseOptions().then(setOptions).catch(() => {});
    }, []);

    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await getCourses({ q: query });
                if (!active) return;
                setCourses(data);
                if (firstLoad.current) {
                    firstLoad.current = false;
                    setEditor(data[0]?.id ?? null);
                }
            } finally {
                if (active) setLoading(false);
            }
        }, 250);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query]);

    const editingCourse = editor && editor !== 'new' ? courses.find((c) => c.id === editor) : null;
    const campusShort = (id) => options.campuses.find((c) => c.value === id)?.short || id?.toUpperCase();

    const openEditor = (id) => {
        setFormError('');
        setEditor(id);
    };

    const handleSave = async (form) => {
        setFormError('');
        setFeedback('');
        if (!form.name.trim()) return setFormError('Informe o nome do curso.');
        if (!form.code.trim()) return setFormError('Informe o código do curso.');
        if (!form.campus) return setFormError('Selecione o centro / campus.');

        const payload = { ...form, name: form.name.trim(), code: form.code.trim(), description: form.description.trim() };
        setSaving(true);
        try {
            if (editor === 'new') {
                const created = await createCourse(payload);
                await load();
                setEditor(created.id);
                setFeedback('Curso criado com sucesso.');
            } else {
                await updateCourse(editor, payload);
                await load();
                setFeedback('Alterações salvas.');
            }
        } catch (err) {
            setFormError(err.message || 'Não foi possível salvar. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteCourse(toDelete.id);
            if (editor === toDelete.id) setEditor(null);
            await load();
            setFeedback(`Curso "${toDelete.name}" excluído.`);
            setToDelete(null);
        } catch {
            setFeedback('');
            setFormError('Não foi possível excluir o curso.');
        } finally {
            setDeleting(false);
        }
    };

    const editorOpen = editor !== null && (editor === 'new' || !!editingCourse);

    return (
        <AdminLayout
            active="cursos"
            breadcrumb="Cursos"
            title="Cursos"
            action={
                <PrimaryButton
                    fullWidth={false}
                    startIcon={<AddIcon />}
                    onClick={() => openEditor('new')}
                    sx={{ mt: 0, height: 42, px: 2.5 }}
                >
                    Criar curso
                </PrimaryButton>
            }
        >
            {feedback && (
                <Alert severity="success" onClose={() => setFeedback('')} sx={{ mb: 3, borderRadius: 2 }}>
                    {feedback}
                </Alert>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: editorOpen ? 'minmax(0, 1.8fr) minmax(320px, 1fr)' : '1fr' },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                {/* No mobile/tablet o editor aparece acima da lista */}
                {editorOpen && (
                    <Box sx={{ order: { xs: 0, lg: 1 } }}>
                        <CourseEditor
                            key={editor}
                            course={editingCourse}
                            options={options}
                            saving={saving}
                            error={formError}
                            onSave={handleSave}
                            onCancel={() => setEditor(null)}
                            onDelete={() => setToDelete(editingCourse)}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, order: { xs: 1, lg: 0 }, minWidth: 0 }}>
                    <SearchField inputRef={searchRef} value={query} onChange={setQuery} placeholder="Buscar curso ou código" />

                    <Panel>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', color: COLORS.text }}>
                                Cursos de graduação
                            </Typography>
                            <StatusChip label={`${courses.length} cursos`} tone="neutral" />
                        </Box>

                        <TableHead columns={['CURSO / CENTRO', 'ESTADO', 'AÇÕES']} template={GRID.sm} />

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress size={28} sx={{ color: COLORS.primary }} />
                            </Box>
                        ) : courses.length === 0 ? (
                            <Typography sx={{ p: 3, textAlign: 'center', fontSize: '0.875rem', color: COLORS.muted }}>
                                Nenhum curso encontrado.
                            </Typography>
                        ) : (
                            courses.map((c) => (
                                <CourseRow
                                    key={c.id}
                                    course={c}
                                    campusLabel={campusShort(c.campus)}
                                    selected={c.id === editor}
                                    onEdit={() => openEditor(c.id)}
                                    onDelete={() => setToDelete(c)}
                                />
                            ))
                        )}
                    </Panel>
                </Box>
            </Box>

            <ConfirmDialog
                open={!!toDelete}
                title="Excluir curso"
                message={`Tem certeza que deseja excluir "${toDelete?.name}"? As disciplinas vinculadas deixarão de estar associadas a este curso.`}
                loading={deleting}
                onConfirm={handleDelete}
                onClose={() => setToDelete(null)}
            />
        </AdminLayout>
    );
}
