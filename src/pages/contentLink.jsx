import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
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
        badgeBg: '#e9f4ee',
        badgeColor: '#006b47',
        actionLabel: 'Assistir vídeo',
    },
    simulador: {
        icon: ScienceOutlinedIcon,
        badgeBg: '#eef2ff',
        badgeColor: '#3730a3',
        actionLabel: 'Abrir simulador',
    },
    site: {
        icon: LanguageIcon,
        badgeBg: '#f3f4f6',
        badgeColor: '#374151',
        actionLabel: 'Acessar site',
    },
};

function ContentLink() {
    const { id } = useParams();
    const resourceId = id || 'CAL1001-4';

    const [resource, setResource] = useState(null);
    const [filter, setFilter] = useState('all');
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const data = await subjectService.getContentLink(resourceId);
            if (isMounted) {
                setResource(data);
                const firstVideo = data?.links?.find((l) => l.embedUrl) || null;
                setActiveVideo(firstVideo);
                setFilter('all');
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [resourceId]);

    const allLinks = resource?.links || [];
    const filteredLinks = allLinks.filter((item) => filter === 'all' || item.kind === filter);

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: resource?.subjectName || 'Cálculo I', href: `/disciplina/${resource?.subjectTag || 'CAL1001'}` },
        { label: resource?.categoryLabel || 'Links recomendados' },
        { label: resource?.shortTitle || 'Limites' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f5' }}>
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
                                    fontSize: { xs: 22, md: 28 },
                                    fontWeight: 700,
                                    color: '#1f2d27',
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1.25,
                                }}
                            >
                                {resource?.title || 'Limites: uma abordagem visual'}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#6b7280', marginTop: '6px' }}>
                                {resource?.description || 'Cálculo I • Profa. Ana Martins • Publicado em 15 out. 2026'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Chips / Metadados */}
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ backgroundColor: '#e9f4ee', color: '#006b47', fontSize: 11.5, fontWeight: 600, borderRadius: '6px', padding: '4px 10px' }}>
                            {resource?.typeLabel || 'Link recomendado'}
                        </Box>
                        <Box sx={{ backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: 11.5, fontWeight: 500, borderRadius: '6px', padding: '4px 10px' }}>
                            {resource?.info || `Vídeos e sites • ${allLinks.length} referências de estudo`}
                        </Box>
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
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
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
                                    borderBottom: '1px solid #e5e7eb',
                                    backgroundColor: '#ffffff',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <InsertLinkOutlinedIcon sx={{ fontSize: 18, color: '#006b47' }} />
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1f2d27' }}>
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
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: '#ffffff',
                                                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                                                    '&:hover': {
                                                        borderColor: '#006b47',
                                                        backgroundColor: '#fafdfb',
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
                                                                    fontSize: 10.5,
                                                                    fontWeight: 700,
                                                                    borderRadius: '4px',
                                                                    padding: '2px 7px',
                                                                }}
                                                            >
                                                                {item.kindLabel}
                                                            </Box>
                                                            <Typography sx={{ fontSize: 11, color: '#6b7280' }}>
                                                                {item.source} • {item.duration}
                                                            </Typography>
                                                        </Box>

                                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1f2d27', lineHeight: 1.35 }}>
                                                            {item.title}
                                                        </Typography>

                                                        <Typography sx={{ fontSize: 12, color: '#4b5563', marginTop: '4px', lineHeight: 1.45 }}>
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
                                                        fontSize: 12,
                                                        color: '#006b47',
                                                        borderColor: '#cfe5dc',
                                                        backgroundColor: '#f4f9f6',
                                                        borderRadius: '7px',
                                                        padding: '6px 12px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                        '&:hover': {
                                                            backgroundColor: '#e9f4ee',
                                                            borderColor: '#006b47',
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
                        <NotesCard resourceId={resourceId} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ContentLink;