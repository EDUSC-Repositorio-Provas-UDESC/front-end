import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Typography } from '@mui/material';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import SideSectionJoinSite from '../components/sideSectionJoinSite/sideSectionJoinSite';
import InputField from '../components/common/InputField';
import PrimaryButton from '../components/common/PrimaryButton';
import loginService, { MOCK_RESET_CODE } from '../services/loginService';
import { IS_MOCK_MODE } from '../services/apiClient';

// Etapas do fluxo "Esqueci minha senha"
const STEPS = [
    { key: 'email', label: 'E-mail' },
    { key: 'code', label: 'Código' },
    { key: 'password', label: 'Nova senha' },
];

const STEP_TEXT = {
    email: {
        title: 'Vamos recuperar seu acesso.',
        subtitle: 'Informe seu e-mail institucional e enviaremos um código de verificação.',
    },
    code: {
        title: 'Confira seu e-mail.',
        subtitle: 'Digite o código de 6 dígitos que enviamos. Ele vale por 15 minutos.',
    },
    password: {
        title: 'Crie uma nova senha.',
        subtitle: 'Use ao menos 8 caracteres, incluindo letras e números.',
    },
    done: {
        title: 'Senha redefinida!',
        subtitle: 'Tudo certo. Agora é só entrar com a sua nova senha.',
    },
};

const linkSx = {
    color: 'var(--c-primary)',
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
};

