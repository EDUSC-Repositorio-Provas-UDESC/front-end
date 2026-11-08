import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SideSectionJoinSite from '../components/sideSectionJoinSite/sideSectionJoinSite';
import InputField from '../components/common/InputField';
import PrimaryButton from '../components/common/PrimaryButton';
import loginService from '../services/loginService';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';

import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Divider,
    Alert
} from '@mui/material';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    // Estados de controle da conversa com a service
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: reativar a validação/autenticação abaixo quando o backend estiver pronto.
        navigate('/home');

        // setErrorMessage('');
        // setSuccessMessage('');
        // setLoading(true);

        // try {
        //     const response = await loginService.login(email, password, rememberMe);
        //     setSuccessMessage(response.message);
        //     navigate('/home');
        // } catch (err) {
        //     setErrorMessage(err.message || 'Erro ao realizar login. Tente novamente.');
        // } finally {
        //     setLoading(false);
        // }
    };

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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: { xs: 'auto', md: '100vh' },
                    maxHeight: { xs: 'none', md: '100vh' },
                    overflowY: { xs: 'visible', md: 'auto' },
                    padding: {
                        xs: '32px 20px',
                        sm: '40px 24px',
                        md: 'clamp(14px, 2.2vh, 32px) clamp(24px, 3.5vw, 48px)',
                    },
                    backgroundColor: 'var(--c-surface)',
                    boxSizing: 'border-box',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '460px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >

                    <Typography
                        sx={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: 'var(--c-primary)',
                            letterSpacing: '0.6px',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        BEM-VINDO AO SEU ESPAÇO
                    </Typography>

                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: 'clamp(26px, 3.2vh, 32px)',
                            fontWeight: 700,
                            color: 'var(--c-text)',
                            letterSpacing: '-0.6px',
                            marginBottom: '6px',
                            lineHeight: 1.15,
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        Bom te ver por aqui.
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '0.875rem',
                            color: 'var(--c-text-muted)',
                            marginBottom: '24px',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        Entre para continuar sua jornada de estudos.
                    </Typography>

                    {/* Feedback da API (Erros ou Sucesso) */}
                    {errorMessage && (
                        <Alert severity="error" sx={{ marginBottom: '16px', borderRadius: '7px', fontSize: '0.8125rem' }}>
                            {errorMessage}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert severity="success" sx={{ marginBottom: '16px', borderRadius: '7px', fontSize: '0.8125rem' }}>
                            {successMessage}
                        </Alert>
                    )}

                    {/* Formulário com os campos reutilizáveis */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                        }}
                    >
                        {/* Campo: E-mail institucional */}
                        <InputField
                            label="E-mail institucional"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="conta@edu.udesc.br"
                            autoComplete="email"
                            required
                        />

                        {/* Campo: Senha */}
                        <InputField
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />

                        {/* Linha de Manter conectado + Esqueci minha senha */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '2px',
                                marginBottom: '4px',
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        size="small"
                                        sx={{
                                            padding: '4px',
                                            color: 'var(--c-text-subtle)',
                                            '&.Mui-checked': { color: 'var(--c-primary)' },
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontSize: '0.8125rem', color: 'var(--c-text-secondary)' }}>
                                        Manter conectado
                                    </Typography>
                                }
                                sx={{ margin: 0, gap: '4px' }}
                            />

                            <Box
                                component={RouterLink}
                                to="/esqueci-senha"
                                sx={{
                                    color: 'var(--c-primary)',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Esqueci minha senha
                            </Box>
                        </Box>

                        {/* Botão Principal de Login */}
                        <PrimaryButton
                            type="submit"
                            loading={loading}
                            endIcon={<EastOutlinedIcon sx={{ fontSize: '17px !important' }} />}
                        >
                            Entrar no meu espaço
                        </PrimaryButton>

                        {/* Linha divisória */}
                        <Divider sx={{ my: '18px', borderColor: 'var(--c-border)' }} />

                        {/* Link para cadastro */}
                        <Box
                            sx={{
                                textAlign: 'center',
                                fontSize: '0.8125rem',
                                color: 'var(--c-text-muted)',
                            }}
                        >
                            Primeira vez por aqui?{' '}
                            <Box
                                component="a"
                                href="/sigin"
                                sx={{
                                    color: 'var(--c-primary)',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Criar meu perfil
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Login;