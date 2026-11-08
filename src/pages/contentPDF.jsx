import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import NotesCard from '../components/common/notesCard/NotesCard';
import subjectService from '../services/subjectService';

function ContentPDF() {
    const { id } = useParams();

    const [resource, setResource] = useState(null);
    const [currentPage] = useState(1);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const data = await subjectService.getContentPDF(id);
            if (isMounted) {
                setResource(data);
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const fileName = resource?.fileName || '';
    const fileUrl = resource?.fileUrl || '';

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: resource?.subjectName, href: `/disciplina/${resource?.subjectTag}` },
        { label: resource?.categoryLabel },
        { label: resource?.shortTitle },
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
                                {resource?.title}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#6b7280', marginTop: '6px' }}>
                                {resource?.description}
                            </Typography>
                        </Box>

                        <Button
                            component="a"
                            href={fileUrl}
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
                        {resource?.typeLabel && (
                            <Box sx={{ backgroundColor: '#e9f4ee', color: '#006b47', fontSize: 11.5, fontWeight: 600, borderRadius: '6px', padding: '4px 10px' }}>
                                {resource.typeLabel}
                            </Box>
                        )}
                        {resource?.info && (
                            <Box sx={{ backgroundColor: '#f3f4f6', color: '#4b5563', fontSize: 11.5, fontWeight: 500, borderRadius: '6px', padding: '4px 10px' }}>
                                {resource.info}
                            </Box>
                        )}
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
                                }}
                            >
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <iframe
                                        src={`${fileUrl}#page=${currentPage}`}
                                        title="PDF Original"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none' }}
                                    />
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

export default ContentPDF;
