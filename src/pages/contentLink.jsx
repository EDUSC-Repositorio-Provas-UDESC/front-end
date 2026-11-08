import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import NotesCard from '../components/common/notesCard/NotesCard';
import subjectService from '../services/subjectService';

const KIND_CONFIG = {
    video: {
        icon: PlayCircleOutlinedIcon,
        badgeBg: 'var(--c-primary-soft)',
        badgeColor: 'var(--c-primary)',
        actionLabel: 'Assistir vídeo',
    },
    simulador: {
        icon: ScienceOutlinedIcon,
        badgeBg: 'var(--c-info-soft)',
        badgeColor: 'var(--c-info)',
        actionLabel: 'Abrir simulador',
    },
    site: {
        icon: LanguageIcon,
        badgeBg: 'var(--c-surface-muted)',
        badgeColor: 'var(--c-text-secondary)',
        actionLabel: 'Acessar site',
    },
};

function ContentLink() {
    const { id } = useParams();

    const [resource, setResource] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const data = await subjectService.getContentLink(id);
            if (isMounted) {
                setResource(data);
                setFilter('all');
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const allLinks = resource?.links || [];
    const filteredLinks = allLinks.filter((item) => filter === 'all' || item.kind === filter);

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: resource?.subjectName, href: `/disciplina/${resource?.subjectTag}` },
        { label: resource?.categoryLabel },
        { label: resource?.shortTitle },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--c-bg)' }}>
            <SideBar defaultActive="explorar" />

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
                    {/* Linha de Título e Botão de Acesso Principal */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: '16px' }}>
                        <Box>
                            <Typography
                                component="h1"
                                sx={{
                                    fontSize: { xs: '1.1875rem', md: '1.5rem' },
                                    fontWeight: 700,
                                    color: 'var(--c-text)',
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1.25,
                                }}
                            >
                                {resource?.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: 'var(--c-text-muted)', marginTop: '6px' }}>
                                {resource?.description}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Chips / Metadados */}
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {resource?.typeLabel && (
                            <Box sx={{ backgroundColor: 'var(--c-primary-soft)', color: 'var(--c-primary)', fontSize: '0.7188rem', fontWeight: 600, borderRadius: '6px', padding: '4px 10px' }}>
                                {resource.typeLabel}
                            </Box>
                        )}
                        {resource?.info && (
                            <Box sx={{ backgroundColor: 'var(--c-surface-muted)', color: 'var(--c-text-secondary)', fontSize: '0.7188rem', fontWeight: 500, borderRadius: '6px', padding: '4px 10px' }}>
                                {resource.info}
                            </Box>
                        )}
                    </Box>

                    {/* Grid Principal: Links de Estudo (Esquerda) + Anotações (Direita) */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
                            gap: '20px',
                            alignItems: 'start',
                        }}
                    >
                        {/* COLUNA ESQUERDA: Card de Links, Vídeos e Sites para Estudo */}
                        <Box
                            sx={{
                                backgroundColor: 'var(--c-surface)',
                                border: '1px solid var(--c-border)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Barra Superior do Card */}
                            <Box
                                sx={{
                                    padding: '12px 18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderBottom: '1px solid var(--c-border)',
                                    backgroundColor: 'var(--c-surface)',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <InsertLinkOutlinedIcon sx={{ fontSize: 18, color: 'var(--c-primary)' }} />
                                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text)' }}>
                                        Materiais externos selecionados para estudo
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ padding: { xs: '16px', md: '22px' }, display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                {/* Lista de cards de links (vídeos, sites, simuladores) */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {filteredLinks.map((item) => {
                                        const cfg = KIND_CONFIG[item.kind] || KIND_CONFIG.site;
                                        const IconComponent = cfg.icon;

                                        return (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                                    justifyContent: 'space-between',
                                                    gap: '16px',
                                                    padding: '16px',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--c-border)',
                                                    backgroundColor: 'var(--c-surface)',
                                                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                                                    '&:hover': {
                                                        borderColor: 'var(--c-primary)',
                                                        backgroundColor: 'var(--c-surface-alt)',
                                                    },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                                                    <Box
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: '9px',
                                                            backgroundColor: cfg.badgeBg,
                                                            color: cfg.badgeColor,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <IconComponent fontSize="small" />
                                                    </Box>

                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                            <Box
                                                                sx={{
                                                                    backgroundColor: cfg.badgeBg,
                                                                    color: cfg.badgeColor,
                                                                    fontSize: '0.6562rem',
                                                                    fontWeight: 700,
                                                                    borderRadius: '4px',
                                                                    padding: '2px 7px',
                                                                }}
                                                            >
                                                                {item.kindLabel}
                                                            </Box>
                                                            <Typography sx={{ fontSize: '0.6875rem', color: 'var(--c-text-muted)' }}>
                                                                {item.source} • {item.duration}
                                                            </Typography>
                                                        </Box>

                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.35 }}>
                                                            {item.title}
                                                        </Typography>

                                                        <Typography sx={{ fontSize: '0.75rem', color: 'var(--c-text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                                                            {item.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Button
                                                    component="a"
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    variant="outlined"
                                                    endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        color: 'var(--c-primary)',
                                                        borderColor: 'var(--c-primary-border)',
                                                        backgroundColor: 'var(--c-surface-alt)',
                                                        borderRadius: '7px',
                                                        padding: '6px 12px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                        '&:hover': {
                                                            backgroundColor: 'var(--c-primary-soft)',
                                                            borderColor: 'var(--c-primary)',
                                                        },
                                                    }}
                                                >
                                                    {cfg.actionLabel}
                                                </Button>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>

                        {/* COLUNA DIREITA: Minhas Anotações */}
                        <NotesCard resourceId={id} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ContentLink;