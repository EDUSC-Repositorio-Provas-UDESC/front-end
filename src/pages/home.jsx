import { useEffect, useState } from 'react';
import { Box, Typography, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import CardSubject from '../components/common/cardSubject/cardSubject';
import subjectService from '../services/subjectService';

function Home({ name_user }) {
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const getSubjects = async () => {
            setSubjects(await subjectService.getFavorites());
        };
        getSubjects();
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--c-bg)' }}>
            <SideBar defaultActive="inicio" />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header />

                {/* Apenas esta área rola; sidebar e header ficam fixos */}
                <Box component="main" sx={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: { xs: '20px 16px', md: '32px 28px' }, display: 'flex', flexDirection: 'column', gap: '28px', '& > *': { flexShrink: 0 } }}>
                    <Typography sx={{ fontSize: { xs: '1.2812rem', md: '1.5rem' }, fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-0.5px' }}>
                        Olá, {name_user}.
                    </Typography>

                    {/* Banner de busca */}
                    <Box sx={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--c-brand-hover)', borderRadius: '14px', padding: { xs: '20px', md: '24px 20px' } }}>
                        <Box sx={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', border: '22px solid rgba(255,255,255,0.08)' }} />
                        <Box sx={{ position: 'relative' }}>
                            <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.6px', color: 'var(--c-highlight)' }}>
                                CURIOSIDADE ABRE CAMINHOS
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '1.1562rem', md: '1.1875rem' }, fontWeight: 700, color: 'var(--c-on-brand)', margin: '6px 0 18px' }}>
                                O que você quer aprender hoje?
                            </Typography>
                            <InputBase
                                fullWidth
                                placeholder="Buscar disciplinas, materiais ou professores..."
                                startAdornment={<SearchIcon sx={{ color: 'var(--c-text-muted)', marginRight: '10px', fontSize: 20 }} />}
                                sx={{ backgroundColor: 'var(--c-surface)', borderRadius: '8px', padding: '9px 14px', fontSize: '0.8125rem' }}
                            />
                        </Box>
                    </Box>

                    {/* Disciplinas favoritas */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <Typography component="h2" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                Suas disciplinas favoritas
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'grid', gap: '14px', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                            {subjects.map((subject) => (
                                <CardSubject key={subject.id} {...subject} />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box >
    );
}

export default Home;