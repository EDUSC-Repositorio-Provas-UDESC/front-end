import { useState, useEffect } from 'react';

import SideSectionJoinSite from '../components/sideSectionJoinSite/sideSectionJoinSite';
import ComboBox from '../components/common/ComboBox';
import loginService from '../services/loginService';

import InputField from '../components/common/InputField';
import PrimaryButton from '../components/common/PrimaryButton';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';

import {
    Box,
    Typography,
    Radio,
    FormControl,
    FormLabel,
    Alert
} from '@mui/material';

function Sigin() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [course, setCourse] = useState('');
    const [role, setRole] = useState('aluno');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [roleTeacher, setRoleTeacher] = useState(false);

    // Estados para conversa com a service
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (role === 'professor') {
            setRoleTeacher(true);
        } else {
            setRoleTeacher(false);
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Conversa com o serviço de cadastro
            const response = await loginService.register({
                name,
                email,
                password,
                course,
                role,
                termsAccepted
            });

            setSuccessMessage(response.message);
            console.log('Usuário cadastrado com sucesso:', response.user);
        } catch (err) {
            setErrorMessage(err.message || 'Erro ao realizar cadastro.');
        } finally {
            setLoading(false);
        }
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
                        xs: '24px 16px',
                        sm: '32px 24px',
                        md: 'clamp(10px, 1.8vh, 24px) clamp(20px, 3vw, 40px)',
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
                    <Box
                        component="a"
                        href="/"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--c-primary)',
                            textDecoration: 'none',
                            fontSize: '0.7812rem',
                            fontWeight: 600,
                            marginBottom: 'clamp(4px, 1vh, 8px)',
                            cursor: 'pointer',
                            width: 'fit-content',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        <KeyboardBackspaceOutlinedIcon sx={{ fontSize: '16px' }} />
                        Voltar para entrar
                    </Box>

                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: 'clamp(20px, 2.5vh, 26px)',
                            fontWeight: 700,
                            color: 'var(--c-text)',
                            letterSpacing: '-0.5px',
                            marginBottom: '2px',
                            lineHeight: 1.15,
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        Vamos aprender juntos?
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 'clamp(12px, 1.4vh, 13px)',
                            color: 'var(--c-text-muted)',
                            marginBottom: 'clamp(8px, 1.4vh, 12px)',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        Crie seu perfil e faça parte desta comunidade.
                    </Typography>

                    {/* Mensagens de feedback da API */}
                    {errorMessage && (
                        <Alert severity="error" sx={{ marginBottom: '10px', borderRadius: '7px', fontSize: '0.75rem', padding: '4px 10px' }}>
                            {errorMessage}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert severity="success" sx={{ marginBottom: '10px', borderRadius: '7px', fontSize: '0.75rem', padding: '4px 10px' }}>
                            {successMessage}
                        </Alert>
                    )}

                    {/* Formulário com Inputs reutilizados */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(6px, 1vh, 9px)',
                        }}
                    >
                        {/* Campo: Nome completo */}
                        <InputField
                            label="Nome completo"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Digite seu nome completo"
                            autoComplete="name"
                            required
                        />

                        {/* Campo: E-mail institucional */}
                        <InputField
                            label="E-mail institucional"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="conta@edu.udesc.br"
                            autoComplete="email"
                            required
                            helperIcon={<CheckOutlinedIcon sx={{ fontSize: '13px', color: 'var(--c-primary)' }} />}
                            helperColor="var(--c-primary)"
                        />

                        {/* Campo: Senha */}
                        <InputField
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            helperText="Use ao menos 8 caracteres, incluindo letras e números."
                        />

                        {/* Campo: Curso de graduação */}
                        <ComboBox
                            label="Curso de graduação *"
                            value={course}
                            onChange={setCourse}
                            options={[
                                { value: 'cct-cc', label: 'Ciência da Computação — CCT' },
                                { value: 'cct-es', label: 'Engenharia de Software — CCT' },
                                { value: 'cct-ee', label: 'Engenharia Elétrica — CCT' },
                                { value: 'cct-em', label: 'Engenharia Mecânica — CCT' },
                                { value: 'cct-ec', label: 'Engenharia Civil — CCT' },
                                { value: 'cct-lf', label: 'Licenciatura em Física — CCT' },
                                { value: 'cct-lq', label: 'Licenciatura em Química — CCT' },
                                { value: 'cct-lm', label: 'Licenciatura em Matemática — CCT' },
                            ]}
                            placeholder="Selecione seu curso"
                            required
                        />

                        {/* Campo: Papel solicitado */}
                        <FormControl fullWidth>
                            <FormLabel
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--c-text)',
                                    marginBottom: '3px',
                                    '&.Mui-focused': { color: 'var(--c-text)' },
                                }}
                            >
                                Papel solicitado *
                            </FormLabel>

                            <Box sx={{ display: 'flex', gap: '12px' }}>
                                {/* Opção Aluno */}
                                <Box
                                    onClick={() => setRole('aluno')}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: role === 'aluno' ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                                        border: role === 'aluno' ? '1.5px solid var(--c-primary)' : '1px solid var(--c-border-strong)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Radio
                                        checked={role === 'aluno'}
                                        onChange={() => setRole('aluno')}
                                        value="aluno"
                                        name="role-radio"
                                        size="small"
                                        sx={{
                                            padding: 0,
                                            color: 'var(--c-text-subtle)',
                                            '&.Mui-checked': { color: 'var(--c-primary)' },
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '0.8125rem',
                                            fontWeight: role === 'aluno' ? 600 : 500,
                                            color: role === 'aluno' ? 'var(--c-text)' : 'var(--c-text-secondary)',
                                        }}
                                    >
                                        Aluno
                                    </Typography>
                                </Box>

                                {/* Opção Professor */}
                                <Box
                                    onClick={() => setRole('professor')}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '7px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        backgroundColor: role === 'professor' ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                                        border: role === 'professor' ? '1.5px solid var(--c-primary)' : '1px solid var(--c-border-strong)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Radio
                                        checked={role === 'professor'}
                                        onChange={() => setRole('professor')}
                                        value="professor"
                                        name="role-radio"
                                        size="small"
                                        sx={{
                                            padding: 0,
                                            color: 'var(--c-text-subtle)',
                                            '&.Mui-checked': { color: 'var(--c-primary)' },
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '0.8125rem',
                                            fontWeight: role === 'professor' ? 600 : 500,
                                            color: role === 'professor' ? 'var(--c-text)' : 'var(--c-text-secondary)',
                                        }}
                                    >
                                        Professor
                                    </Typography>
                                </Box>
                            </Box>
                        </FormControl>

                        {/* Banner de Informação do Papel de Professor */}
                        {roleTeacher && (
                            <Box
                                sx={{
                                    backgroundColor: 'var(--c-info-soft)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                }}
                            >
                                <TaskAltOutlinedIcon
                                    sx={{
                                        fontSize: '1.125rem',
                                        color: 'var(--c-info)',
                                        marginTop: '2px',
                                        flexShrink: 0,
                                    }}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                    <Typography
                                        sx={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--c-info)',
                                            lineHeight: 1.25,
                                        }}
                                    >
                                        O papel de professor é atribuído pela administração
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.6875rem',
                                            color: 'var(--c-text-secondary)',
                                            lineHeight: 1.35,
                                        }}
                                    >
                                        Se solicitar esse papel, seu perfil inicia como aluno até a análise e a associação às disciplinas.
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Botão Principal com estado de carregamento */}
                        <PrimaryButton
                            type="submit"
                            loading={loading}
                            endIcon={<EastOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                        >
                            Criar meu perfil
                        </PrimaryButton>
                    </Box>

                    {/* Rodapé institucional */}
                    <Typography
                        sx={{
                            fontSize: '0.6875rem',
                            color: 'var(--c-text-subtle)',
                            marginTop: 'clamp(8px, 1.2vh, 12px)',
                            textAlign: 'left',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        © 2026 UDESC Estuda • Privacidade • Precisa de ajuda?
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default Sigin;