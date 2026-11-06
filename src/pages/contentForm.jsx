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

const DEFAULT_QUESTIONS = [
    {
        id: 'q-1',
        number: '01',
        title: 'Substituição direta',
        points: '2,0 pontos',
        type: 'multiple_choice',
        statement: 'Qual é o valor de lim x → 2 de (3x² − 2x + 1)?',
        options: [
            { id: 'A', label: 'A. 5' },
            { id: 'B', label: 'B. 9' },
            { id: 'C', label: 'C. 11' },
            { id: 'D', label: 'D. O limite não existe' },
        ],
        correctAnswer: 'B',
    },
    {
        id: 'q-2',
        number: '02',
        title: 'Resolva a indeterminação',
        points: '4,0 pontos',
        type: 'direct_result',
        statement: 'Calcule o valor numérico exato de lim x → 3 de (x² − 9) / (x − 3).',
        placeholder: 'Digite apenas o resultado numérico',
        correctAnswer: '6',
    },
];

const DEFAULT_LINKS = [
    {
        id: 'link-1',
        kind: 'video',
        kindLabel: 'Vídeo-aula',
        title: 'Limites na prática — Explicação visual passo a passo',
        url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
        source: 'YouTube • Canal Acadêmico UDESC',
        duration: '18 min',
        description: 'Aula em vídeo demonstrando a intuição geométrica e resolução comentada de exemplos.',
    },
    {
        id: 'link-2',
        kind: 'simulador',
        kindLabel: 'Simulador interativo',
        title: 'Laboratório interativo: explorando limites',
        url: 'https://www.geogebra.org/m/r5ef2z5r',
        source: 'GeoGebra Academy',
        duration: 'Interativo',
        description: 'Manipule parâmetros em tempo real e visualize gráficos dinamicamente no navegador.',
    },
];

