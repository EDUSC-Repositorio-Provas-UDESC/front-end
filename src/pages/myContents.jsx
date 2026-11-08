import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Pagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import PrimaryButton from '../components/common/PrimaryButton';
import subjectService from '../services/subjectService';
import loginService from '../services/loginService';

// Quantidade de contribuições por página
const PAGE_SIZE = 5;

function MyContents() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [userRole, setUserRole] = useState(() => {
        const u = loginService.getCurrentUser();
        return String(u?.role || 'aluno').toLowerCase();
    });

    const loadContributions = async (targetPage = page) => {
        const data = await subjectService.getMyContributions({ page: targetPage, pageSize: PAGE_SIZE });
        // Se a página ficou vazia (ex.: excluiu o último item dela), volta uma página
        if (data.items.length === 0 && targetPage > 1) {
            setPage(targetPage - 1);
            return;
        }
        setItems(data.items);
        setTotal(data.total);
    };

    useEffect(() => {
        loadContributions(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userRole, page]);

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

    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const lastShown = Math.min(page * PAGE_SIZE, total);

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: 'Meus conteúdos' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--c-bg)' }}>
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
                                fontSize: { xs: '1.2812rem', md: '1.5rem' },
                                fontWeight: 700,
                                color: 'var(--c-text)',
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
                                sx={{ height: '36px', fontSize: '0.7812rem', whiteSpace: 'nowrap' }}
                            >
                                Adicionar conteúdo
                            </PrimaryButton>
                        </Box>
                    </Box>

                    {/* Card: Minhas contribuições */}
                    <Box
                        sx={{
                            backgroundColor: 'var(--c-surface)',
                            border: '1px solid var(--c-border)',
                            borderRadius: '14px',
                            padding: { xs: '18px 16px', md: '24px 26px' },
                        }}
                    >
                        {/* Topo do card */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <Typography component="h2" sx={{ fontSize: '0.9688rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                Minhas contribuições
                            </Typography>
                        </Box>

                        {/* Cabeçalho da tabela */}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr auto auto', sm: '1fr 140px 80px' },
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: 'var(--c-bg)',
                                borderRadius: '6px',
                                padding: '8px 14px',
                            }}
                        >
                            <Typography sx={{ fontSize: '0.6562rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.4px' }}>
                                CONTEÚDO / ENVIO
                            </Typography>
                            <Typography sx={{ fontSize: '0.6562rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.4px' }}>
                                ESTADO
                            </Typography>
                            <Typography sx={{ fontSize: '0.6562rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.4px', textAlign: 'right' }}>
                                AÇÕES
                            </Typography>
                        </Box>

                        {/* Lista de itens */}
                        {items.length === 0 && (
                            <Typography sx={{ fontSize: '0.8125rem', color: 'var(--c-text-muted)', padding: '28px 14px', textAlign: 'center' }}>
                                Você ainda não enviou nenhum conteúdo. Clique em &ldquo;Adicionar conteúdo&rdquo; para começar.
                            </Typography>
                        )}

                        {items.map((item) => {
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
                                        borderBottom: '1px solid var(--c-border)',
                                    }}
                                >
                                    {/* Coluna 1: Informações da contribuição */}
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            onClick={() => navigate(item.href)}
                                            sx={{
                                                fontSize: '0.8438rem',
                                                fontWeight: 700,
                                                color: 'var(--c-text)',
                                                cursor: 'pointer',
                                                display: 'inline-block',
                                                '&:hover': { color: 'var(--c-primary)', textDecoration: 'underline' },
                                            }}
                                        >
                                            {item.title}
                                        </Typography>

                                        <Typography sx={{ fontSize: '0.6875rem', color: 'var(--c-text-muted)', marginTop: '3px' }}>
                                            {item.typeLabel} • {item.subjectName} • {item.date}
                                        </Typography>

                                        {isPending ? (
                                            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--c-warning)', marginTop: '8px' }}>
                                                Pedido {item.requestCode} enviado ao administrador • Aguardando análise
                                            </Typography>
                                        ) : (
                                            <Typography sx={{ fontSize: '0.6875rem', color: 'var(--c-text-muted)', marginTop: '8px' }}>
                                                Publicado no acervo • Autoria: {item.author}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Coluna 2: Badge de Estado */}
                                    <Box>
                                        <Box
                                            sx={{
                                                display: 'inline-block',
                                                backgroundColor: isPending ? 'var(--c-warning-soft)' : 'var(--c-primary-soft)',
                                                color: isPending ? 'var(--c-warning)' : 'var(--c-primary)',
                                                fontSize: '0.6875rem',
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
                                            sx={{ color: 'var(--c-primary)' }}
                                        >
                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(item.id)}
                                            aria-label="Excluir contribuição"
                                            sx={{ color: 'var(--c-danger)' }}
                                        >
                                            <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            );
                        })}

                        {/* Rodapé: contagem e paginação */}
                        {total > 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    marginTop: '16px',
                                }}
                            >
                                <Typography sx={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
                                    Exibindo {firstShown}–{lastShown} de {total} {total === 1 ? 'contribuição' : 'contribuições'}
                                </Typography>
                                {pageCount > 1 && (
                                    <Pagination
                                        count={pageCount}
                                        page={page}
                                        onChange={(_, value) => setPage(value)}
                                        shape="rounded"
                                        size="small"
                                        sx={{
                                            '& .MuiPaginationItem-root': { color: 'var(--c-text-muted)', fontWeight: 600 },
                                            '& .MuiPaginationItem-root.Mui-selected': {
                                                backgroundColor: 'var(--c-primary-soft)',
                                                color: 'var(--c-primary)',
                                                '&:hover': { backgroundColor: 'var(--c-primary-soft-hover)' },
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default MyContents;