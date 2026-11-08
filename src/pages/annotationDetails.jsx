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
                backgroundColor: '#f4f6f5',
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
                        <Typography sx={{ fontSize: 15, color: '#6b7280' }}>
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
                                            fontSize: 12.5,
                                            fontWeight: 700,
                                            color: '#0b6440',
                                            padding: '2px 8px',
                                            marginLeft: '-8px',
                                        }}
                                    >
                                        Voltar para tipos de anotações
                                    </Button>

                                    <Typography
                                        component="h1"
                                        sx={{
                                            fontSize: { xs: 22, md: 27 },
                                            fontWeight: 700,
                                            color: '#1f2d27',
                                            letterSpacing: '-0.5px',
                                        }}
                                    >
                                        {resource.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        {resource.typeLabel && (
                                            <Box
                                                sx={{
                                                    backgroundColor: '#e6f4ed',
                                                    color: '#0b6440',
                                                    fontSize: 11.5,
                                                    fontWeight: 700,
                                                    padding: '3px 10px',
                                                    borderRadius: '6px',
                                                }}
                                            >
                                                {resource.typeLabel}
                                            </Box>
                                        )}
                                        <Typography sx={{ fontSize: 13, color: '#6b7a71' }}>
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
                                            fontSize: 12.5,
                                            fontWeight: 600,
                                            color: '#0b6440',
                                            borderColor: '#cfe2d8',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '8px',
                                            height: '36px',
                                            '&:hover': {
                                                borderColor: '#0b6440',
                                                backgroundColor: '#eef6f2',
                                            },
                                        }}
                                    >
                                        Nova anotação
                                    </Button>

                                    {resource.href && (
                                        <PrimaryButton
                                            fullWidth={false}
                                            onClick={() => navigate(resource.href)}
                                            sx={{ height: '36px', fontSize: 12.5, whiteSpace: 'nowrap' }}
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
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #cfe2d8',
                                        borderRadius: '12px',
                                        padding: '18px 20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                    }}
                                >
                                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1f2d27' }}>
                                        Adicionar anotação em &ldquo;{resource.title}&rdquo;
                                    </Typography>

                                    <InputBase
                                        placeholder="Título da anotação"
                                        value={newNoteTitle}
                                        onChange={(e) => setNewNoteTitle(e.target.value)}
                                        sx={{
                                            border: '1px solid #dce5df',
                                            borderRadius: '8px',
                                            padding: '7px 12px',
                                            fontSize: 13,
                                            backgroundColor: '#fbfcfb',
                                        }}
                                    />

                                    <InputBase
                                        multiline
                                        minRows={3}
                                        placeholder="Escreva sua anotação..."
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                        sx={{
                                            border: '1px solid #dce5df',
                                            borderRadius: '8px',
                                            padding: '9px 12px',
                                            fontSize: 13,
                                            backgroundColor: '#fbfcfb',
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <Button
                                            onClick={() => setShowNewNoteForm(false)}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: 12.5,
                                                fontWeight: 600,
                                                color: '#5f6f66',
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <PrimaryButton
                                            fullWidth={false}
                                            onClick={handleSaveNewNote}
                                            sx={{ height: '34px', fontSize: 12.5 }}
                                        >
                                            Salvar anotação
                                        </PrimaryButton>
                                    </Box>
                                </Box>
                            )}

                            {/* Card listando todas as anotações deste título */}
                            <Box
                                sx={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2ebe5',
                                    borderRadius: '14px',
                                    padding: { xs: '18px 16px', md: '24px 26px' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                }}
                            >
                                <Typography component="h2" sx={{ fontSize: 16.5, fontWeight: 700, color: '#1f2d27' }}>
                                    Anotações salvas neste conteúdo ({resource.notes?.length || 0})
                                </Typography>

                                {!resource.notes || resource.notes.length === 0 ? (
                                    <Typography
                                        sx={{
                                            fontSize: 13.5,
                                            color: '#7a8a80',
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
                                                    border: '1px solid #e4ece7',
                                                    borderRadius: '10px',
                                                    padding: '16px 18px',
                                                    backgroundColor: '#fbfdfc',
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
                                                            fontSize: 14.5,
                                                            fontWeight: 700,
                                                            color: '#1f2d27',
                                                        }}
                                                    >
                                                        {note.title}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Typography sx={{ fontSize: 11.5, color: '#8a9990' }}>
                                                            {note.date}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            title="Excluir anotação"
                                                            sx={{
                                                                color: '#b42318',
                                                                padding: '4px',
                                                                '&:hover': { backgroundColor: '#fef2f2' },
                                                            }}
                                                        >
                                                            <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                <Typography
                                                    sx={{
                                                        fontSize: 13.5,
                                                        color: '#3f4f46',
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

