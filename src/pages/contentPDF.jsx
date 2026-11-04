import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    InputBase,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckIcon from '@mui/icons-material/Check';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import subjectService from '../services/subjectService';
import loginService from '../services/loginService';
import samplePdf from '../assets/StradowskiMadeyski24FSE.pdf';

const DEFAULT_NOTES = [
    {
        id: '1',
        title: 'Revisar a questão 02',
        content: 'Antes de substituir, fatorar x² - 9 = (x - 3)(x + 3). O limite é 6.',
        date: '20 out. 2026',
    },
    {
        id: '2',
        title: 'Condição de continuidade',
        content: 'Lembrar que f(a) precisa estar definida e lim_{x->a} f(x) precisa ser igual a f(a).',
        date: '19 out. 2026',
    },
];


function ContentPDF() {
    const { id } = useParams();
    const navigate = useNavigate();
    const resourceId = id || 'CAL1001-1';

    // Usuário atual para isolamento das anotações
    const currentUser = loginService.getCurrentUser() || {
        email: 'conta@edu.udesc.br',
        name: 'Nome Aluno',
        role: 'Aluno',
    };

    // Dados do recurso / disciplina
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado do visualizador de PDF
    const [viewMode, setViewMode] = useState('preview'); // 'preview' (folha A4) ou 'pdf' (iframe do PDF real)
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = resource?.pages || 4;
    const [zoom, setZoom] = useState(100);

    // Estado das anotações
    const [noteTab, setNoteTab] = useState('nova'); // 'nova' | 'salvas'
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [notesList, setNotesList] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const contentInputRef = useRef(null);

    // Carregar dados do recurso
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            const data = await subjectService.getResourceById(resourceId);
            if (isMounted) {
                setResource(data);
                setLoading(false);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [resourceId]);

    // Chave do localStorage isolada por usuário e recurso
    const storageKey = `udesc_notes_${currentUser.email}_${resourceId}`;

    // Carregar anotações salvas do usuário atual
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                setNotesList(Array.isArray(parsed) ? parsed : []);
            } else {
                // Semente inicial para simular dados já existentes no mock
                localStorage.setItem(storageKey, JSON.stringify(DEFAULT_NOTES));
                setNotesList(DEFAULT_NOTES);
            }
        } catch {
            setNotesList(DEFAULT_NOTES);
        }
    }, [storageKey]);

    // Salvar anotação
    const handleSaveNote = () => {
        if (!noteTitle.trim()) {
            setSnackbar({ open: true, message: 'Informe o título da nota.', severity: 'warning' });
            return;
        }

        const newNote = {
            id: String(Date.now()),
            title: noteTitle.trim(),
            content: noteContent.trim(),
            date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
        };

        const updated = [newNote, ...notesList.filter((n) => n.title !== newNote.title)];
        setNotesList(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (err) {
            console.error('Falha ao salvar anotação', err);
        }

        setSnackbar({ open: true, message: 'Anotação salva com sucesso!', severity: 'success' });
        setNoteTab('salvas');
    };

    // Excluir anotação
    const handleDeleteNote = (noteId, e) => {
        e.stopPropagation();
        const updated = notesList.filter((n) => n.id !== noteId);
        setNotesList(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (err) {
            console.error(err);
        }
        setSnackbar({ open: true, message: 'Anotação excluída.', severity: 'info' });
    };

    const handleLoadNote = (note) => {
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setNoteTab('nova');
    };

    const handleApplyFormat = (syntax) => {
        if (!contentInputRef.current) return;
        const textarea = contentInputRef.current;
        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const selected = noteContent.substring(start, end);

        let replacement = '';
        if (syntax === 'bold') {
            replacement = `**${selected || 'texto'}**`;
        } else if (syntax === 'italic') {
            replacement = `*${selected || 'texto'}*`;
        } else if (syntax === 'list') {
            replacement = `\n• ${selected || 'item'}`;
        }

        const newText = noteContent.substring(0, start) + replacement + noteContent.substring(end);
        setNoteContent(newText);
    };

    const fileName = resource
        ? `${resource.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)}.pdf`
        : 'prova_1_calculo_I.pdf';

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: resource?.subjectName || 'Cálculo I', href: `/disciplina/${resource?.subjectTag || 'CAL1001'}` },
        { label: resource?.typeLabel ? `${resource.typeLabel}s` : 'Provas anteriores' },
        { label: resource?.title ? resource.title.split('—')[0].trim() : 'Prova 1' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f5' }}>
            <SideBar defaultActive="anotacoes" />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={breadcrumbs} />

                {/* Área principal rolável */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        padding: { xs: '20px 16px', md: '28px 32px' },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        '& > *': { flexShrink: 0 },
                    }}
                >
                    {/* Linha de Título e Botão Baixar PDF */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: '16px' }}>
                        <Box>
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: 22, md: 28 },
                                    fontWeight: 700,
                                    color: '#1f2d27',
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1.25,
                                }}
                            >
                                {resource?.title || 'Prova 1 — Limites e continuidade'}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#6b7280', marginTop: '6px' }}>
                                {`${resource?.subjectName || 'Cálculo I'} • ${resource?.teacher || 'Profa. Ana Martins'} • Publicado em ${resource?.date || '19 out. 2026'}`}
                            </Typography>
                        </Box>

                        <Button
                            component="a"
                            href={samplePdf}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                            sx={{
                                backgroundColor: '#006b47',
                                '&:hover': { backgroundColor: '#005236' },
                                color: '#ffffff',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: 13,
                                borderRadius: '8px',
                                padding: '8px 18px',
                                boxShadow: 'none',
                                flexShrink: 0,
                            }}
                        >
                            Baixar PDF
                        </Button>
                    </Box>

                    {/* Chips / Metadados */}
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ backgroundColor: '#e9f4ee', color: '#006b47', fontSize: 11.5, fontWeight: 600, borderRadius: '6px', padding: '4px 10px' }}>
                            {resource?.typeLabel || 'Prova anterior'}
                        </Box>
                        <Box sx={{ backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: 11.5, fontWeight: 500, borderRadius: '6px', padding: '4px 10px' }}>
                            {`PDF • 1,2 MB • ${totalPages} páginas`}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
                            gap: '20px',
                            alignItems: 'start',
                        }}
                    >
                        {/* COLUNA ESQUERDA: Box do Visualizador de PDF */}
                        <Box
                            sx={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Barra Superior do PDF */}
                            <Box
                                sx={{
                                    padding: '10px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid #e5e7eb',
                                    backgroundColor: '#ffffff',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                }}
                            >
                                <Typography sx={{ fontSize: 12.5, color: '#4b5563', fontFamily: 'monospace' }}>
                                    {fileName}
                                </Typography>
                            </Box>

                            {/* Conteúdo do Visualizador */}
                            <Box
                                sx={{
                                    height: '740px',
                                    overflowY: 'auto',
                                    backgroundColor: '#eef1f0',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: viewMode === 'preview' ? '28px 16px' : 0,
                                }}
                            >
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <iframe
                                        src={`${samplePdf}#page=${currentPage}`}
                                        title="PDF Original"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none' }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* COLUNA DIREITA: Minhas Anotações */}
                        <Box
                            sx={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                            }}
                        >
                            {/* Cabeçalho do Card de Anotações */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <EditNoteOutlinedIcon sx={{ color: '#006b47', fontSize: 22 }} />
                                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1f2d27' }}>
                                    Minhas anotações
                                </Typography>
                            </Box>

                            {/* Abas: Nova anotação | Salvas (N) */}
                            <Tabs
                                value={noteTab}
                                onChange={(_, val) => setNoteTab(val)}
                                sx={{
                                    minHeight: 34,
                                    borderBottom: '1px solid #e5e7eb',
                                    '& .MuiTabs-indicator': { backgroundColor: '#006b47' },
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        minHeight: 34,
                                        minWidth: 0,
                                        padding: '4px 0',
                                        marginRight: '20px',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: '#6b7280',
                                    },
                                    '& .MuiTab-root.Mui-selected': {
                                        color: '#006b47',
                                        fontWeight: 700,
                                    },
                                }}
                            >
                                <Tab value="nova" label="Nova anotação" disableRipple />
                                <Tab value="salvas" label={`Salvas (${notesList.length})`} disableRipple />
                            </Tabs>

                            {/* Conteúdo da Aba: Nova Anotação */}
                            {noteTab === 'nova' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                            Título da nota
                                        </Typography>
                                        <InputBase
                                            fullWidth
                                            value={noteTitle}
                                            onChange={(e) => setNoteTitle(e.target.value)}
                                            placeholder="Ex: Revisar a questão 02"
                                            sx={{
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                padding: '6px 10px',
                                                fontSize: 12.5,
                                                backgroundColor: '#ffffff',
                                            }}
                                        />
                                    </Box>

                                    {/* Editor de anotação com barra de ferramentas */}
                                    <Box
                                        sx={{
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        {/* Barra de Formatação */}
                                        <Box
                                            sx={{
                                                backgroundColor: '#f9fafb',
                                                borderBottom: '1px solid #e5e7eb',
                                                padding: '4px 8px',
                                                display: 'flex',
                                                gap: '6px',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Tooltip title="Negrito">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleApplyFormat('bold')}
                                                    sx={{ padding: '3px', borderRadius: '4px' }}
                                                >
                                                    <FormatBoldIcon sx={{ fontSize: 15, color: '#4b5563' }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Itálico">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleApplyFormat('italic')}
                                                    sx={{ padding: '3px', borderRadius: '4px' }}
                                                >
                                                    <FormatItalicIcon sx={{ fontSize: 15, color: '#4b5563' }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Lista">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleApplyFormat('list')}
                                                    sx={{ padding: '3px', borderRadius: '4px' }}
                                                >
                                                    <FormatListBulletedIcon sx={{ fontSize: 15, color: '#4b5563' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        {/* Área de Texto */}
                                        <InputBase
                                            multiline
                                            minRows={8}
                                            inputRef={contentInputRef}
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            placeholder="Digite sua anotação..."
                                            sx={{
                                                padding: '10px 12px',
                                                fontSize: 12,
                                                color: '#374151',
                                                lineHeight: 1.5,
                                                alignItems: 'flex-start',
                                            }}
                                        />
                                    </Box>

                                    {/* Botão Salvar Anotação */}
                                    <Button
                                        variant="contained"
                                        onClick={handleSaveNote}
                                        startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
                                        sx={{
                                            backgroundColor: '#006b47',
                                            '&:hover': { backgroundColor: '#005236' },
                                            color: '#ffffff',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: 12.5,
                                            borderRadius: '6px',
                                            padding: '8px 14px',
                                            boxShadow: 'none',
                                            marginTop: '4px',
                                        }}
                                    >
                                        Salvar anotação
                                    </Button>
                                </Box>
                            )}

                            {/* Conteúdo da Aba: Anotações Salvas */}
                            {noteTab === 'salvas' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                                    {notesList.length === 0 ? (
                                        <Typography sx={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
                                            Nenhuma anotação salva ainda.
                                        </Typography>
                                    ) : (
                                        notesList.map((item) => (
                                            <Box
                                                key={item.id}
                                                onClick={() => handleLoadNote(item)}
                                                sx={{
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    backgroundColor: '#fafbfc',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    '&:hover': {
                                                        borderColor: '#006b47',
                                                        backgroundColor: '#f4f9f6',
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1f2d27' }}>
                                                        {item.title}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleDeleteNote(item.id, e)}
                                                        sx={{ padding: '2px', color: '#9ca3af', '&:hover': { color: '#dc2626' } }}
                                                    >
                                                        <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Box>

                                                <Typography
                                                    sx={{
                                                        fontSize: 11.5,
                                                        color: '#4b5563',
                                                        marginTop: '4px',
                                                        lineHeight: 1.4,
                                                        whiteSpace: 'pre-wrap',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {item.content}
                                                </Typography>

                                                <Typography sx={{ fontSize: 10, color: '#9ca3af', marginTop: '6px' }}>
                                                    {item.date}
                                                </Typography>
                                            </Box>
                                        ))
                                    )}

                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => {
                                            setNoteTitle('');
                                            setNoteContent('');
                                            setNoteTab('nova');
                                        }}
                                        sx={{ textTransform: 'none', fontSize: 11.5, color: '#006b47', fontWeight: 600, marginTop: '4px' }}
                                    >
                                        + Criar outra nota
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Notificação Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%', fontSize: 12 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default ContentPDF;