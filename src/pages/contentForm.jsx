import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, InputBase, Button, IconButton } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import Combobox from '../components/common/combobox';
import PrimaryButton from '../components/common/PrimaryButton';
import subjectService from '../services/subjectService';
import loginService from '../services/loginService';

const RESOURCE_TYPES = [
    { value: 'exercicio', label: 'Exercício' },
    { value: 'arquivo', label: 'Arquivo' },
    { value: 'link', label: 'Link' },
];

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function createEmptyQuestion(index = 1) {
    const number = String(index).padStart(2, '0');
    return {
        id: `q-${Date.now()}-${index}`,
        number,
        title: '',
        points: '',
        type: 'multiple_choice',
        statement: '',
        options: [
            { id: 'A', label: 'A. ' },
            { id: 'B', label: 'B. ' },
            { id: 'C', label: 'C. ' },
            { id: 'D', label: 'D. ' },
        ],
        correctAnswer: 'A',
    };
}

function createEmptyLink(index = 1) {
    return {
        id: `link-${Date.now()}-${index}`,
        kind: 'site',
        kindLabel: 'Artigo e guia',
        title: '',
        url: '',
        source: '',
        duration: '',
        description: '',
    };
}

function ContentForm() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const isEdit = Boolean(id);
    const currentUser = loginService.getCurrentUser();
    const userRole = String(currentUser?.role || '').toLowerCase();
    const isProfessor = userRole === 'professor';
    const authorName = currentUser?.name || '';

    const [subjectsList, setSubjectsList] = useState([]);
    const [title, setTitle] = useState('');
    const [subjectTag, setSubjectTag] = useState(searchParams.get('disciplina') || '');
    const [teacher, setTeacher] = useState('');
    const [resourceType, setResourceType] = useState('arquivo');

    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    const [questions, setQuestions] = useState(() => [createEmptyQuestion(1)]);
    const [links, setLinks] = useState(() => [createEmptyLink(1)]);

    // Campos comuns do rodapé (sem valores pré-setados)
    const [description, setDescription] = useState('');
    const [supportUrl, setSupportUrl] = useState('');
    const [citation, setCitation] = useState('');

    // Banner lateral de confirmação/status
    const [statusBanner, setStatusBanner] = useState({
        visible: false,
        code: '',
        submittedAt: '',
    });

    useEffect(() => {
        const loadData = async () => {
            const allSubs = await subjectService.getAllSubjects();
            setSubjectsList(allSubs);

            if (isEdit) {
                const existing = await subjectService.getContributionById(id);
                if (existing) {
                    setTitle(existing.title || '');
                    setSubjectTag(existing.subjectTag || '');
                    setTeacher(existing.teacher || '');
                    setResourceType(existing.resourceType || 'arquivo');
                    setDescription(existing.description || '');
                    setSupportUrl(existing.supportUrl || '');
                    setCitation(existing.citation || '');
                    if (existing.fileName) {
                        setUploadedFile({
                            name: existing.fileName,
                            size: existing.fileSize || '',
                            url: existing.fileUrl || null,
                        });
                    }
                    if (existing.questions?.length) {
                        setQuestions(existing.questions);
                    }
                    if (existing.links?.length) {
                        setLinks(existing.links);
                    }
                    if (existing.requestCode || existing.submittedAt) {
                        setStatusBanner({
                            visible: true,
                            code: existing.requestCode || '',
                            submittedAt: existing.submittedAt || '',
                        });
                    }
                }
            } else {
                const preselectedTag = searchParams.get('disciplina');
                if (preselectedTag) {
                    const matched = allSubs.find((s) => s.tag === preselectedTag);
                    if (matched) {
                        setSubjectTag(matched.tag);
                        setTeacher(matched.teacher);
                    }
                }
            }
        };
        loadData();
    }, [id, isEdit, searchParams]);

    const handleSubjectChange = (newTag) => {
        setSubjectTag(newTag);
        const found = subjectsList.find((s) => s.tag === newTag);
        if (found) {
            setTeacher(found.teacher);
        }
    };

    // Handlers de Upload / Drag-and-Drop de Arquivo
    const handleFileSelect = (file) => {
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setUploadedFile({
            name: file.name,
            size: formatFileSize(file.size),
            url: objectUrl,
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Handlers do construtor de Exercícios
    const handleAddQuestion = () => {
        setQuestions((prev) => [...prev, createEmptyQuestion(prev.length + 1)]);
    };

    const handleUpdateQuestion = (qId, patch) => {
        setQuestions((prev) =>
            prev.map((q, idx) =>
                q.id === qId ? { ...q, ...patch, number: String(idx + 1).padStart(2, '0') } : q
            )
        );
    };

    const handleUpdateOptionLabel = (qId, optId, text) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== qId) return q;
                const cleanText = text.replace(/^[A-D]\.\s*/, '');
                return {
                    ...q,
                    options: q.options.map((opt) =>
                        opt.id === optId ? { ...opt, label: `${optId}. ${cleanText}` } : opt
                    ),
                };
            })
        );
    };

    const handleRemoveQuestion = (qId) => {
        if (questions.length <= 1) return;
        setQuestions((prev) =>
            prev
                .filter((q) => q.id !== qId)
                .map((q, idx) => ({ ...q, number: String(idx + 1).padStart(2, '0') }))
        );
    };

    // Handlers do construtor de Links
    const handleAddLink = () => {
        setLinks((prev) => [...prev, createEmptyLink(prev.length + 1)]);
    };

    const handleUpdateLink = (linkId, patch) => {
        const kindLabels = {
            video: 'Vídeo-aula',
            site: 'Artigo e guia',
            simulador: 'Simulador interativo',
        };
        setLinks((prev) =>
            prev.map((item) => {
                if (item.id !== linkId) return item;
                const updated = { ...item, ...patch };
                if (patch.kind) {
                    updated.kindLabel = kindLabels[patch.kind] || 'Artigo e guia';
                }
                return updated;
            })
        );
    };

    const handleRemoveLink = (linkId) => {
        if (links.length <= 1) return;
        setLinks((prev) => prev.filter((item) => item.id !== linkId));
    };

    // Salvar / Enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        const saved = await subjectService.saveContribution({
            id: isEdit ? id : undefined,
            title,
            subjectTag,
            teacher,
            resourceType,
            fileName: uploadedFile?.name,
            fileSize: uploadedFile?.size,
            fileUrl: uploadedFile?.url,
            description,
            supportUrl,
            citation,
            questions,
            links,
        });

        setStatusBanner({
            visible: true,
            code: saved.requestCode,
            submittedAt: saved.submittedAt,
        });

        setTimeout(() => {
            navigate('/conteudos');
        }, 700);
    };

    const subjectOptions = subjectsList.map((s) => ({ value: s.tag, label: s.label }));

    const teacherOptions = [...new Set(subjectsList.map((s) => s.teacher))].map((t) => ({
        value: t,
        label: t,
    }));

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: 'Meus conteúdos', href: '/conteudos' },
        { label: isEdit ? 'Editar contribuição' : 'Adicionar conteúdo' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--c-bg)' }}>
            <SideBar
                defaultActive="conteudos"
                userName={authorName}
                userRole={isProfessor ? 'Professor' : 'Aluno'}
                userInitials={isProfessor ? 'AM' : 'MC'}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={breadcrumbs} />

                {/* Área principal rolável */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        padding: { xs: '20px 16px', md: '32px 28px' },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        '& > *': { flexShrink: 0 },
                    }}
                >
                    {/* Título principal */}
                    <Typography
                        component="h1"
                        sx={{
                            fontSize: { xs: '1.2812rem', md: '1.5rem' },
                            fontWeight: 700,
                            color: 'var(--c-text)',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Compartilhe o que você aprendeu.
                    </Typography>

                    {/* Subtítulo com badge de modo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '-4px' }}>
                        <Box
                            sx={{
                                backgroundColor: 'var(--c-primary-soft)',
                                color: 'var(--c-primary)',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                borderRadius: '6px',
                                padding: '3px 10px',
                            }}
                        >
                            {isEdit ? 'Modo edição • conteúdo próprio' : 'Novo envio • conteúdo autoral'}
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
                            {title || 'Sem título'} • {authorName}
                        </Typography>
                    </Box>

                    {/* Grid: Formulário (Esquerda) + Card de Status (Direita) */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1fr 290px' },
                            gap: '22px',
                            alignItems: 'start',
                        }}
                    >
                        {/* COLUNA ESQUERDA: Card Dados do Conteúdo */}
                        <Box
                            sx={{
                                backgroundColor: 'var(--c-surface)',
                                border: '1px solid var(--c-border)',
                                borderRadius: '14px',
                                padding: { xs: '20px 16px', md: '26px 28px' },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '18px',
                            }}
                        >
                            <Typography component="h2" sx={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                Dados do conteúdo
                            </Typography>

                            {/* Campo: Título */}
                            <Box>
                                <Typography sx={{ fontSize: '0.7188rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>
                                    Título *
                                </Typography>
                                <InputBase
                                    fullWidth
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Resumo — Limites e continuidade"
                                    sx={{
                                        border: '1px solid var(--c-border-strong)',
                                        borderRadius: '7px',
                                        padding: '7px 12px',
                                        fontSize: '0.8125rem',
                                        color: 'var(--c-text)',
                                        backgroundColor: 'var(--c-surface)',
                                    }}
                                />
                            </Box>

                            {/* Linha dupla: Disciplina + Professor */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
                                <Combobox
                                    label="Disciplina *"
                                    value={subjectTag}
                                    onChange={handleSubjectChange}
                                    options={subjectOptions}
                                    required
                                />
                                <Combobox
                                    label="Professor *"
                                    value={teacher}
                                    onChange={setTeacher}
                                    options={teacherOptions}
                                    required
                                />
                            </Box>

                            {/* Seletor: Tipo de recurso */}
                            <Box>
                                <Typography sx={{ fontSize: '0.7188rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '8px' }}>
                                    Tipo de recurso *
                                </Typography>
                                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {RESOURCE_TYPES.map((type) => {
                                        const selected = resourceType === type.value;
                                        return (
                                            <Button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setResourceType(type.value)}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem',
                                                    fontWeight: selected ? 700 : 500,
                                                    padding: '6px 16px',
                                                    borderRadius: '7px',
                                                    border: selected ? '1.5px solid var(--c-primary)' : '1px solid var(--c-border)',
                                                    backgroundColor: selected ? 'var(--c-primary-soft)' : 'var(--c-surface-alt)',
                                                    color: selected ? 'var(--c-primary)' : 'var(--c-text-muted)',
                                                    '&:hover': {
                                                        backgroundColor: selected ? 'var(--c-primary-soft-hover)' : 'var(--c-surface-muted)',
                                                    },
                                                }}
                                            >
                                                {type.label}
                                            </Button>
                                        );
                                    })}
                                </Box>
                            </Box>

                            {/* ÁREA DINÂMICA 1: ARQUIVO (Drag & Drop) */}
                            {resourceType === 'arquivo' && (
                                <Box
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        border: isDragging ? '1.5px dashed var(--c-primary)' : '1.5px dashed var(--c-border-strong)',
                                        borderRadius: '12px',
                                        backgroundColor: isDragging ? 'var(--c-primary-soft)' : 'var(--c-surface-alt)',
                                        padding: '24px 20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                    />

                                    <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: 'var(--c-primary)' }} />

                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--c-text)', marginTop: '4px', textAlign: 'center' }}>
                                        Arraste o arquivo ou selecione no computador
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.6875rem', color: 'var(--c-text-muted)', marginBottom: uploadedFile ? '12px' : 0 }}>
                                        PDF, DOCX ou imagem • Até 20 MB
                                    </Typography>

                                    {uploadedFile && (
                                        <Box
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                width: '100%',
                                                backgroundColor: 'var(--c-surface)',
                                                border: '1px solid var(--c-border)',
                                                borderRadius: '8px',
                                                padding: '10px 14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '12px',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                <DescriptionOutlinedIcon sx={{ color: 'var(--c-primary)', fontSize: 20, flexShrink: 0 }} />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: '0.7812rem', fontWeight: 700, color: 'var(--c-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {uploadedFile.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.6562rem', color: 'var(--c-text-muted)' }}>
                                                        {uploadedFile.size} • Upload concluído
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <IconButton
                                                size="small"
                                                onClick={() => setUploadedFile(null)}
                                                aria-label="Remover arquivo"
                                                sx={{ color: 'var(--c-text-muted)' }}
                                            >
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {/* ÁREA DINÂMICA 2: EXERCÍCIO (Perguntas e Opções para Correção Automática) */}
                            {resourceType === 'exercicio' && (
                                <Box
                                    sx={{
                                        border: '1px solid var(--c-border)',
                                        borderRadius: '12px',
                                        backgroundColor: 'var(--c-surface-alt)',
                                        padding: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.8438rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                                Questões para correção automática
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.7188rem', color: 'var(--c-text-muted)' }}>
                                                Configure perguntas de múltipla escolha ou de resultado numérico direto.
                                            </Typography>
                                        </Box>

                                        <Button
                                            type="button"
                                            size="small"
                                            onClick={handleAddQuestion}
                                            startIcon={<AddIcon fontSize="small" />}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                color: 'var(--c-primary)',
                                                backgroundColor: 'var(--c-primary-soft)',
                                                borderRadius: '7px',
                                                padding: '5px 12px',
                                                '&:hover': { backgroundColor: 'var(--c-primary-soft-hover)' },
                                            }}
                                        >
                                            Adicionar questão
                                        </Button>
                                    </Box>

                                    {questions.map((q) => (
                                        <Box
                                            key={q.id}
                                            sx={{
                                                backgroundColor: 'var(--c-surface)',
                                                border: '1px solid var(--c-border)',
                                                borderRadius: '10px',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--c-primary)' }}>
                                                    Questão {q.number}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Button
                                                        type="button"
                                                        size="small"
                                                        onClick={() => handleUpdateQuestion(q.id, { type: 'multiple_choice', correctAnswer: 'A' })}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.6875rem',
                                                            fontWeight: q.type === 'multiple_choice' ? 700 : 500,
                                                            padding: '3px 10px',
                                                            borderRadius: '6px',
                                                            backgroundColor: q.type === 'multiple_choice' ? 'var(--c-primary-soft)' : 'var(--c-surface-muted)',
                                                            color: q.type === 'multiple_choice' ? 'var(--c-primary)' : 'var(--c-text-muted)',
                                                        }}
                                                    >
                                                        Múltipla escolha
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="small"
                                                        onClick={() => handleUpdateQuestion(q.id, { type: 'direct_result', correctAnswer: '' })}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '0.6875rem',
                                                            fontWeight: q.type === 'direct_result' ? 700 : 500,
                                                            padding: '3px 10px',
                                                            borderRadius: '6px',
                                                            backgroundColor: q.type === 'direct_result' ? 'var(--c-primary-soft)' : 'var(--c-surface-muted)',
                                                            color: q.type === 'direct_result' ? 'var(--c-primary)' : 'var(--c-text-muted)',
                                                        }}
                                                    >
                                                        Resultado direto
                                                    </Button>

                                                    {questions.length > 1 && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveQuestion(q.id)}
                                                            sx={{ color: 'var(--c-danger)' }}
                                                        >
                                                            <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 130px' }, gap: '10px' }}>
                                                <InputBase
                                                    fullWidth
                                                    value={q.title}
                                                    onChange={(e) => handleUpdateQuestion(q.id, { title: e.target.value })}
                                                    placeholder="Título da questão (ex: Substituição direta)"
                                                    sx={{
                                                        border: '1px solid var(--c-border-strong)',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: '0.7812rem',
                                                    }}
                                                />
                                                <InputBase
                                                    fullWidth
                                                    value={q.points}
                                                    onChange={(e) => handleUpdateQuestion(q.id, { points: e.target.value })}
                                                    placeholder="Ex: 2,0 pontos"
                                                    sx={{
                                                        border: '1px solid var(--c-border-strong)',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: '0.7812rem',
                                                    }}
                                                />
                                            </Box>

                                            <InputBase
                                                fullWidth
                                                value={q.statement}
                                                onChange={(e) => handleUpdateQuestion(q.id, { statement: e.target.value })}
                                                placeholder="Enunciado da pergunta (ex: Qual é o valor de lim x → 2 de 3x² - 2x + 1?)"
                                                sx={{
                                                    border: '1px solid var(--c-border-strong)',
                                                    borderRadius: '7px',
                                                    padding: '6px 10px',
                                                    fontSize: '0.7812rem',
                                                }}
                                            />

                                            {q.type === 'multiple_choice' ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--c-text-secondary)' }}>
                                                        Alternativas (clique no círculo para marcar a correta):
                                                    </Typography>
                                                    {q.options.map((opt) => {
                                                        const isCorrect = q.correctAnswer === opt.id;
                                                        return (
                                                            <Box
                                                                key={opt.id}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    border: isCorrect ? '1.5px solid var(--c-primary)' : '1px solid var(--c-border)',
                                                                    backgroundColor: isCorrect ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                                                                    borderRadius: '7px',
                                                                    padding: '4px 10px',
                                                                }}
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleUpdateQuestion(q.id, { correctAnswer: opt.id })}
                                                                    sx={{ padding: '2px', color: isCorrect ? 'var(--c-primary)' : 'var(--c-text-subtle)' }}
                                                                >
                                                                    {isCorrect ? (
                                                                        <RadioButtonCheckedIcon sx={{ fontSize: 17 }} />
                                                                    ) : (
                                                                        <RadioButtonUncheckedIcon sx={{ fontSize: 17 }} />
                                                                    )}
                                                                </IconButton>
                                                                <InputBase
                                                                    fullWidth
                                                                    value={opt.label}
                                                                    onChange={(e) => handleUpdateOptionLabel(q.id, opt.id, e.target.value)}
                                                                    placeholder={`Alternativa ${opt.id}`}
                                                                    sx={{ fontSize: '0.7812rem' }}
                                                                />
                                                                {isCorrect && (
                                                                    <Typography sx={{ fontSize: '0.6562rem', fontWeight: 700, color: 'var(--c-primary)', whiteSpace: 'nowrap' }}>
                                                                        Gabarito ✓
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--c-primary)', marginBottom: '4px' }}>
                                                        Resultado exato esperado (Gabarito numérico):
                                                    </Typography>
                                                    <InputBase
                                                        fullWidth
                                                        value={q.correctAnswer}
                                                        onChange={(e) =>
                                                            handleUpdateQuestion(q.id, {
                                                                correctAnswer: e.target.value.replace(/[^0-9+\-*/.,^()=\s]/g, ''),
                                                            })
                                                        }
                                                        placeholder="Ex: 6"
                                                        sx={{
                                                            border: '1.5px solid var(--c-primary)',
                                                            backgroundColor: 'var(--c-primary-soft)',
                                                            borderRadius: '7px',
                                                            padding: '6px 10px',
                                                            fontSize: '0.7812rem',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* ÁREA DINÂMICA 3: LINKS (Vários Links com Título e Descrição) */}
                            {resourceType === 'link' && (
                                <Box
                                    sx={{
                                        border: '1px solid var(--c-border)',
                                        borderRadius: '12px',
                                        backgroundColor: 'var(--c-surface-alt)',
                                        padding: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.8438rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                                Links de estudo (vídeos, sites e simuladores)
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.7188rem', color: 'var(--c-text-muted)' }}>
                                                Adicione um ou mais links com títulos e descrições para compor a página do material.
                                            </Typography>
                                        </Box>

                                        <Button
                                            type="button"
                                            size="small"
                                            onClick={handleAddLink}
                                            startIcon={<AddIcon fontSize="small" />}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                color: 'var(--c-primary)',
                                                backgroundColor: 'var(--c-primary-soft)',
                                                borderRadius: '7px',
                                                padding: '5px 12px',
                                                '&:hover': { backgroundColor: 'var(--c-primary-soft-hover)' },
                                            }}
                                        >
                                            Adicionar link
                                        </Button>
                                    </Box>

                                    {links.map((item, idx) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                backgroundColor: 'var(--c-surface)',
                                                border: '1px solid var(--c-border)',
                                                borderRadius: '10px',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <Typography sx={{ fontSize: '0.7812rem', fontWeight: 700, color: 'var(--c-primary)' }}>
                                                    Link #{idx + 1}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {[
                                                        { value: 'video', label: 'Vídeo' },
                                                        { value: 'site', label: 'Site / Artigo' },
                                                        { value: 'simulador', label: 'Simulador' },
                                                    ].map((k) => (
                                                        <Button
                                                            key={k.value}
                                                            type="button"
                                                            size="small"
                                                            onClick={() => handleUpdateLink(item.id, { kind: k.value })}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: '0.6875rem',
                                                                fontWeight: item.kind === k.value ? 700 : 500,
                                                                padding: '2px 8px',
                                                                minWidth: 0,
                                                                borderRadius: '5px',
                                                                backgroundColor: item.kind === k.value ? 'var(--c-primary-soft)' : 'var(--c-surface-muted)',
                                                                color: item.kind === k.value ? 'var(--c-primary)' : 'var(--c-text-muted)',
                                                            }}
                                                        >
                                                            {k.label}
                                                        </Button>
                                                    ))}

                                                    {links.length > 1 && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveLink(item.id)}
                                                            sx={{ color: 'var(--c-danger)' }}
                                                        >
                                                            <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '10px' }}>
                                                <InputBase
                                                    fullWidth
                                                    value={item.title}
                                                    onChange={(e) => handleUpdateLink(item.id, { title: e.target.value })}
                                                    placeholder="Título do link (ex: Explicação visual de limites)"
                                                    sx={{
                                                        border: '1px solid var(--c-border-strong)',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: '0.7812rem',
                                                    }}
                                                />
                                                <InputBase
                                                    fullWidth
                                                    value={item.url}
                                                    onChange={(e) => handleUpdateLink(item.id, { url: e.target.value })}
                                                    placeholder="URL (ex: https://www.youtube.com/watch?v=...)"
                                                    sx={{
                                                        border: '1px solid var(--c-border-strong)',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: '0.7812rem',
                                                    }}
                                                />
                                            </Box>

                                            <InputBase
                                                fullWidth
                                                multiline
                                                minRows={2}
                                                value={item.description}
                                                onChange={(e) => handleUpdateLink(item.id, { description: e.target.value })}
                                                placeholder="Descrição do que estudar neste link..."
                                                sx={{
                                                    border: '1px solid var(--c-border-strong)',
                                                    borderRadius: '7px',
                                                    padding: '6px 10px',
                                                    fontSize: '0.7812rem',
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Campo: Descrição Geral */}
                            <Box>
                                <Typography sx={{ fontSize: '0.7188rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>
                                    Descrição *
                                </Typography>
                                <InputBase
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descreva o conteúdo, tópicos abordados e orientações de estudo..."
                                    sx={{
                                        border: '1px solid var(--c-border-strong)',
                                        borderRadius: '7px',
                                        padding: '8px 12px',
                                        fontSize: '0.7812rem',
                                        color: 'var(--c-text)',
                                        backgroundColor: 'var(--c-surface)',
                                        alignItems: 'flex-start',
                                    }}
                                />
                            </Box>

                            {/* Linha dupla: URL de apoio + Citação / fonte */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.7188rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>
                                        URL de apoio (opcional)
                                    </Typography>
                                    <InputBase
                                        fullWidth
                                        value={supportUrl}
                                        onChange={(e) => setSupportUrl(e.target.value)}
                                        placeholder="https://www.geogebra.org/graphing"
                                        sx={{
                                            border: '1px solid var(--c-border-strong)',
                                            borderRadius: '7px',
                                            padding: '7px 12px',
                                            fontSize: '0.7812rem',
                                            color: 'var(--c-text)',
                                            backgroundColor: 'var(--c-surface)',
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography sx={{ fontSize: '0.7188rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>
                                        Citação / fonte (quando aplicável)
                                    </Typography>
                                    <InputBase
                                        fullWidth
                                        value={citation}
                                        onChange={(e) => setCitation(e.target.value)}
                                        placeholder={`Material autoral de ${authorName}`}
                                        sx={{
                                            border: '1px solid var(--c-border-strong)',
                                            borderRadius: '7px',
                                            padding: '7px 12px',
                                            fontSize: '0.7812rem',
                                            color: 'var(--c-text)',
                                            backgroundColor: 'var(--c-surface)',
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Rodapé de Ações */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => navigate('/conteudos')}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.7812rem',
                                        color: 'var(--c-text)',
                                        borderColor: 'var(--c-border)',
                                        backgroundColor: 'var(--c-surface)',
                                        borderRadius: '7px',
                                        padding: '7px 18px',
                                    }}
                                >
                                    {isEdit ? 'Cancelar edição' : 'Cancelar'}
                                </Button>

                                <PrimaryButton
                                    type="submit"
                                    fullWidth={false}
                                    startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
                                    sx={{ height: '38px', fontSize: '0.7812rem' }}
                                >
                                    {isProfessor ? 'Publicar conteúdo' : 'Enviar para aprovação'}
                                </PrimaryButton>
                            </Box>
                        </Box>

                        {/* COLUNA DIREITA: Card de Aviso de Aprovação / Publicação */}
                        {statusBanner.visible && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    backgroundColor: 'var(--c-primary-soft)',
                                    border: '1px solid var(--c-primary-border)',
                                    borderRadius: '12px',
                                    padding: '16px 18px',
                                }}
                            >
                                <CheckCircleOutlinedIcon sx={{ color: 'var(--c-primary)', fontSize: 20, marginTop: '1px', flexShrink: 0 }} />
                                <Box>
                                    <Typography sx={{ fontSize: '0.7812rem', fontWeight: 700, color: 'var(--c-primary)' }}>
                                        {isProfessor
                                            ? 'Publicação imediata habilitada'
                                            : 'Pedido encaminhado ao administrador'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.7188rem', color: 'var(--c-primary)', marginTop: '4px', lineHeight: 1.45 }}>
                                        {isProfessor
                                            ? 'Com perfil Professor, seu material é publicado diretamente no acervo sem fila de espera.'
                                            : `${statusBanner.code} • Enviado em ${statusBanner.submittedAt}. Seu conteúdo foi recebido e aguarda aprovação.`}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ContentForm;