// Indicador de progresso (1 · 2 · 3)
function StepIndicator({ current }) {
    const currentIndex = STEPS.findIndex((s) => s.key === current);
    return (
        <Box component="ol" sx={{ display: 'flex', gap: '8px', listStyle: 'none', p: 0, m: '0 0 22px' }}>
            {STEPS.map((step, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                return (
                    <Box component="li" key={step.key} sx={{ flex: 1 }} aria-current={active ? 'step' : undefined}>
                        <Box
                            sx={{
                                height: '4px',
                                borderRadius: '4px',
                                backgroundColor: done || active ? 'var(--c-brand)' : 'var(--c-border)',
                                mb: '6px',
                            }}
                        />
                        <Typography
                            sx={{
                                fontSize: '0.6875rem',
                                fontWeight: active ? 700 : 500,
                                color: active ? 'var(--c-primary)' : 'var(--c-text-muted)',
                            }}
                        >
                            {i + 1}. {step.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState('email'); // 'email' | 'code' | 'password' | 'done'
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    // Executa uma etapa tratando carregamento e mensagens de erro
    const run = async (action) => {
        setErrorMessage('');
        setLoading(true);
        try {
            await action();
        } catch (err) {
            setErrorMessage(err.message || 'Não foi possível concluir. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendCode = (e) => {
        e?.preventDefault();
        run(async () => {
            const result = await loginService.requestPasswordReset(email);
            setInfoMessage(result?.message || 'Se o e-mail estiver cadastrado, você receberá um código.');
            setCode('');
            setStep('code');
        });
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        run(async () => {
            const result = await loginService.verifyResetCode(email, code);
            setResetToken(result.resetToken);
            setInfoMessage('');
            setStep('password');
        });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setErrorMessage('As senhas não coincidem.');
            return;
        }
        run(async () => {
            await loginService.resetPassword({ resetToken, newPassword });
            setStep('done');
        });
    };

    const text = STEP_TEXT[step];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                height: { xs: 'auto', md: '100vh' },
                maxHeight: { xs: 'none', md: '100vh' },
                width: '100vw',
                backgroundColor: 'var(--c-surface)',
                overflow: { xs: 'auto', md: 'hidden' },
                boxSizing: 'border-box',
            }}
        >
            <SideSectionJoinSite />

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowY: { xs: 'visible', md: 'auto' },
                    padding: { xs: '32px 20px', sm: '40px 24px', md: '32px 48px' },
                    backgroundColor: 'var(--c-surface)',
                    boxSizing: 'border-box',
                }}
            >
                <Box sx={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column' }}>
                    <Box component={RouterLink} to="/" sx={{ ...linkSx, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', mb: '24px', alignSelf: 'flex-start' }}>
                        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                        Voltar para o login
                    </Box>

                    <Typography
                        sx={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: 'var(--c-primary)',
                            letterSpacing: '0.6px',
                            textTransform: 'uppercase',
                            mb: '8px',
                        }}
                    >
                        ESQUECI MINHA SENHA
                    </Typography>

                    <Typography
                        component="h1"
                        sx={{ fontSize: { xs: '1.375rem', md: '1.625rem' }, fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-0.5px', lineHeight: 1.2, mb: '6px' }}
                    >
                        {text.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'var(--c-text-muted)', mb: '22px' }}>
                        {text.subtitle}
                    </Typography>

                    {step !== 'done' && <StepIndicator current={step} />}

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: '16px', borderRadius: '7px', fontSize: '0.8125rem' }}>
                            {errorMessage}
                        </Alert>
                    )}
                    {infoMessage && step === 'code' && (
                        <Alert severity="info" sx={{ mb: '16px', borderRadius: '7px', fontSize: '0.8125rem' }}>
                            {infoMessage}
                            {IS_MOCK_MODE && (
                                <>
                                    {' '}Modo de teste: use o código <strong>{MOCK_RESET_CODE}</strong>.
                                </>
                            )}
                        </Alert>
                    )}

                    {/* Etapa 1: e-mail */}
                    {step === 'email' && (
                        <Box component="form" onSubmit={handleSendCode} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <InputField
                                label="E-mail institucional"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="conta@edu.udesc.br"
                                autoComplete="email"
                                autoFocus
                                required
                            />
                            <PrimaryButton type="submit" loading={loading} endIcon={<EastOutlinedIcon />}>
                                Enviar código
                            </PrimaryButton>
                        </Box>
                    )}

                    {/* Etapa 2: código */}
                    {step === 'code' && (
                        <Box component="form" onSubmit={handleVerifyCode} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <InputField
                                label="Código de verificação"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                autoComplete="one-time-code"
                                autoFocus
                                required
                                helperText={`Enviado para ${email}`}
                                inputSx={{ '& .MuiOutlinedInput-input': { letterSpacing: '0.5em', fontSize: '1.1rem', textAlign: 'center' } }}
                                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6 } }}
                            />
                            <PrimaryButton type="submit" loading={loading} disabled={code.length !== 6} endIcon={<EastOutlinedIcon />}>
                                Validar código
                            </PrimaryButton>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '0.8125rem' }}>
                                <Button
                                    onClick={() => {
                                        setStep('email');
                                        setErrorMessage('');
                                    }}
                                    sx={{ ...linkSx, textTransform: 'none', p: 0, minWidth: 0, fontSize: 'inherit' }}
                                >
                                    Trocar e-mail
                                </Button>
                                <Button
                                    onClick={handleSendCode}
                                    disabled={loading}
                                    sx={{ ...linkSx, textTransform: 'none', p: 0, minWidth: 0, fontSize: 'inherit' }}
                                >
                                    Reenviar código
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* Etapa 3: nova senha */}
                    {step === 'password' && (
                        <Box component="form" onSubmit={handleResetPassword} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <InputField
                                label="Nova senha"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                                autoFocus
                                required
                                helperText="Mínimo de 8 caracteres."
                            />
                            <InputField
                                label="Confirmar nova senha"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            <PrimaryButton type="submit" loading={loading} endIcon={<EastOutlinedIcon />}>
                                Redefinir senha
                            </PrimaryButton>
                        </Box>
                    )}

                    {/* Concluído */}
                    {step === 'done' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 40, color: 'var(--c-primary)' }} />
                            <PrimaryButton onClick={() => navigate('/')} endIcon={<EastOutlinedIcon />}>
                                Ir para o login
                            </PrimaryButton>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default ForgotPassword;
