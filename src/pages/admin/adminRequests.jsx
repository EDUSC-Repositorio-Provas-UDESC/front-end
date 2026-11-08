import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, Tabs, Tab, Divider, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrimaryButton from '../../components/common/PrimaryButton';
import AdminLayout, {
    Panel,
    SearchField,
    StatusChip,
    StyledInput,
} from './adminLayout';
import { COLORS, useSearchShortcut } from './adminTheme';
import { getRequests, getRequestsSummary, decideRequest } from '../../services/adminService';

const STATUS_CHIP = {
    pendente: { label: 'Pendente', tone: 'warning' },
    aprovada: { label: 'Aprovada', tone: 'success' },
    rejeitada: { label: 'Rejeitada', tone: 'danger' },
};

// ---- Card da lista de solicitações ----
function RequestCard({ request, selected, onClick }) {
    const chip = STATUS_CHIP[request.status];
    return (
        <Box
            component="button"
            onClick={onClick}
            sx={{
                all: 'unset',
                boxSizing: 'border-box',
                width: '100%',
                display: 'block',
                cursor: 'pointer',
                bgcolor: selected ? COLORS.primarySoft : 'var(--c-surface)',
                border: `${selected ? 2 : 1}px solid ${selected ? COLORS.primary : COLORS.border}`,
                borderRadius: '12px',
                p: 2.5,
                transition: 'border-color 0.2s, box-shadow 0.2s',
                '&:hover': { boxShadow: '0 2px 12px var(--c-shadow)' },
                '&:focus-visible': { outline: `2px solid ${COLORS.primary}`, outlineOffset: 2 },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontSize: '0.72rem', color: COLORS.muted, mt: 0.5 }}>{request.id}</Typography>
                <StatusChip label={chip.label} tone={chip.tone} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: COLORS.text, fontSize: '1.05rem', mb: 1.5 }}>
                {request.title}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: COLORS.muted, mb: 1.5 }}>
                {request.requester.name} • {request.subject}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: COLORS.muted }}>{request.createdAt}</Typography>
        </Box>
    );
}

// ---- Bloco de informação (rótulo + valor + subtítulo) ----
function InfoBlock({ label, value, sub }) {
    return (
        <Box>
            <Typography sx={{ fontSize: '0.68rem', color: COLORS.muted, letterSpacing: '0.04em', mb: 0.5 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: COLORS.text }}>{value}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: COLORS.muted, mt: 0.5 }}>{sub}</Typography>
        </Box>
    );
}

