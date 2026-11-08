import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Link as MuiLink,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SideBar from '../../components/sideBar/sideBar';
import PrimaryButton from '../../components/common/PrimaryButton';
import { loginService } from '../../services/loginService';
const { getCurrentUser } = loginService;
import { getDashboardStats, getProfessorSubjects } from '../../services/professorService';

// ---- Componente: Card de Métrica ----
function MetricCard({ title, value, subtitle, subtitleColor }) {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                height: '100%',
                '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
                transition: 'box-shadow 0.2s',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Typography
                    variant="caption"
                    sx={{ color: '#6b7280', fontWeight: 500, letterSpacing: 0.3, display: 'block', mb: 1 }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: '#111827', fontSize: { xs: '2rem', sm: '2.5rem' }, mb: 0.5 }}
                >
                    {value}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: subtitleColor || '#6b7280', fontWeight: 500 }}
                >
                    {subtitle}
                </Typography>
            </CardContent>
        </Card>
    );
}

// ---- Componente: Card de Disciplina ----
function SubjectCard({ subject, onClick }) {
    const isPublished = subject.status === 'publicada';

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
                transition: 'box-shadow 0.2s',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, letterSpacing: 0.5 }}>
                        {subject.id}
                    </Typography>
                    <Chip
                        label={isPublished ? 'Publicada' : 'Rascunho'}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            color: isPublished ? '#005c3b' : '#6b7280',
                            bgcolor: isPublished ? '#e8f5e9' : '#f3f4f6',
                            border: 'none',
                        }}
                    />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                    {subject.name}
                </Typography>

                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1.5 }}>
                    {subject.courseLabel} • {subject.semester}
                </Typography>

                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                    {isPublished
                        ? `${subject.resourcesQty} recursos • ${subject.activitiesQty} atividades`
                        : subject.draftNote || 'Rascunho em preparação'}
                </Typography>

                <MuiLink
                    component="button"
                    onClick={() => onClick(subject.id)}
                    underline="hover"
                    sx={{ color: '#005c3b', fontWeight: 600, fontSize: '0.875rem' }}
                >
                    Gerenciar disciplina →
                </MuiLink>
            </CardContent>
        </Card>
    );
}

// ---- Página Principal ----
export default function TeacherDashboard() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const [stats, setStats] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Protege a rota: apenas professor
    useEffect(() => {
        if (!user || user.role !== 'professor') {
            navigate('/home');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!user || user.role !== 'professor') return;

        async function load() {
            try {
                const [statsData, subjectsData] = await Promise.all([
                    getDashboardStats(),
                    getProfessorSubjects(),
                ]);
                setStats(statsData);
                setSubjects(subjectsData);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (!user || user.role !== 'professor') return null;

    const initials = user.name
        ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : 'P';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
            <SideBar
                userName={user.name}
                userRole="Professor"
                userInitials={initials}
                defaultActive="painel-professor"
                userRoleKey="professor"
            />

            <Box
                component="main"
                sx={{
                    flex: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    mt: { xs: '56px', md: 0 },
                    maxWidth: '1100px',
                    mx: 'auto',
                    width: '100%',
                }}
            >
                {/* Breadcrumb */}
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 3 }}>
                    Espaço acadêmico / Painel do professor
                </Typography>

                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 4,
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, color: '#111827', fontSize: { xs: '1.5rem', md: '2rem' } }}
                    >
                        Ensinar também é conectar.
                    </Typography>
                    <PrimaryButton
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/professor/criar-materia')}
                    >
                        Nova atividade
                    </PrimaryButton>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#005c3b' }} />
                    </Box>
                ) : (
                    <>
                        {/* Cards de Métricas */}
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} lg={3}>
                                <MetricCard
                                    title="Suas disciplinas"
                                    value={String(stats?.subjectsCount ?? 0).padStart(2, '0')}
                                    subtitle={`${stats?.subjectsPublished} publicada • ${stats?.subjectsDraft} em preparação`}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <MetricCard
                                    title="Atividades publicadas"
                                    value={String(stats?.activitiesPublished ?? 0).padStart(2, '0')}
                                    subtitle={stats?.draftLabel}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <MetricCard
                                    title="Entregas recebidas"
                                    value={`${stats?.deliveriesReceived} / ${stats?.deliveriesTotal}`}
                                    subtitle={stats?.pendingDeliveryActivity}
                                    subtitleColor="#005c3b"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={3}>
                                <MetricCard
                                    title="Para avaliar"
                                    value={String(stats?.toReview ?? 0)}
                                    subtitle={`Prazo da turma: ${stats?.reviewDeadline}`}
                                />
                            </Grid>
                        </Grid>

                        {/* Seção: Minhas Disciplinas */}
                        <Card
                            variant="outlined"
                            sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 3,
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                                        Minhas disciplinas
                                    </Typography>
                                    <MuiLink
                                        component="button"
                                        onClick={() => navigate('/professor/criar-materia')}
                                        underline="hover"
                                        sx={{ color: '#005c3b', fontWeight: 600, fontSize: '0.875rem' }}
                                    >
                                        Criar matéria →
                                    </MuiLink>
                                </Box>

                                <Grid container spacing={2}>
                                    {subjects.map((subject) => (
                                        <Grid item xs={12} md={6} key={subject.id}>
                                            <SubjectCard
                                                subject={subject}
                                                onClick={(id) => navigate(`/disciplina/${id}`)}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Box>
        </Box>
    );
}