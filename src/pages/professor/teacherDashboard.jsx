import { useEffect, useState } from 'react';
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
import SideBar from '../../components/sideBar/sideBar';
import Header from '../../components/header/header';
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
                border: '1px solid var(--c-border)',
                height: '100%',
                '&:hover': { boxShadow: '0 2px 12px var(--c-shadow)' },
                transition: 'box-shadow 0.2s',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Typography
                    variant="caption"
                    sx={{ color: 'var(--c-text-muted)', fontWeight: 500, letterSpacing: 0.3, display: 'block', mb: 1 }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, color: 'var(--c-text)', fontSize: { xs: '1.7188rem', sm: '2.1562rem' }, mb: 0.5 }}
                >
                    {value}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: subtitleColor || 'var(--c-text-muted)', fontWeight: 500 }}
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
                border: '1px solid var(--c-border)',
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 2px 12px var(--c-shadow)' },
                transition: 'box-shadow 0.2s',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'var(--c-text-muted)', fontWeight: 600, letterSpacing: 0.5 }}>
                        {subject.id}
                    </Typography>
                    <Chip
                        label={isPublished ? 'Publicada' : 'Rascunho'}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            color: isPublished ? 'var(--c-primary-strong)' : 'var(--c-text-muted)',
                            bgcolor: isPublished ? 'var(--c-primary-soft)' : 'var(--c-surface-muted)',
                            border: 'none',
                        }}
                    />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--c-text)', mb: 0.5 }}>
                    {subject.name}
                </Typography>

                <Typography variant="body2" sx={{ color: 'var(--c-text-muted)', mb: 1.5 }}>
                    {subject.courseLabel} • {subject.semester}
                </Typography>

                <Typography variant="body2" sx={{ color: 'var(--c-text-muted)', mb: 2 }}>
                    {isPublished
                        ? `${subject.resourcesQty} recursos • ${subject.activitiesQty} atividades`
                        : subject.draftNote || 'Rascunho em preparação'}
                </Typography>

                <MuiLink
                    component="button"
                    onClick={() => onClick(subject.id)}
                    underline="hover"
                    sx={{ color: 'var(--c-primary-strong)', fontWeight: 600, fontSize: '0.875rem' }}
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
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                bgcolor: 'var(--c-bg)',
            }}
        >
            <SideBar
                userName={user.name}
                userRole="Professor"
                userInitials={initials}
                defaultActive="painel-professor"
                userRoleKey="professor"
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
                <Header breadcrumbs={[{ label: 'Espaço acadêmico', href: '/home' }, { label: 'Painel do professor' }]} />

                {/* Área de conteúdo rolável (sidebar e header ficam fixos) */}
                <Box component="main" sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    <Box
                        sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            maxWidth: '1100px',
                            mx: 'auto',
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: 'var(--c-primary-strong)' }} />
                            </Box>
                        ) : (
                            <>
                                {/* Cards de Métricas */}
                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                                        <MetricCard
                                            title="Suas disciplinas"
                                            value={String(stats?.subjectsCount ?? 0).padStart(2, '0')}
                                            subtitle={`${stats?.subjectsPublished} publicada • ${stats?.subjectsDraft} em preparação`}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                                        <MetricCard
                                            title="Atividades publicadas"
                                            value={String(stats?.activitiesPublished ?? 0).padStart(2, '0')}
                                            subtitle={stats?.draftLabel}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                                        <MetricCard
                                            title="Entregas recebidas"
                                            value={`${stats?.deliveriesReceived} / ${stats?.deliveriesTotal}`}
                                            subtitle={stats?.pendingDeliveryActivity}
                                            subtitleColor="var(--c-primary-strong)"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
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
                                    sx={{ borderRadius: 3, border: '1px solid var(--c-border)' }}
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
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--c-text)' }}>
                                                Minhas disciplinas
                                            </Typography>
                                            <MuiLink
                                                component="button"
                                                onClick={() => navigate('/professor/criar-materia')}
                                                underline="hover"
                                                sx={{ color: 'var(--c-primary-strong)', fontWeight: 600, fontSize: '0.875rem' }}
                                            >
                                                Criar matéria →
                                            </MuiLink>
                                        </Box>

                                        <Grid container spacing={2}>
                                            {subjects.map((subject) => (
                                                <Grid size={{ xs: 12, md: 6 }} key={subject.id}>
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
            </Box>
        </Box>
    );
}