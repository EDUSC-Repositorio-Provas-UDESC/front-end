import { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton, Divider, Button, CircularProgress, Alert, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PrimaryButton from '../../components/common/PrimaryButton';
import AdminLayout, {
    Panel,
    SearchField,
    StatusChip,
    StyledSelect,
    FieldLabel,
    TableHead,
    ConfirmDialog,
} from './adminLayout';
import { COLORS, outlinedButtonSx, useSearchShortcut } from './adminTheme';
import { loginService } from '../../services/loginService';
import { getProfiles, getProfileOptions, assignRole, deleteProfile } from '../../services/adminService';

const GRID = { xs: '1fr', sm: '1fr 120px 90px' };

const ROLE_LABELS = {
    aluno: { m: 'Aluno', f: 'Aluna', tone: 'neutral' },
    professor: { m: 'Professor', f: 'Professora', tone: 'success' },
    admin: { m: 'Administrador', f: 'Administradora', tone: 'info' },
};

const roleLabel = (profile) => ROLE_LABELS[profile.role]?.[profile.gender === 'f' ? 'f' : 'm'] || profile.role;

// ---- Linha da tabela de perfis ----
function ProfileRow({ profile, selected, onOpen, onDelete, canDelete }) {
    const tone = ROLE_LABELS[profile.role]?.tone || 'neutral';
    return (
        <Box
            onClick={onOpen}
            sx={{
                display: 'grid',
                gridTemplateColumns: GRID,
                alignItems: 'center',
                gap: { xs: 1.5, sm: 0 },
                px: 2,
                py: 3,
                cursor: 'pointer',
                bgcolor: selected ? COLORS.primarySoft : 'var(--c-surface)',
                borderBottom: `1px solid ${COLORS.border}`,
                '&:hover': { bgcolor: selected ? COLORS.primarySoft : 'var(--c-surface-alt)' },
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: COLORS.text, mb: 0.5 }}>
                    {profile.name}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: COLORS.muted, wordBreak: 'break-all' }}>
                    {profile.email}
                </Typography>
                {profile.teacherRequest && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 11, color: COLORS.warning }} />
                        <Typography sx={{ fontSize: '0.7rem', color: COLORS.warning }}>
                            Solicitou papel de professor
                        </Typography>
                    </Box>
                )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                <StatusChip label={roleLabel(profile)} tone={tone} sx={selected ? { bgcolor: 'transparent' } : {}} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' }, gap: 0.5 }}>
                <Tooltip title="Gerenciar permissões">
                    <IconButton
                        size="small"
                        aria-label={`Gerenciar permissões de ${profile.name}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen();
                        }}
                        sx={{ color: COLORS.primary }}
                    >
                        <ManageAccountsOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title={canDelete ? 'Excluir perfil' : 'Você não pode excluir o próprio perfil'}>
                    <span>
                        <IconButton
                            size="small"
                            aria-label={`Excluir ${profile.name}`}
                            disabled={!canDelete}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            sx={{ color: COLORS.danger }}
                        >
                            <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Box>
    );
}

// ---- Painel de detalhes do perfil ----
function ProfileDetails({ profile, options, saving, error, onSubmit, onClose }) {
    // O componente é remontado (key) ao trocar de perfil, então o estado inicial basta.
    // Quem solicitou o papel de professor já abre com "Professor" pré-selecionado.
    const [role, setRole] = useState(profile.teacherRequest ? 'professor' : profile.role);
    const [subjects, setSubjects] = useState(profile.subjects || []);

    const course = options.courses.find((c) => c.value === profile.courseId);
    const courseSubjects = options.subjects.filter((s) => !profile.courseId || s.courseId === profile.courseId);
    const availableSubjects = courseSubjects.filter((s) => !subjects.includes(s.value));
    const isTeacherRole = role === 'professor';
    // Perfil que já é professor: apenas gerencia as disciplinas, sem "indicar" novamente
    const managingTeacher = isTeacherRole && profile.role === 'professor';

    const sectionTitle = managingTeacher
        ? 'Disciplinas do professor'
        : isTeacherRole
            ? 'Indicar como professor'
            : 'Alterar papel';
    const submitLabel = managingTeacher
        ? 'Salvar disciplinas'
        : isTeacherRole
            ? 'Indicar como professor'
            : 'Atribuir papel';
    const submitIcon = managingTeacher ? <SaveOutlinedIcon /> : <PersonAddAltOutlinedIcon />;

    const statusLabel = profile.teacherRequest ? 'Solicitação pendente' : 'Acesso ativo';
    const chipTone = profile.teacherRequest ? 'warning' : 'success';

    return (
        <Panel sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', color: COLORS.text }}>Detalhes do perfil</Typography>
                <IconButton size="small" onClick={onClose} aria-label="Fechar">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Typography sx={{ fontWeight: 600, fontSize: '1.2812rem', color: COLORS.text, mb: 1 }}>{profile.name}</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: COLORS.muted, mb: 1.25, wordBreak: 'break-all' }}>
                {profile.email}
            </Typography>
            <StatusChip label={`${roleLabel(profile)} • ${statusLabel}`} tone={chipTone} />

            <Divider sx={{ my: 3, borderColor: COLORS.border }} />

            <Typography sx={{ fontSize: '0.78rem', color: COLORS.muted, mb: 2 }}>Curso de graduação</Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.text, mb: 3 }}>
                {course ? `${course.label}${course.campusLabel ? ` — ${course.campusLabel}` : ''}` : 'Não informado'}
            </Typography>

            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: COLORS.text, mb: 2.5 }}>
                {sectionTitle}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 2.5 }}>
                <FieldLabel required>Papel a atribuir</FieldLabel>
                <StyledSelect value={role} onChange={setRole} options={options.roles} />
            </Box>

            {isTeacherRole && (
                <>
                    <Box sx={{ mb: 2 }}>
                        <FieldLabel required>Associar às disciplinas</FieldLabel>
                        <StyledSelect
                            value=""
                            onChange={(v) => v && setSubjects((s) => [...s, v])}
                            options={availableSubjects}
                            placeholder={availableSubjects.length ? 'Selecione uma disciplina' : 'Todas as disciplinas associadas'}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
                        {subjects.map((code) => {
                            const subject = options.subjects.find((s) => s.value === code);
                            return (
                                <Box
                                    key={code}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        bgcolor: COLORS.primarySoft,
                                        borderRadius: '8px',
                                        px: 1.5,
                                        py: 1,
                                    }}
                                >
                                    <CheckBoxOutlinedIcon sx={{ fontSize: 18, color: COLORS.primary }} />
                                    <Typography sx={{ flex: 1, fontSize: '0.8125rem', color: COLORS.primary }}>
                                        {subject?.name || code}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        aria-label={`Remover ${subject?.name || code}`}
                                        onClick={() => setSubjects((s) => s.filter((c) => c !== code))}
                                        sx={{ color: COLORS.primary }}
                                    >
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            );
                        })}
                    </Box>
                </>
            )}

            <PrimaryButton
                fullWidth={false}
                startIcon={submitIcon}
                loading={saving}
                onClick={() => onSubmit({ role, subjects: isTeacherRole ? subjects : [] })}
                sx={{ mt: isTeacherRole ? 0 : 0.5, height: 42, px: 2.5 }}
            >
                {submitLabel}
            </PrimaryButton>
        </Panel>
    );
}

// ---- Página Principal ----
export default function AdminProfiles() {
    const searchRef = useRef(null);
    useSearchShortcut(searchRef);
    const currentUser = loginService.getCurrentUser();

    const [query, setQuery] = useState('');
    // Filtros escolhidos nos selects (aplicados ao clicar em "Filtrar")
    const [roleDraft, setRoleDraft] = useState('');
    const [courseDraft, setCourseDraft] = useState('');
    const [filters, setFilters] = useState({ role: '', courseId: '' });

    const [profiles, setProfiles] = useState([]);
    const [options, setOptions] = useState({ roles: [], courses: [], subjects: [] });
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        getProfileOptions()
            .then((data) => {
                setOptions(data);
                // Pré-seleciona o curso do administrador logado (ou o primeiro curso)
                const initialCourse = data.courses.find((c) => c.value === currentUser?.course)?.value || '';
                setCourseDraft(initialCourse);
                setFilters((f) => ({ ...f, courseId: initialCourse }));
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await getProfiles({ q: query, role: filters.role, courseId: filters.courseId });
                if (!active) return;
                setProfiles(data);
                setSelectedId((prev) => (data.some((p) => p.id === prev) ? prev : null));
            } finally {
                if (active) setLoading(false);
            }
        }, 250);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [query, filters, reloadKey]);

    const selected = profiles.find((p) => p.id === selectedId);
    const teacherRequests = profiles.filter((p) => p.teacherRequest).length;

    const openProfile = (id) => {
        setFormError('');
        setSelectedId(id);
    };

    const handleAssign = async ({ role, subjects }) => {
        setFormError('');
        setFeedback('');
        if (role === 'professor' && subjects.length === 0) {
            setFormError('Associe ao menos uma disciplina ao professor.');
            return;
        }
        setSaving(true);
        try {
            await assignRole(selected.id, { role, subjects });
            setFeedback(`Permissões de ${selected.name} atualizadas.`);
            setReloadKey((k) => k + 1);
        } catch {
            setFormError('Não foi possível atualizar o perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteProfile(toDelete.id);
            setFeedback(`Perfil de ${toDelete.name} excluído.`);
            setToDelete(null);
            setReloadKey((k) => k + 1);
        } finally {
            setDeleting(false);
        }
    };

    const roleFilterOptions = options.roles;
    const courseFilterOptions = options.courses.map((c) => ({ value: c.value, label: c.label }));

    return (
        <AdminLayout active="perfis" breadcrumb="Perfis e permissões" title="Pessoas">
            {/* Barra de filtros */}
            <Box
                component="form"
                onSubmit={(e) => {
                    e.preventDefault();
                    setFilters({ role: roleDraft, courseId: courseDraft });
                }}
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'minmax(0, 2fr) minmax(0, 1.15fr) minmax(0, 1.4fr) auto' },
                    gap: 2,
                    alignItems: 'end',
                    mb: 3.5,
                }}
            >
                <Box sx={{ gridColumn: { sm: '1 / -1', lg: 'auto' } }}>
                    <SearchField inputRef={searchRef} value={query} onChange={setQuery} placeholder="Pesquisar nome ou e-mail" />
                </Box>
                <Box>
                    <FieldLabel>Papel</FieldLabel>
                    <StyledSelect
                        value={roleDraft}
                        onChange={setRoleDraft}
                        options={roleFilterOptions}
                        placeholder="Todos os papéis"
                        sx={{ '& .MuiSelect-select': { py: 1.6, px: 1.5 } }}
                    />
                </Box>
                <Box>
                    <FieldLabel>Curso de graduação</FieldLabel>
                    <StyledSelect
                        value={courseDraft}
                        onChange={setCourseDraft}
                        options={courseFilterOptions}
                        placeholder="Todos os cursos"
                        sx={{ '& .MuiSelect-select': { py: 1.6, px: 1.5 } }}
                    />
                </Box>
                <Button type="submit" variant="outlined" sx={{ ...outlinedButtonSx, height: 44 }}>
                    Filtrar
                </Button>
            </Box>

            {feedback && (
                <Alert severity="success" onClose={() => setFeedback('')} sx={{ mb: 3, borderRadius: 2 }}>
                    {feedback}
                </Alert>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: selected ? 'minmax(0, 1.8fr) minmax(320px, 1fr)' : '1fr' },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                {selected && (
                    <Box sx={{ order: { xs: 0, lg: 1 } }}>
                        <ProfileDetails
                            key={selected.id}
                            profile={selected}
                            options={options}
                            saving={saving}
                            error={formError}
                            onSubmit={handleAssign}
                            onClose={() => setSelectedId(null)}
                        />
                    </Box>
                )}

                <Panel sx={{ order: { xs: 1, lg: 0 }, minWidth: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            px: 2.5,
                            py: 2.5,
                        }}
                    >
                        <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', color: COLORS.text }}>
                            Perfis cadastrados
                        </Typography>
                        {teacherRequests > 0 && (
                            <StatusChip
                                label={`${teacherRequests} ${teacherRequests === 1 ? 'solicitação' : 'solicitações'} de professor`}
                                tone="warning"
                            />
                        )}
                    </Box>

                    <TableHead columns={['PESSOA / E-MAIL', 'PAPEL', 'AÇÕES']} template={GRID.sm} />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress size={28} sx={{ color: COLORS.primary }} />
                        </Box>
                    ) : profiles.length === 0 ? (
                        <Typography sx={{ p: 3, textAlign: 'center', fontSize: '0.875rem', color: COLORS.muted }}>
                            Nenhum perfil encontrado.
                        </Typography>
                    ) : (
                        profiles.map((p) => (
                            <ProfileRow
                                key={p.id}
                                profile={p}
                                selected={p.id === selectedId}
                                onOpen={() => openProfile(p.id)}
                                onDelete={() => setToDelete(p)}
                                canDelete={p.email !== currentUser?.email}
                            />
                        ))
                    )}

                    <Typography sx={{ px: 2, py: 3, fontSize: '0.75rem', color: COLORS.muted, display: profiles.length ? 'block' : 'none' }}>
                        {profiles.length} {profiles.length === 1 ? 'perfil' : 'perfis'} • 1–{profiles.length} de {profiles.length}
                    </Typography>
                </Panel>
            </Box>

            <ConfirmDialog
                open={!!toDelete}
                title="Excluir perfil"
                message={`Tem certeza que deseja excluir o perfil de ${toDelete?.name}? Esta ação não pode ser desfeita.`}
                loading={deleting}
                onConfirm={handleDelete}
                onClose={() => setToDelete(null)}
            />
        </AdminLayout>
    );
}
