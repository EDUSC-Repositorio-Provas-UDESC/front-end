import { useEffect, useState } from 'react';
import { Box, Typography, InputBase, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import CardSubject from '../components/common/cardSubject/cardSubject';
import Combobox from '../components/common/combobox';
import PrimaryButton from '../components/common/PrimaryButton';
import subjectService from '../services/subjectService';

const PAGE_SIZE = 6;
const DEFAULT_FILTERS = { search: '', course: 'cc', subject: '', teacher: '' };
const BREADCRUMBS = [
    { label: 'Espaço acadêmico', href: '/home' },
    { label: 'Explorar disciplinas' },
];

function Explore() {
    // `filters` é o rascunho dos campos; `applied` só muda ao clicar em "Aplicar filtros"
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [applied, setApplied] = useState(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [options, setOptions] = useState({ courses: [], subjects: [], teachers: [] });
    const [result, setResult] = useState({ items: [], total: 0, page: 1, totalPages: 1 });

    const setFilter = (key) => (value) => setFilters((prev) => ({ ...prev, [key]: value }));

    // Trocar o curso reinicia disciplina e professor
    const handleCourseChange = (course) =>
        setFilters((prev) => ({ ...prev, course, subject: '', teacher: '' }));

    useEffect(() => {
        const loadOptions = async () => {
            setOptions(await subjectService.getFilterOptions(filters.course));
        };
        loadOptions();
    }, [filters.course]);

    useEffect(() => {
        const loadSubjects = async () => {
            setResult(await subjectService.getCatalog({ ...applied, page, pageSize: PAGE_SIZE }));
        };
        loadSubjects();
    }, [applied, page]);

    const handleApply = () => {
        setApplied(filters);
        setPage(1);
    };

    const handleClear = () => {
        const cleared = { search: '', course: '', subject: '', teacher: '' };
        setFilters(cleared);
        setApplied(cleared);
        setPage(1);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f5' }}>
            <SideBar defaultActive="explorar" />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={BREADCRUMBS} />

                {/* Apenas esta área rola; sidebar e header ficam fixos */}
                <Box component="main" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: { xs: '20px 16px', md: '32px 28px' }, display: 'flex', flexDirection: 'column', gap: '28px', '& > *': { flexShrink: 0 } }}>
                    <Typography component="h1" sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 700, color: '#1f2d27', letterSpacing: '-0.5px' }}>
                        Conhecimento para explorar.
                    </Typography>

                    {/* Busca e filtros */}
                    <Box sx={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: { xs: '16px', md: '16px 16px 18px' }, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <InputBase
                            fullWidth
                            value={filters.search}
                            onChange={(e) => setFilter('search')(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                            placeholder="Buscar por nome ou código da disciplina"
                            startAdornment={<SearchIcon sx={{ color: '#6b7280', marginRight: '10px', fontSize: 20 }} />}
                            sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: 13 }}
                        />

                        <Box sx={{ display: 'grid', gap: '16px', alignItems: 'end', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr) auto auto' } }}>
                            <Combobox
                                label="Curso de graduação"
                                value={filters.course}
                                onChange={handleCourseChange}
                                options={[{ value: '', label: 'Todos os cursos' }, ...options.courses]}
                            />
                            <Combobox
                                label="Disciplina / matéria"
                                value={filters.subject}
                                onChange={setFilter('subject')}
                                options={[{ value: '', label: 'Todas as disciplinas' }, ...options.subjects]}
                            />
                            <Combobox
                                label="Professor responsável"
                                value={filters.teacher}
                                onChange={setFilter('teacher')}
                                options={[{ value: '', label: 'Todos os professores' }, ...options.teachers]}
                            />
                            <PrimaryButton fullWidth={false} onClick={handleApply} sx={{ width: { xs: '100%', md: 'auto' }, height: '36px' }}>
                                Aplicar filtros
                            </PrimaryButton>
                            <Button onClick={handleClear} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#006b47' }}>
                                Limpar
                            </Button>
                        </Box>
                    </Box>

                    {/* Disciplinas */}
                    <Box sx={{ display: 'grid', gap: '14px', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                        {result.items.map((subject) => (
                            <CardSubject key={subject.id} {...subject} />
                        ))}
                    </Box>

                    {/* Rodapé / paginação */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <Typography sx={{ fontSize: 11, color: '#6b7280' }}>
                            Exibindo {result.items.length} de {result.total} disciplinas
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Button
                                variant="outlined"
                                disabled={result.page <= 1}
                                onClick={() => setPage(result.page - 1)}
                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, color: '#1f2d27', borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                            >
                                Anterior
                            </Button>
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#006b47', backgroundColor: '#e8f3ed', borderRadius: '6px', padding: '3px 8px' }}>
                                {result.page}
                            </Typography>
                            <Button
                                variant="outlined"
                                disabled={result.page >= result.totalPages}
                                onClick={() => setPage(result.page + 1)}
                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12, color: '#1f2d27', borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
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

export default Explore;