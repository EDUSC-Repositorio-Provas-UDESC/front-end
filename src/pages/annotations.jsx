import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import RuleIcon from '@mui/icons-material/Rule';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import subjectService from '../services/subjectService';
import loginService from '../services/loginService';

const PAGE_SIZE = 5;

const ANNOTATION_TYPES = [
    {
        id: 'all',
        label: 'Todas as anotações',
        description: 'Todos os conteúdos com notas salvas',
        icon: EditNoteOutlinedIcon,
    },
    {
        id: 'prova',
        label: 'Provas anteriores',
        description: 'Anotações feitas em provas e avaliações',
        icon: DescriptionOutlinedIcon,
    },
    {
        id: 'link',
        label: 'Links e vídeos',
        description: 'Anotações em vídeo-aulas, sites e simuladores',
        icon: InsertLinkOutlinedIcon,
    },
    {
        id: 'atividade',
        label: 'Atividades',
        description: 'Anotações em atividades de múltipla escolha e cálculo',
        icon: RuleIcon,
    },
    {
        id: 'outros',
        label: 'Exercícios e arquivos',
        description: 'Anotações em listas de exercícios e resumos em PDF',
        icon: DescriptionOutlinedIcon,
    },
];

/**
 * 1ª Página de Anotações (`/anotacoes`):
 * Permite escolher o tipo de anotação (Provas, Links, Atividades, etc.) e lista os itens
 * filtrados e paginados pelo back-end. Ao clicar em um item, redireciona para `/anotacoes/:id` (`AnnotationDetails`).
 */
