import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, InputBase, Button } from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import SideBar from '../components/sideBar/sideBar';
import Header from '../components/header/header';
import NotesCard from '../components/common/notesCard/NotesCard';
import subjectService from '../services/subjectService';

/** Filtra a entrada de resultados diretos (números, sinais e separadores decimais/frações). */
function sanitizeDirectResult(value) {
    return value.replace(/[^0-9+\-*/.,^()=\s]/g, '').slice(0, 24);
}

/** Compara em tempo real a resposta direta do aluno com o gabarito. */
function isDirectAnswerCorrect(userAnswer, correctAnswer) {
    const cleanUser = String(userAnswer).trim().replace(',', '.');
    const cleanCorrect = String(correctAnswer).trim().replace(',', '.');
    if (!cleanUser) return false;
    const numUser = Number(cleanUser);
    const numCorrect = Number(cleanCorrect);
    if (!Number.isNaN(numUser) && !Number.isNaN(numCorrect)) {
        return numUser === numCorrect;
    }
    return cleanUser === cleanCorrect;
}

function ContentActivity() {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const data = await subjectService.getContentActivity(id);
            if (isMounted && data) {
                setActivity(data);
                setAnswers({});
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleSelectOption = (questionId, optionId) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    const handleDirectChange = (questionId, rawValue) => {
        setAnswers((prev) => ({ ...prev, [questionId]: sanitizeDirectResult(rawValue) }));
    };

    const questions = activity?.questions || [];
    const hasAnyAnswer = Object.values(answers).some((val) => String(val ?? '').trim() !== '');

    const breadcrumbs = [
        { label: 'Espaço acadêmico', href: '/home' },
        { label: activity?.subjectName, href: `/disciplina/${activity?.subjectTag}` },
        { label: activity?.categoryLabel },
        { label: activity?.shortTitle },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--c-bg)' }}>
            <SideBar defaultActive="atividades" />

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
                        gap: '18px',
                        '& > *': { flexShrink: 0 },
                    }}
                >
                    {/* Cabeçalho: Título e Botão de Reiniciar */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: '14px' }}>
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
                                {activity?.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: 'var(--c-text-muted)', marginTop: '6px' }}>
                                {activity?.description}
                            </Typography>
                        </Box>

                        {hasAnyAnswer && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setAnswers({})}
                                startIcon={<RestartAltIcon fontSize="small" />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.7812rem',
                                    color: 'var(--c-text)',
                                    borderColor: 'var(--c-border)',
                                    backgroundColor: 'var(--c-surface)',
                                    borderRadius: '7px',
                                    height: '36px',
                                    '&:hover': {
                                        borderColor: 'var(--c-primary)',
                                        backgroundColor: 'var(--c-surface-alt)',
                                    },
                                }}
                            >
                                Limpar respostas
                            </Button>
                        )}
                    </Box>

                    {/* Grid Principal: Questões (Esquerda) + Anotações (Direita) */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
                            gap: '20px',
                            alignItems: 'start',
                        }}
                    >
                        {/* COLUNA ESQUERDA: Lista de Questões */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {questions.map((q) => {
                                const userAnswer = answers[q.id] ?? '';
                                const hasDirectInput = q.type === 'direct_result' && userAnswer.trim() !== '';
                                const isDirectCorrect = hasDirectInput && isDirectAnswerCorrect(userAnswer, q.correctAnswer);

                                return (
                                    <Box
                                        key={q.id}
                                        sx={{
                                            backgroundColor: 'var(--c-surface)',
                                            border: '1px solid var(--c-border)',
                                            borderRadius: '12px',
                                            padding: { xs: '18px 16px', md: '22px 24px' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                        }}
                                    >
                                        {/* Cabeçalho da Questão */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                            <Typography sx={{ fontSize: '0.9062rem', fontWeight: 700, color: 'var(--c-text)' }}>
                                                {q.number}. {q.title}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    backgroundColor: 'var(--c-surface-muted)',
                                                    color: 'var(--c-text-secondary)',
                                                    fontSize: '0.6875rem',
                                                    fontWeight: 600,
                                                    borderRadius: '6px',
                                                    padding: '4px 10px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {q.points}
                                            </Box>
                                        </Box>

                                        {/* Enunciado */}
                                        <Typography sx={{ fontSize: '0.8125rem', color: 'var(--c-text-secondary)', lineHeight: 1.5 }}>
                                            {q.statement}
                                        </Typography>

                                        {/* Tipo 1: Múltipla Escolha com Validação em Tempo Real */}
                                        {q.type === 'multiple_choice' && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                                                {q.options.map((opt) => {
                                                    const isSelected = userAnswer === opt.id;
                                                    const isCorrect = opt.id === q.correctAnswer;

                                                    const borderColor = isSelected
                                                        ? isCorrect
                                                            ? 'var(--c-primary)'
                                                            : 'var(--c-danger)'
                                                        : 'var(--c-border)';

                                                    const bgColor = isSelected
                                                        ? isCorrect
                                                            ? 'var(--c-primary-soft)'
                                                            : 'var(--c-danger-soft)'
                                                        : 'var(--c-surface)';

                                                    const statusColor = isCorrect ? 'var(--c-primary)' : 'var(--c-danger)';

                                                    return (
                                                        <Box
                                                            key={opt.id}
                                                            onClick={() => handleSelectOption(q.id, opt.id)}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                gap: '12px',
                                                                padding: '11px 14px',
                                                                borderRadius: '8px',
                                                                border: isSelected ? `1.5px solid ${borderColor}` : '1px solid var(--c-border)',
                                                                backgroundColor: bgColor,
                                                                cursor: 'pointer',
                                                                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                                                                '&:hover': {
                                                                    borderColor: isSelected ? borderColor : 'var(--c-primary)',
                                                                },
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                {isSelected ? (
                                                                    <RadioButtonCheckedIcon sx={{ fontSize: 18, color: statusColor }} />
                                                                ) : (
                                                                    <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: 'var(--c-text-subtle)' }} />
                                                                )}
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: '0.7812rem',
                                                                        fontWeight: isSelected ? 600 : 400,
                                                                        color: 'var(--c-text)',
                                                                    }}
                                                                >
                                                                    {opt.label}
                                                                </Typography>
                                                            </Box>

                                                            {isSelected && (
                                                                <Typography sx={{ fontSize: '0.7188rem', fontWeight: 700, color: statusColor, flexShrink: 0 }}>
                                                                    {isCorrect ? 'Correta ✓' : 'Incorreta ✕'}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}

                                        {/* Tipo 2: Resultado Direto com Validação em Tempo Real */}
                                        {q.type === 'direct_result' && (
                                            <Box sx={{ marginTop: '2px' }}>
                                                <Typography sx={{ fontSize: '0.7188rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '8px' }}>
                                                    Resultado direto (apenas valor numérico)
                                                </Typography>
                                                <InputBase
                                                    fullWidth
                                                    value={userAnswer}
                                                    onChange={(e) => handleDirectChange(q.id, e.target.value)}
                                                    placeholder={q.placeholder || 'Digite apenas o resultado numérico'}
                                                    inputProps={{ inputMode: 'decimal' }}
                                                    endAdornment={
                                                        hasDirectInput ? (
                                                            <Typography
                                                                sx={{
                                                                    fontSize: '0.7188rem',
                                                                    fontWeight: 700,
                                                                    color: isDirectCorrect ? 'var(--c-primary)' : 'var(--c-danger)',
                                                                    whiteSpace: 'nowrap',
                                                                    marginLeft: '10px',
                                                                }}
                                                            >
                                                                {isDirectCorrect ? 'Correta ✓' : 'Incorreta ✕'}
                                                            </Typography>
                                                        ) : null
                                                    }
                                                    sx={{
                                                        border: hasDirectInput
                                                            ? `1.5px solid ${isDirectCorrect ? 'var(--c-primary)' : 'var(--c-danger)'}`
                                                            : '1px solid var(--c-border)',
                                                        borderRadius: '8px',
                                                        padding: '10px 14px',
                                                        fontSize: '0.8125rem',
                                                        color: 'var(--c-text)',
                                                        backgroundColor: hasDirectInput
                                                            ? isDirectCorrect
                                                                ? 'var(--c-primary-soft)'
                                                                : 'var(--c-danger-soft)'
                                                            : 'var(--c-surface)',
                                                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* COLUNA DIREITA: Minhas Anotações */}
                        <NotesCard resourceId={id} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ContentActivity;