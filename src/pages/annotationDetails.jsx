import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton, InputBase } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import PrimaryButton from '../components/common/PrimaryButton';
import subjectService from '../services/subjectService';
import loginService from '../services/loginService';

/**
 * 2ª Página de Anotações (`/anotacoes/:id`):
 * Exibe o título do conteúdo selecionado e todas as anotações vinculadas a ele.
 */
function AnnotationDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [showNewNoteForm, setShowNewNoteForm] = useState(false);

    const currentUser = loginService.getCurrentUser();

    useEffect(() => {
        let isMounted = true;
        const loadResourceNotes = async () => {
            if (!id) return;
            setLoading(true);
            const data = await subjectService.getAnnotatedResourceById(id);
            if (isMounted) {
                setResource(data);
                setLoading(false);
            }
        };
        loadResourceNotes();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleDeleteNote = async (noteId) => {
        if (!resource) return;
        const updatedNotes = await subjectService.deleteNote(resource.id, noteId);
        setResource((prev) => (prev ? { ...prev, notes: updatedNotes } : null));
    };

    const handleSaveNewNote = async () => {
        if (!resource || (!newNoteTitle.trim() && !newNoteContent.trim())) return;
        const updatedNotes = await subjectService.saveNote(resource.id, {
            title: newNoteTitle.trim(),
            content: newNoteContent.trim(),
        });
        setResource((prev) => (prev ? { ...prev, notes: updatedNotes } : null));
        setNewNoteTitle('');
        setNewNoteContent('');
        setShowNewNoteForm(false);
    };

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: 'Anotações', href: '/anotacoes' },
        { label: resource?.title || '' },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: 'var(--c-bg)',
            }}
        >
            <SideBar
                defaultActive="anotacoes"
                userName={currentUser?.name}
                userRole={currentUser?.role}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={breadcrumbs} />

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        padding: { xs: '20px 16px', md: '32px 28px' },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '22px',
                        '& > *': { flexShrink: 0 },
                    }}
                >
                    {!loading && !resource && (
                        <Typography sx={{ fontSize: '0.9375rem', color: 'var(--c-text-muted)' }}>
                            Conteúdo ou anotações não encontradas.
                        </Typography>
                    )}

                    {resource && (
                        <>
                            {/* Topo com botão voltar + título do conteúdo + link para abrir o material */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: 'space-between',
                                    gap: '14px',
                                }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <Button
                                        onClick={() => navigate('/anotacoes')}
                                        startIcon={<ArrowBackIcon sx={{ fontSize: '16px !important' }} />}
                                        sx={{
                                            alignSelf: 'flex-start',
                                            textTransform: 'none',
                                            fontSize: '0.7812rem',
                                            fontWeight: 700,
                                            color: 'var(--c-primary)',
                                            padding: '2px 8px',
                                            marginLeft: '-8px',
                                        }}
                                    >
                                        Voltar para tipos de anotações
                                    </Button>

                                    <Typography
                                        component="h1"
                                        sx={{
                                            fontSize: { xs: '1.1875rem', md: '1.4375rem' },
                                            fontWeight: 700,
                                            color: 'var(--c-text)',
                                            letterSpacing: '-0.5px',
                                        }}
                                    >
                                        {resource.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        {resource.typeLabel && (
                                            <Box
                                                sx={{
                                                    backgroundColor: 'var(--c-primary-soft)',
                                                    color: 'var(--c-primary)',
                                                    fontSize: '0.7188rem',
                                                    fontWeight: 700,
                                                    padding: '3px 10px',
                                                    borderRadius: '6px',
                                                }}
                                            >
                                                {resource.typeLabel}
                                            </Box>
                                        )}
                                        <Typography sx={{ fontSize: '0.8125rem', color: 'var(--c-text-muted)' }}>
                                            {[resource.subjectName, resource.teacher].filter(Boolean).join(' • ')}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowNewNoteForm((v) => !v)}
                                        startIcon={<AddIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '0.7812rem',
                                            fontWeight: 600,
                                            color: 'var(--c-primary)',
                                            borderColor: 'var(--c-primary-border)',
                                            backgroundColor: 'var(--c-surface)',
                                            borderRadius: '8px',
                                            height: '36px',
                                            '&:hover': {
                                                borderColor: 'var(--c-primary)',
                                                backgroundColor: 'var(--c-primary-soft)',
                                            },
                                        }}
                                    >
                                        Nova anotação
                                    </Button>

                                    {resource.href && (
                                        <PrimaryButton
                                            fullWidth={false}
                                            onClick={() => navigate(resource.href)}
                                            sx={{ height: '36px', fontSize: '0.7812rem', whiteSpace: 'nowrap' }}
                                        >
                                            Abrir conteúdo →
                                        </PrimaryButton>
                                    )}
                                </Box>
                            </Box>

                            {/* Formulário rápido para adicionar anotação neste título */}
                            {showNewNoteForm && (
                                <Box
                                    sx={{
                                        backgroundColor: 'var(--c-surface)',
                                        border: '1px solid var(--c-primary-border)',
                                        borderRadius: '12px',
                                        padding: '18px 20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                    }}
                                >
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                        Adicionar anotação em &ldquo;{resource.title}&rdquo;
                                    </Typography>

                                    <InputBase
                                        placeholder="Título da anotação"
                                        value={newNoteTitle}
                                        onChange={(e) => setNewNoteTitle(e.target.value)}
                                        sx={{
                                            border: '1px solid var(--c-border)',
                                            borderRadius: '8px',
                                            padding: '7px 12px',
                                            fontSize: '0.8125rem',
                                            backgroundColor: 'var(--c-surface-alt)',
                                        }}
                                    />

                                    <InputBase
                                        multiline
                                        minRows={3}
                                        placeholder="Escreva sua anotação..."
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                        sx={{
                                            border: '1px solid var(--c-border)',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            fontSize: '0.8125rem',
                                            backgroundColor: 'var(--c-surface-alt)',
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <Button
                                            onClick={() => setShowNewNoteForm(false)}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: '0.7812rem',
                                                fontWeight: 600,
                                                color: 'var(--c-text-secondary)',
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <PrimaryButton
                                            fullWidth={false}
                                            onClick={handleSaveNewNote}
                                            sx={{ height: '34px', fontSize: '0.7812rem' }}
                                        >
                                            Salvar anotação
                                        </PrimaryButton>
                                    </Box>
                                </Box>
                            )}

                            {/* Card listando todas as anotações deste título */}
                            <Box
                                sx={{
                                    backgroundColor: 'var(--c-surface)',
                                    border: '1px solid var(--c-border)',
                                    borderRadius: '14px',
                                    padding: { xs: '18px 16px', md: '24px 26px' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <Typography component="h2" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                    Anotações salvas neste conteúdo ({resource.notes?.length || 0})
                                </Typography>

                                {!resource.notes || resource.notes.length === 0 ? (
                                    <Typography
                                        sx={{
                                            fontSize: '0.8438rem',
                                            color: 'var(--c-text-muted)',
                                            textAlign: 'center',
                                            padding: '24px 0',
                                        }}
                                    >
                                        Nenhuma anotação registrada para este título ainda.
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {resource.notes.map((note) => (
                                            <Box
                                                key={note.id}
                                                sx={{
                                                    border: '1px solid var(--c-border)',
                                                    borderRadius: '10px',
                                                    padding: '16px 18px',
                                                    backgroundColor: 'var(--c-surface-alt)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '10px',
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: '0.9062rem',
                                                            fontWeight: 700,
                                                            color: 'var(--c-text)',
                                                        }}
                                                    >
                                                        {note.title}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Typography sx={{ fontSize: '0.7188rem', color: 'var(--c-text-muted)' }}>
                                                            {note.date}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            title="Excluir anotação"
                                                            sx={{
                                                                color: 'var(--c-danger)',
                                                                padding: '4px',
                                                                '&:hover': { backgroundColor: 'var(--c-danger-soft)' },
                                                            }}
                                                        >
                                                            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                <Typography
                                                    sx={{
                                                        fontSize: '0.8438rem',
                                                        color: 'var(--c-text-secondary)',
                                                        lineHeight: 1.55,
                                                        whiteSpace: 'pre-wrap',
                                                    }}
                                                >
                                                    {note.content}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default AnnotationDetails;