// ---- Painel de revisão ----
function ReviewPanel({ request, onDecide, saving, onClose }) {
    // O componente é remontado (key) a cada solicitação, então o estado inicial basta
    const [justification, setJustification] = useState(request.decisionNote || '');
    const isPending = request.status === 'pendente';

    return (
        <Panel sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', color: COLORS.text }}>
                    {isPending ? 'Revisar solicitação' : 'Detalhes da solicitação'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusChip label={request.id} tone="neutral" />
                    <IconButton size="small" onClick={onClose} aria-label="Fechar" sx={{ display: { md: 'none' } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Typography sx={{ fontWeight: 600, fontSize: { xs: '1.1562rem', md: '1.2812rem' }, color: COLORS.text, mb: 3 }}>
                {request.title}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <InfoBlock
                    label="SOLICITANTE"
                    value={`${request.requester.name} • ${request.requester.role}`}
                    sub={request.requester.email}
                />
                <InfoBlock
                    label="DISCIPLINA / CURSO"
                    value={`${request.subject} • ${request.professor}`}
                    sub={request.course}
                />
            </Box>

            <Divider sx={{ mb: 3, borderColor: COLORS.border }} />

            <Typography sx={{ fontSize: '0.8125rem', color: COLORS.text, mb: 2.5 }}>{request.description}</Typography>

            {/* Arquivo + prévia */}
            <Box sx={{ bgcolor: 'var(--c-surface-muted)', border: `1px solid ${COLORS.border}`, borderRadius: '10px', p: 2.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: request.preview ? 2 : 0 }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 20, color: COLORS.primary }} />
                    <Typography sx={{ fontSize: '0.75rem', color: COLORS.text, flex: 1, wordBreak: 'break-all' }}>
                        {request.file.name} • {request.file.size}
                    </Typography>
                    <IconButton
                        size="small"
                        aria-label="Baixar arquivo"
                        component={request.file.url ? 'a' : 'button'}
                        href={request.file.url}
                        download
                        sx={{ color: COLORS.muted }}
                    >
                        <FileDownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                </Box>

                {request.preview && (
                    <>
                        <Box sx={{ bgcolor: 'var(--c-surface)', p: { xs: 2, md: 3 } }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: COLORS.text, mb: 1.5 }}>
                                {request.preview.heading}
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: COLORS.text, mb: 1.5 }}>
                                {request.preview.body}
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: COLORS.text, mb: 1.5 }}>
                                {request.preview.example}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: COLORS.muted }}>{request.preview.note}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.66rem', color: COLORS.muted, mt: 1.5 }}>
                            Prévia da primeira página • Arquivo completo disponível para revisão
                        </Typography>
                    </>
                )}
            </Box>

            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: COLORS.text, mb: 1 }}>
                Justificativa da decisão
            </Typography>
            {isPending ? (
                <StyledInput
                    value={justification}
                    onChange={setJustification}
                    placeholder="Explique o motivo da aprovação ou rejeição."
                    multiline
                    rows={3}
                />
            ) : (
                <Typography sx={{ fontSize: '0.875rem', color: COLORS.muted }}>
                    {request.decisionNote || 'Sem justificativa registrada.'}
                </Typography>
            )}

            {isPending && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2.5 }}>
                    <PrimaryButton
                        fullWidth={false}
                        startIcon={<CheckIcon />}
                        loading={saving === 'aprovada'}
                        disabled={!!saving}
                        onClick={() => onDecide('aprovada', justification)}
                        sx={{ mt: 0, height: 42, px: 2.5 }}
                    >
                        Aprovar e publicar
                    </PrimaryButton>
                    <Button
                        startIcon={saving === 'rejeitada' ? null : <CloseIcon />}
                        disabled={!!saving}
                        onClick={() => onDecide('rejeitada', justification)}
                        sx={{
                            bgcolor: COLORS.dangerSoft,
                            color: COLORS.danger,
                            borderRadius: '7px',
                            textTransform: 'none',
                            fontWeight: 600,
                            height: 42,
                            px: 2.5,
                            '&:hover': { bgcolor: 'var(--c-danger-soft)' },
                        }}
                    >
                        {saving === 'rejeitada' ? <CircularProgress size={18} color="inherit" /> : 'Rejeitar conteúdo'}
                    </Button>
                </Box>
            )}
        </Panel>
    );
}

// ---- Página Principal ----
const TABS = [
    { value: 'pendente', label: 'Pendentes' },
    { value: 'aprovada', label: 'Aprovadas' },
    { value: 'rejeitada', label: 'Rejeitadas' },
    { value: 'historico', label: 'Histórico' },
];