function formatFileSize(bytes) {
    if (!bytes) return '842 KB';
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function ContentForm() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const isEdit = Boolean(id);
    const currentUser = loginService.getCurrentUser();
    const userRole = String(currentUser?.role || 'aluno').toLowerCase();
    const isProfessor = userRole === 'professor';
    const authorName = currentUser?.name || (isProfessor ? 'Profa. Ana Martins' : 'Mariana Costa');

    const [subjectsList, setSubjectsList] = useState([]);
    const [title, setTitle] = useState('Resumo — Limites e continuidade');
    const [subjectTag, setSubjectTag] = useState(searchParams.get('disciplina') || 'CAL1001');
    const [teacher, setTeacher] = useState('Profa. Ana Martins');
    const [resourceType, setResourceType] = useState('arquivo');

    // Estado para tipo Arquivo (Drag & Drop)
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState({
        name: 'resumo_limites_mariana.pdf',
        size: '842 KB',
        url: null,
    });

    // Estado para tipo Exercício (questões para correção automática)
    const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);

    // Estado para tipo Link (múltiplos links com título e descrição)
    const [links, setLinks] = useState(DEFAULT_LINKS);

    // Campos comuns do rodapé
    const [description, setDescription] = useState(
        'Resumo autoral sobre limites, limites laterais e continuidade, com exemplos resolvidos para revisão da Prova 1.'
    );
    const [supportUrl, setSupportUrl] = useState('https://www.geogebra.org/graphing');
    const [citation, setCitation] = useState(`Material autoral de ${authorName}`);

    // Banner lateral de confirmação/status
    const [statusBanner, setStatusBanner] = useState({
        visible: true,
        code: 'SOL-024',
        submittedAt: '20 out. 2026, às 14h20',
    });

    useEffect(() => {
        const loadData = async () => {
            const allSubs = await subjectService.getAllSubjects();
            setSubjectsList(allSubs);

            if (isEdit) {
                const existing = await subjectService.getContributionById(id);
                if (existing) {
                    setTitle(existing.title || '');
                    setSubjectTag(existing.subjectTag || 'CAL1001');
                    setTeacher(existing.teacher || 'Profa. Ana Martins');
                    setResourceType(existing.resourceType || 'arquivo');
                    setDescription(existing.description || '');
                    setSupportUrl(existing.supportUrl || '');
                    setCitation(existing.citation || '');
                    if (existing.fileName) {
                        setUploadedFile({
                            name: existing.fileName,
                            size: existing.fileSize || '842 KB',
                            url: existing.fileUrl || null,
                        });
                    }
                    if (existing.questions?.length) {
                        setQuestions(existing.questions);
                    }
                    if (existing.links?.length) {
                        setLinks(existing.links);
                    }
                    setStatusBanner({
                        visible: true,
                        code: existing.requestCode || 'SOL-024',
                        submittedAt: existing.submittedAt || '20 out. 2026, às 14h20',
                    });
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
        const nextNum = String(questions.length + 1).padStart(2, '0');
        setQuestions((prev) => [
            ...prev,
            {
                id: `q-${Date.now()}`,
                number: nextNum,
                title: `Questão ${nextNum}`,
                points: '2,0 pontos',
                type: 'multiple_choice',
                statement: '',
                options: [
                    { id: 'A', label: 'A. ' },
                    { id: 'B', label: 'B. ' },
                    { id: 'C', label: 'C. ' },
                    { id: 'D', label: 'D. ' },
                ],
                correctAnswer: 'A',
            },
        ]);
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
        setLinks((prev) => [
            ...prev,
            {
                id: `link-${Date.now()}`,
                kind: 'site',
                kindLabel: 'Artigo e guia',
                title: '',
                url: '',
                source: 'Referência externa',
                duration: 'Leitura',
                description: '',
            },
        ]);
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

    const subjectOptions = subjectsList.length
        ? subjectsList.map((s) => ({ value: s.tag, label: s.label }))
        : [{ value: 'CAL1001', label: 'Cálculo I — CAL1001' }];

    const teacherOptions = [...new Set(subjectsList.map((s) => s.teacher))].map((t) => ({
        value: t,
        label: t,
    }));
    if (!teacherOptions.length) {
        teacherOptions.push({ value: 'Profa. Ana Martins', label: 'Profa. Ana Martins' });
    }

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: 'Meus conteúdos', href: '/conteudos' },
        { label: isEdit ? 'Editar contribuição' : 'Adicionar conteúdo' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f5' }}>
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
                            fontSize: { xs: 24, md: 28 },
                            fontWeight: 700,
                            color: '#1f2d27',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Compartilhe o que você aprendeu.
                    </Typography>

                    {/* Subtítulo com badge de modo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '-4px' }}>
                        <Box
                            sx={{
                                backgroundColor: '#e6f2ed',
                                color: '#006b47',
                                fontSize: 11,
                                fontWeight: 700,
                                borderRadius: '6px',
                                padding: '3px 10px',
                            }}
                        >
                            {isEdit ? 'Modo edição • conteúdo próprio' : 'Novo envio • conteúdo autoral'}
                        </Box>
                        <Typography sx={{ fontSize: 12, color: '#6b7280' }}>
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
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '14px',
                                padding: { xs: '20px 16px', md: '26px 28px' },
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '18px',
                            }}
                        >
                            <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700, color: '#1f2d27' }}>
                                Dados do conteúdo
                            </Typography>

                            {/* Campo: Título */}
                            <Box>
                                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1f2d27', marginBottom: '6px' }}>
                                    Título *
                                </Typography>
                                <InputBase
                                    fullWidth
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Resumo — Limites e continuidade"
                                    sx={{
                                        border: '1px solid #d1d5db',
                                        borderRadius: '7px',
                                        padding: '7px 12px',
                                        fontSize: 13,
                                        color: '#111827',
                                        backgroundColor: '#ffffff',
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
                                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1f2d27', marginBottom: '8px' }}>
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
                                                    fontSize: 12,
                                                    fontWeight: selected ? 700 : 500,
                                                    padding: '6px 16px',
                                                    borderRadius: '7px',
                                                    border: selected ? '1.5px solid #006b47' : '1px solid #e5e7eb',
                                                    backgroundColor: selected ? '#e9f4ee' : '#f9fafb',
                                                    color: selected ? '#006b47' : '#6b7280',
                                                    '&:hover': {
                                                        backgroundColor: selected ? '#dff0e6' : '#f3f4f6',
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
                                        border: isDragging ? '1.5px dashed #006b47' : '1.5px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        backgroundColor: isDragging ? '#e9f4ee' : '#f8faf9',
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

                                    <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: '#006b47' }} />

                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1f2d27', marginTop: '4px', textAlign: 'center' }}>
                                        Arraste o arquivo ou selecione no computador
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#6b7280', marginBottom: uploadedFile ? '12px' : 0 }}>
                                        PDF, DOCX ou imagem • Até 20 MB
                                    </Typography>

                                    {uploadedFile && (
                                        <Box
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                width: '100%',
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e5e7eb',
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
                                                <DescriptionOutlinedIcon sx={{ color: '#006b47', fontSize: 20, flexShrink: 0 }} />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1f2d27', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {uploadedFile.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 10.5, color: '#6b7280' }}>
                                                        {uploadedFile.size} • Upload concluído
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <IconButton
                                                size="small"
                                                onClick={() => setUploadedFile(null)}
                                                aria-label="Remover arquivo"
                                                sx={{ color: '#6b7280' }}
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
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        backgroundColor: '#f8faf9',
                                        padding: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1f2d27' }}>
                                                Questões para correção automática
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: '#6b7280' }}>
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
                                                fontSize: 12,
                                                color: '#006b47',
                                                backgroundColor: '#e9f4ee',
                                                borderRadius: '7px',
                                                padding: '5px 12px',
                                                '&:hover': { backgroundColor: '#d8ece1' },
                                            }}
                                        >
                                            Adicionar questão
                                        </Button>
                                    </Box>

                                    {questions.map((q) => (
                                        <Box
                                            key={q.id}
                                            sx={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '10px',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#006b47' }}>
                                                    Questão {q.number}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Button
                                                        type="button"
                                                        size="small"
                                                        onClick={() => handleUpdateQuestion(q.id, { type: 'multiple_choice', correctAnswer: 'A' })}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            fontWeight: q.type === 'multiple_choice' ? 700 : 500,
                                                            padding: '3px 10px',
                                                            borderRadius: '6px',
                                                            backgroundColor: q.type === 'multiple_choice' ? '#e9f4ee' : '#f3f4f6',
                                                            color: q.type === 'multiple_choice' ? '#006b47' : '#6b7280',
                                                        }}
                                                    >
                                                        Múltipla escolha
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="small"
                                                        onClick={() => handleUpdateQuestion(q.id, { type: 'direct_result', correctAnswer: '6' })}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            fontWeight: q.type === 'direct_result' ? 700 : 500,
                                                            padding: '3px 10px',
                                                            borderRadius: '6px',
                                                            backgroundColor: q.type === 'direct_result' ? '#e9f4ee' : '#f3f4f6',
                                                            color: q.type === 'direct_result' ? '#006b47' : '#6b7280',
                                                        }}
                                                    >
                                                        Resultado direto
                                                    </Button>

                                                    {questions.length > 1 && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveQuestion(q.id)}
                                                            sx={{ color: '#b91c1c' }}
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
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: 12.5,
                                                    }}
                                                />
                                                <InputBase
                                                    fullWidth
                                                    value={q.points}
                                                    onChange={(e) => handleUpdateQuestion(q.id, { points: e.target.value })}
                                                    placeholder="Ex: 2,0 pontos"
                                                    sx={{
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: 12.5,
                                                    }}
                                                />
                                            </Box>

                                            <InputBase
                                                fullWidth
                                                value={q.statement}
                                                onChange={(e) => handleUpdateQuestion(q.id, { statement: e.target.value })}
                                                placeholder="Enunciado da pergunta (ex: Qual é o valor de lim x → 2 de 3x² - 2x + 1?)"
                                                sx={{
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '7px',
                                                    padding: '6px 10px',
                                                    fontSize: 12.5,
                                                }}
                                            />

                                            {q.type === 'multiple_choice' ? (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#4b5563' }}>
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
                                                                    border: isCorrect ? '1.5px solid #006b47' : '1px solid #e5e7eb',
                                                                    backgroundColor: isCorrect ? '#e9f4ee' : '#ffffff',
                                                                    borderRadius: '7px',
                                                                    padding: '4px 10px',
                                                                }}
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleUpdateQuestion(q.id, { correctAnswer: opt.id })}
                                                                    sx={{ padding: '2px', color: isCorrect ? '#006b47' : '#9ca3af' }}
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
                                                                    sx={{ fontSize: 12.5 }}
                                                                />
                                                                {isCorrect && (
                                                                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#006b47', whiteSpace: 'nowrap' }}>
                                                                        Gabarito ✓
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#006b47', marginBottom: '4px' }}>
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
                                                            border: '1.5px solid #006b47',
                                                            backgroundColor: '#e9f4ee',
                                                            borderRadius: '7px',
                                                            padding: '6px 10px',
                                                            fontSize: 12.5,
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
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        backgroundColor: '#f8faf9',
                                        padding: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1f2d27' }}>
                                                Links de estudo (vídeos, sites e simuladores)
                                            </Typography>
                                            <Typography sx={{ fontSize: 11.5, color: '#6b7280' }}>
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
                                                fontSize: 12,
                                                color: '#006b47',
                                                backgroundColor: '#e9f4ee',
                                                borderRadius: '7px',
                                                padding: '5px 12px',
                                                '&:hover': { backgroundColor: '#d8ece1' },
                                            }}
                                        >
                                            Adicionar link
                                        </Button>
                                    </Box>

                                    {links.map((item, idx) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '10px',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#006b47' }}>
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
                                                                fontSize: 11,
                                                                fontWeight: item.kind === k.value ? 700 : 500,
                                                                padding: '2px 8px',
                                                                minWidth: 0,
                                                                borderRadius: '5px',
                                                                backgroundColor: item.kind === k.value ? '#e9f4ee' : '#f3f4f6',
                                                                color: item.kind === k.value ? '#006b47' : '#6b7280',
                                                            }}
                                                        >
                                                            {k.label}
                                                        </Button>
                                                    ))}

                                                    {links.length > 1 && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveLink(item.id)}
                                                            sx={{ color: '#b91c1c' }}
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
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: 12.5,
                                                    }}
                                                />
                                                <InputBase
                                                    fullWidth
                                                    value={item.url}
                                                    onChange={(e) => handleUpdateLink(item.id, { url: e.target.value })}
                                                    placeholder="URL (ex: https://www.youtube.com/watch?v=...)"
                                                    sx={{
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '7px',
                                                        padding: '6px 10px',
                                                        fontSize: 12.5,
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
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '7px',
                                                    padding: '6px 10px',
                                                    fontSize: 12.5,
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* Campo: Descrição Geral */}
                            <Box>
                                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1f2d27', marginBottom: '6px' }}>
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
                                        border: '1px solid #d1d5db',
                                        borderRadius: '7px',
                                        padding: '8px 12px',
                                        fontSize: 12.5,
                                        color: '#111827',
                                        backgroundColor: '#ffffff',
                                        alignItems: 'flex-start',
                                    }}
                                />
                            </Box>

                            {/* Linha dupla: URL de apoio + Citação / fonte */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '16px' }}>
                                <Box>
                                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1f2d27', marginBottom: '6px' }}>
                                        URL de apoio (opcional)
                                    </Typography>
                                    <InputBase
                                        fullWidth
                                        value={supportUrl}
                                        onChange={(e) => setSupportUrl(e.target.value)}
                                        placeholder="https://www.geogebra.org/graphing"
                                        sx={{
                                            border: '1px solid #d1d5db',
                                            borderRadius: '7px',
                                            padding: '7px 12px',
                                            fontSize: 12.5,
                                            color: '#111827',
                                            backgroundColor: '#ffffff',
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1f2d27', marginBottom: '6px' }}>
                                        Citação / fonte (quando aplicável)
                                    </Typography>
                                    <InputBase
                                        fullWidth
                                        value={citation}
                                        onChange={(e) => setCitation(e.target.value)}
                                        placeholder={`Material autoral de ${authorName}`}
                                        sx={{
                                            border: '1px solid #d1d5db',
                                            borderRadius: '7px',
                                            padding: '7px 12px',
                                            fontSize: 12.5,
                                            color: '#111827',
                                            backgroundColor: '#ffffff',
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
                                        fontSize: 12.5,
                                        color: '#1f2d27',
                                        borderColor: '#e5e7eb',
                                        backgroundColor: '#ffffff',
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
                                    sx={{ height: '38px', fontSize: 12.5 }}
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
                                    backgroundColor: '#e9f4ee',
                                    border: '1px solid #cfe5dc',
                                    borderRadius: '12px',
                                    padding: '16px 18px',
                                }}
                            >
                                <CheckCircleOutlinedIcon sx={{ color: '#006b47', fontSize: 20, marginTop: '1px', flexShrink: 0 }} />
                                <Box>
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#006b47' }}>
                                        {isProfessor
                                            ? 'Publicação imediata habilitada'
                                            : 'Pedido encaminhado ao administrador'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11.5, color: '#006b47', marginTop: '4px', lineHeight: 1.45 }}>
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

