import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, InputBase, Button, Tabs, Tab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import SectionContent from '../components/common/sectionContent/SectionContent';
import PrimaryButton from '../components/common/PrimaryButton';
import subjectService from '../services/subjectService';

const PAGE_STEP = 5;

function Subject() {
    const { tag } = useParams();
    const searchRef = useRef(null);

    const [subject, setSubject] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [limit, setLimit] = useState(PAGE_STEP);
    const [resources, setResources] = useState({ items: [], total: 0 });

    // Dados da disciplina (cabeçalho e contadores das abas)
    useEffect(() => {
        const loadSubject = async () => {
            const data = await subjectService.getSubject(tag);
            setNotFound(!data);
            setSubject(data);
            setFavorite(Boolean(data?.favorite));
            setCategory('all');
            setSearch('');
            setLimit(PAGE_STEP);
        };
        loadSubject();
    }, [tag]);

    // Recursos conforme aba, busca e "carregar mais"
    useEffect(() => {
        const loadResources = async () => {
            setResources(await subjectService.getResources({ tag, category, search, limit }));
        };
        loadResources();
    }, [tag, category, search, limit]);

    // Atalho Ctrl/Cmd + K foca a busca
    useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handleCategoryChange = (_, value) => {
        setCategory(value);
        setLimit(PAGE_STEP);
    };

    const handleSearch = (value) => {
        setSearch(value);
        setLimit(PAGE_STEP);
    };

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: 'Explorar disciplinas', href: '/explorar' },
        { label: subject?.name ?? tag },
    ];

    const tabs = subject && [
        { value: 'all', label: `Todos os materiais (${subject.counts.all})` },
        { value: 'prova', label: `Provas anteriores (${subject.counts.prova})` },
        { value: 'exercicio', label: `Exercícios (${subject.counts.exercicio})` },
        { value: 'atividade', label: `Atividades (${subject.counts.atividade})` },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f5' }}>
            <SideBar defaultActive="explorar" />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={breadcrumbs} />

                {/* Apenas esta área rola; sidebar e header ficam fixos */}
                <Box component="main" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: { xs: '20px 16px', md: '32px 28px' }, display: 'flex', flexDirection: 'column', gap: '20px', '& > *': { flexShrink: 0 } }}>
                    {notFound && (
                        <Typography sx={{ fontSize: 16, color: '#6b7280' }}>Disciplina não encontrada.</Typography>
                    )}

                    {subject && (
                        <>
                            {/* Cabeçalho da disciplina */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', gap: '16px' }}>
                                <Box>
                                    <Typography component="h1" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, color: '#1f2d27', letterSpacing: '-0.5px' }}>
                                        {subject.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, color: '#6b7280', marginTop: '8px' }}>
                                        {subject.courseLabel} / {subject.tag}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#1f2d27', marginTop: '18px' }}>
                                        {subject.teacher}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setFavorite(!favorite)}
                                        startIcon={favorite ? <StarRoundedIcon /> : <StarBorderOutlinedIcon />}
                                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12.5, color: '#1f2d27', borderColor: '#e5e7eb', backgroundColor: '#ffffff', borderRadius: '7px', height: '36px' }}
                                    >
                                        {favorite ? 'Favoritada' : 'Favoritar'}
                                    </Button>
                                    <PrimaryButton fullWidth={false} startIcon={<AddIcon />} sx={{ height: '36px', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                                        Adicionar conteúdo
                                    </PrimaryButton>
                                </Box>
                            </Box>

                            {/* Abas por categoria */}
                            <Tabs
                                value={category}
                                onChange={handleCategoryChange}
                                variant="scrollable"
                                scrollButtons={false}
                                sx={{
                                    minHeight: 40,
                                    borderBottom: '1px solid #e5e7eb',
                                    '& .MuiTabs-indicator': { backgroundColor: '#006b47' },
                                    '& .MuiTab-root': { textTransform: 'none', minHeight: 40, minWidth: 0, padding: '8px 0', marginRight: '28px', fontSize: 12.5, fontWeight: 500, color: '#6b7280' },
                                    '& .MuiTab-root.Mui-selected': { color: '#006b47', fontWeight: 700 },
                                }}
                            >
                                {tabs.map((tab) => (
                                    <Tab key={tab.value} value={tab.value} label={tab.label} disableRipple />
                                ))}
                            </Tabs>

                            {/* Busca na disciplina */}
                            <InputBase
                                fullWidth
                                inputRef={searchRef}
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Buscar nesta disciplina"
                                startAdornment={<SearchIcon sx={{ color: '#6b7280', marginRight: '10px', fontSize: 20 }} />}
                                endAdornment={<Typography sx={{ fontSize: 10, color: '#6b7280', display: { xs: 'none', sm: 'block' } }}>⌘ K</Typography>}
                                sx={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: 13 }}
                            />

                            {/* Recursos */}
                            <Box sx={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: { xs: '18px 16px 14px', md: '22px 22px 16px' } }}>
                                <Typography component="h2" sx={{ fontSize: 17, fontWeight: 700, color: '#1f2d27', marginBottom: '6px' }}>
                                    Recursos da disciplina
                                </Typography>

                                {resources.items.map((resource) => (
                                    <SectionContent
                                        key={resource.id}
                                        {...resource}
                                        href={resource.format === 'PDF' ? `/conteudo/${resource.id}` : resource.href}
                                    />
                                ))}

                                {resources.total === 0 && (
                                    <Typography sx={{ fontSize: 13, color: '#6b7280', padding: '20px 0' }}>
                                        Nenhum recurso encontrado.
                                    </Typography>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', fontSize: 11, color: '#6b7280' }}>
                                    <span>Exibindo {resources.items.length} de {resources.total} recursos</span>
                                    {resources.items.length < resources.total && (
                                        <>
                                            <span>•</span>
                                            <Button onClick={() => setLimit(limit + PAGE_STEP)} sx={{ textTransform: 'none', minWidth: 0, padding: 0, fontSize: 11, color: '#6b7280' }}>
                                                Carregar mais ↓
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default Subject;