export default function AdminRequests() {
    const searchRef = useRef(null);
    useSearchShortcut(searchRef);

    const [tab, setTab] = useState('pendente');
    const [query, setQuery] = useState('');
    const [summary, setSummary] = useState({ pendente: 0, aprovada: 0, rejeitada: 0 });
    const [requests, setRequests] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const loadSummary = useCallback(() => getRequestsSummary().then(setSummary).catch(() => {}), []);

    // Carrega a lista (com debounce na busca)
    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await getRequests({ status: tab === 'historico' ? undefined : tab, q: query });
                if (!active) return;
                setRequests(data);
                setSelectedId((prev) => (data.some((r) => r.id === prev) ? prev : data[0]?.id ?? null));
            } finally {
                if (active) setLoading(false);
            }
        }, 250);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [tab, query]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const selected = requests.find((r) => r.id === selectedId);

    const handleDecide = async (decision, justification) => {
        if (!justification.trim()) {
            setFeedback({ type: 'error', text: 'Informe a justificativa da decisão.' });
            return;
        }
        setSaving(decision);
        setFeedback(null);
        try {
            await decideRequest(selected.id, { decision, justification: justification.trim() });
            const remaining = requests.filter((r) => r.id !== selected.id);
            setRequests(remaining);
            setSelectedId(remaining[0]?.id ?? null);
            setFeedback({
                type: 'success',
                text: decision === 'aprovada' ? 'Conteúdo aprovado e publicado no acervo.' : 'Conteúdo rejeitado.',
            });
            loadSummary();
        } catch {
            setFeedback({ type: 'error', text: 'Não foi possível registrar a decisão. Tente novamente.' });
        } finally {
            setSaving(null);
        }
    };

    const tabLabel = (t) => (t.value === 'historico' ? t.label : `${t.label} (${summary[t.value] ?? 0})`);

    return (
        <AdminLayout
            active="solicitacoes"
            breadcrumb="Solicitações"
            title="Solicitações"
            pendingCount={summary.pendente}
        >
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    mb: 3.5,
                    minHeight: 40,
                    '& .MuiTabs-indicator': { bgcolor: COLORS.primary, height: 2 },
                }}
            >
                {TABS.map((t) => (
                    <Tab
                        key={t.value}
                        value={t.value}
                        label={tabLabel(t)}
                        disableRipple
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: COLORS.muted,
                            minHeight: 40,
                            minWidth: 0,
                            px: 0,
                            mr: 3.5,
                            '&.Mui-selected': { color: COLORS.primary, fontWeight: 600 },
                        }}
                    />
                ))}
            </Tabs>

            {feedback && (
                <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 355px) 1fr' },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <SearchField
                        inputRef={searchRef}
                        value={query}
                        onChange={setQuery}
                        placeholder="Buscar título ou solicitante"
                    />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress size={28} sx={{ color: COLORS.primary }} />
                        </Box>
                    ) : requests.length === 0 ? (
                        <Panel sx={{ p: 3, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.875rem', color: COLORS.muted }}>
                                Nenhuma solicitação encontrada.
                            </Typography>
                        </Panel>
                    ) : (
                        requests.map((r) => (
                            <Box key={r.id}>
                                <RequestCard request={r} selected={r.id === selectedId} onClick={() => setSelectedId(r.id)} />
                                {/* No mobile, o painel de revisão aparece logo abaixo do card selecionado */}
                                {r.id === selectedId && (
                                    <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
                                        <ReviewPanel
                                            key={r.id}
                                            request={r}
                                            saving={saving}
                                            onDecide={handleDecide}
                                            onClose={() => setSelectedId(null)}
                                        />
                                    </Box>
                                )}
                            </Box>
                        ))
                    )}
                </Box>

                {/* Painel fixo enquanto a lista rola (header 50px + respiro); rola por dentro se for maior que a tela */}
                <Box
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'sticky',
                        top: 24,
                        maxHeight: 'calc(100vh - 50px - 48px)',
                        overflowY: 'auto',
                        borderRadius: '12px',
                    }}
                >
                    {selected ? (
                        <ReviewPanel
                            key={selected.id}
                            request={selected}
                            saving={saving}
                            onDecide={handleDecide}
                            onClose={() => setSelectedId(null)}
                        />
                    ) : (
                        !loading && (
                            <Panel sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '0.875rem', color: COLORS.muted }}>
                                    Selecione uma solicitação para revisar.
                                </Typography>
                            </Panel>
                        )
                    )}
                </Box>
            </Box>
        </AdminLayout>
    );
}