function Annotations() {
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
        countsByCategory: {},
    });

    const currentUser = loginService.getCurrentUser();

    useEffect(() => {
        let isMounted = true;
        const loadAnnotatedItems = async () => {
            const response = await subjectService.getAnnotatedResources({
                category: selectedCategory,
                page,
                pageSize: PAGE_SIZE,
            });
            if (isMounted && response) {
                setResult(response);
            }
        };
        loadAnnotatedItems();
        return () => {
            isMounted = false;
        };
    }, [selectedCategory, page]);

    const handleSelectCategory = (categoryId) => {
        setSelectedCategory(categoryId);
        setPage(1);
    };

    const activeCategoryConfig =
        ANNOTATION_TYPES.find((c) => c.id === selectedCategory) || ANNOTATION_TYPES[0];

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: 'Anotações' },
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
                    {/* Cabeçalho */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: { xs: '1.2812rem', md: '1.5rem' },
                                fontWeight: 700,
                                color: 'var(--c-text)',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Minhas anotações de estudo.
                        </Typography>
                        <Typography sx={{ fontSize: '0.8438rem', color: 'var(--c-text-muted)' }}>
                            Escolha o tipo de material abaixo e clique em um conteúdo para visualizar todas as anotações daquele título.
                        </Typography>
                    </Box>

                    {/* Cards para escolher o tipo de anotação (Provas, Links, Atividades, etc.) */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                lg: 'repeat(5, 1fr)',
                            },
                            gap: '12px',
                        }}
                    >
                        {ANNOTATION_TYPES.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            const totalNotesCount = result.countsByCategory?.[cat.id] ?? 0;

                            return (
                                <Box
                                    key={cat.id}
                                    onClick={() => handleSelectCategory(cat.id)}
                                    sx={{
                                        backgroundColor: isSelected ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                                        border: isSelected
                                            ? '1.5px solid var(--c-primary)'
                                            : '1px solid var(--c-border)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            borderColor: 'var(--c-primary)',
                                            backgroundColor: isSelected ? 'var(--c-primary-soft)' : 'var(--c-sidebar)',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '9px',
                                                backgroundColor: isSelected ? 'var(--c-brand)' : 'var(--c-primary-soft)',
                                                color: isSelected ? 'var(--c-on-brand)' : 'var(--c-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Icon fontSize="small" />
                                        </Box>

                                        <Box
                                            sx={{
                                                backgroundColor: isSelected ? 'var(--c-primary-soft-hover)' : 'var(--c-surface-muted)',
                                                color: 'var(--c-primary)',
                                                fontSize: '0.6875rem',
                                                fontWeight: 700,
                                                padding: '3px 9px',
                                                borderRadius: '999px',
                                            }}
                                        >
                                            {totalNotesCount} {totalNotesCount === 1 ? 'nota' : 'notas'}
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: '0.9062rem',
                                                fontWeight: 700,
                                                color: 'var(--c-text)',
                                                marginBottom: '3px',
                                            }}
                                        >
                                            {cat.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', lineHeight: 1.4 }}>
                                            {cat.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Lista paginada de conteúdos retornada pelo back-end para a aba ativa */}
                    <Box
                        sx={{
                            backgroundColor: 'var(--c-surface)',
                            border: '1px solid var(--c-border)',
                            borderRadius: '14px',
                            padding: { xs: '18px 16px', md: '24px 26px' },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingBottom: '8px',
                                borderBottom: '1px solid var(--c-surface-muted)',
                            }}
                        >
                            <Typography component="h2" sx={{ fontSize: '0.9688rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                {activeCategoryConfig.label} ({result.total})
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
                                Clique em um item para ver suas anotações
                            </Typography>
                        </Box>

                        {result.items.length === 0 ? (
                            <Typography
                                sx={{
                                    fontSize: '0.8438rem',
                                    color: 'var(--c-text-muted)',
                                    textAlign: 'center',
                                    padding: '28px 0',
                                }}
                            >
                                Nenhuma anotação encontrada para este tipo de conteúdo.
                            </Typography>
                        ) : (
                            result.items.map((item, index) => {
                                const Icon =
                                    item.format === 'Link'
                                        ? InsertLinkOutlinedIcon
                                        : item.format === 'Atividade'
                                            ? RuleIcon
                                            : DescriptionOutlinedIcon;

                                const notesCount = item.notesCount ?? item.notes?.length ?? 0;

                                return (
                                    <Box
                                        key={item.id}
                                        onClick={() => navigate(`/anotacoes/${item.id}`)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '14px',
                                            padding: '14px 12px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            borderBottom:
                                                index < result.items.length - 1
                                                    ? '1px solid var(--c-surface-muted)'
                                                    : 'none',
                                            transition: 'background-color 0.15s ease',
                                            '&:hover': {
                                                backgroundColor: 'var(--c-surface-alt)',
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 44,
                                                    borderRadius: '10px',
                                                    backgroundColor: 'var(--c-primary-soft)',
                                                    color: 'var(--c-primary)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '1px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Icon fontSize="small" />
                                                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.3px' }}>
                                                    {item.format}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontSize: '0.9062rem',
                                                        fontWeight: 700,
                                                        color: 'var(--c-text)',
                                                        marginBottom: '2px',
                                                    }}
                                                >
                                                    {item.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
                                                    {[item.typeLabel, item.subjectName, item.teacher]
                                                        .filter(Boolean)
                                                        .join(' • ')}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                                            <Box
                                                sx={{
                                                    backgroundColor: 'var(--c-primary-soft)',
                                                    color: 'var(--c-primary)',
                                                    fontSize: '0.7188rem',
                                                    fontWeight: 700,
                                                    padding: '4px 10px',
                                                    borderRadius: '999px',
                                                }}
                                            >
                                                {notesCount} {notesCount === 1 ? 'anotação' : 'anotações'}
                                            </Box>

                                            <Typography
                                                sx={{
                                                    fontSize: '0.7812rem',
                                                    fontWeight: 700,
                                                    color: 'var(--c-primary)',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Ver anotações →
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })
                        )}
                    </Box>

                    {/* Rodapé de Paginação (controlada pelo back-end) */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '12px',
                        }}
                    >
                        <Typography sx={{ fontSize: '0.7188rem', color: 'var(--c-text-muted)' }}>
                            Exibindo {result.items.length} de {result.total} conteúdos com anotações
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Button
                                variant="outlined"
                                disabled={result.page <= 1}
                                onClick={() => setPage(result.page - 1)}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    color: 'var(--c-text)',
                                    borderColor: 'var(--c-border)',
                                    backgroundColor: 'var(--c-surface)',
                                }}
                            >
                                Anterior
                            </Button>

                            <Typography
                                sx={{
                                    fontSize: '0.7188rem',
                                    fontWeight: 700,
                                    color: 'var(--c-primary)',
                                    backgroundColor: 'var(--c-primary-soft)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                }}
                            >
                                {result.page} / {result.totalPages || 1}
                            </Typography>

                            <Button
                                variant="outlined"
                                disabled={result.page >= result.totalPages}
                                onClick={() => setPage(result.page + 1)}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    color: 'var(--c-text)',
                                    borderColor: 'var(--c-border)',
                                    backgroundColor: 'var(--c-surface)',
                                }}
                            >
                                Próxima
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Annotations;
