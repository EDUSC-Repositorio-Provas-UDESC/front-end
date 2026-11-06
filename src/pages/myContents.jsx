import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import PrimaryButton from '../components/common/PrimaryButton';
import subjectService from '../services/subjectService';
import loginService from '../services/loginService';

function MyContents() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [sortDesc, setSortDesc] = useState(true);
    const [userRole, setUserRole] = useState(() => {
        const u = loginService.getCurrentUser();
        return String(u?.role || 'aluno').toLowerCase();
    });

    const loadContributions = async () => {
        const data = await subjectService.getMyContributions();
        setItems(data);
    };

    useEffect(() => {
        loadContributions();
    }, [userRole]);

    const handleToggleRole = () => {
        const nextRole = userRole === 'aluno' ? 'professor' : 'aluno';
        const current = loginService.getCurrentUser() || {
            id: 101,
            name: nextRole === 'professor' ? 'Profa. Ana Martins' : 'Mariana Costa',
            email: 'mariana.costa@edu.udesc.br',
        };
        const updatedUser = {
            ...current,
            name: nextRole === 'professor' ? 'Profa. Ana Martins' : 'Mariana Costa',
            role: nextRole,
        };
        localStorage.setItem('udesc_estuda_user', JSON.stringify(updatedUser));
        setUserRole(nextRole);
    };

    const handleDelete = async (id) => {
        await subjectService.deleteContribution(id);
        loadContributions();
    };

    const sortedItems = [...items].sort((a, b) =>
        sortDesc ? (b.timestamp || 0) - (a.timestamp || 0) : (a.timestamp || 0) - (b.timestamp || 0)
    );

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: 'Meus conteúdos' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f5' }}>
            <SideBar
                defaultActive="conteudos"
                userName={userRole === 'professor' ? 'Profa. Ana Martins' : 'Mariana Costa'}
                userRole={userRole === 'professor' ? 'Professor' : 'Aluno'}
                userInitials={userRole === 'professor' ? 'AM' : 'MC'}
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
                        gap: '22px',
                        '& > *': { flexShrink: 0 },
                    }}
                >
                    {/* Cabeçalho: Título + Botão Adicionar Conteúdo */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: '16px' }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: { xs: 24, md: 28 },
                                fontWeight: 700,
                                color: '#1f2d27',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Sua contribuição faz diferença.
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <PrimaryButton
                                fullWidth={false}
                                onClick={() => navigate('/conteudos/novo')}
                                startIcon={<AddIcon />}
                                sx={{ height: '36px', fontSize: 12.5, whiteSpace: 'nowrap' }}
                            >
                                Adicionar conteúdo
                            </PrimaryButton>
                        </Box>
                    </Box>

                    {/* Card: Minhas contribuições */}
                    <Box
                        sx={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '14px',
                            padding: { xs: '18px 16px', md: '24px 26px' },
                        }}
                    >
                        {/* Topo do card */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <Typography component="h2" sx={{ fontSize: 17, fontWeight: 700, color: '#1f2d27' }}>
                                Minhas contribuições
                            </Typography>

                            <Button
                                onClick={() => setSortDesc(!sortDesc)}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#006b47',
                                    padding: '2px 6px',
                                    minWidth: 0,
                                }}
                            >
                                {sortDesc ? 'Mais recentes →' : 'Mais antigos →'}
                            </Button>
                        </Box>

                        {/* Cabeçalho da tabela */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr auto auto', sm: '1fr 140px 80px' },
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: '#f4f6f5',
                                borderRadius: '6px',
                                padding: '8px 14px',
                            }}
                        >
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6b7280', letterSpacing: '0.4px' }}>
                                CONTEÚDO / ENVIO
                            </Typography>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6b7280', letterSpacing: '0.4px' }}>
                                ESTADO
                            </Typography>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#6b7280', letterSpacing: '0.4px', textAlign: 'right' }}>
                                AÇÕES
                            </Typography>
                        </Box>

                        {/* Lista de itens */}
                        {sortedItems.length === 0 && (
                            <Typography sx={{ fontSize: 13, color: '#6b7280', padding: '28px 14px', textAlign: 'center' }}>
                                Você ainda não enviou nenhum conteúdo. Clique em &ldquo;Adicionar conteúdo&rdquo; para começar.
                            </Typography>
                        )}

                        {sortedItems.map((item) => {
                            const isPending = item.status === 'pendente';

                            return (
                                <Box
                                    key={item.id}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr auto auto', sm: '1fr 140px 80px' },
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '18px 14px',
                                        borderBottom: '1px solid #e5e7eb',
                                    }}
                                >
                                    {/* Coluna 1: Informações da contribuição */}
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            onClick={() => navigate(item.href)}
                                            sx={{
                                                fontSize: 13.5,
                                                fontWeight: 700,
                                                color: '#1f2d27',
                                                cursor: 'pointer',
                                                display: 'inline-block',
                                                '&:hover': { color: '#006b47', textDecoration: 'underline' },
                                            }}
                                        >
                                            {item.title}
                                        </Typography>

                                        <Typography sx={{ fontSize: 11, color: '#6b7280', marginTop: '3px' }}>
                                            {item.typeLabel} • {item.subjectName} • {item.date}
                                        </Typography>

                                        {isPending ? (
                                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginTop: '8px' }}>
                                                Pedido {item.requestCode} enviado ao administrador • Aguardando análise
                                            </Typography>
                                        ) : (
                                            <Typography sx={{ fontSize: 11, color: '#6b7280', marginTop: '8px' }}>
                                                Publicado no acervo • Autoria: {item.author}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Coluna 2: Badge de Estado */}
                                    <Box>
                                        <Box
                                            sx={{
                                                display: 'inline-block',
                                                backgroundColor: isPending ? '#fef3c7' : '#e9f4ee',
                                                color: isPending ? '#92400e' : '#006b47',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                borderRadius: '6px',
                                                padding: '3px 10px',
                                            }}
                                        >
                                            {isPending ? 'Pendente' : 'Publicado'}
                                        </Box>
                                    </Box>

                                    {/* Coluna 3: Ações (Editar / Excluir) */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/conteudos/editar/${item.id}`)}
                                            aria-label="Editar contribuição"
                                            sx={{ color: '#006b47' }}
                                        >
                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(item.id)}
                                            aria-label="Excluir contribuição"
                                            sx={{ color: '#b91c1c' }}
                                        >
                                            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default MyContents;