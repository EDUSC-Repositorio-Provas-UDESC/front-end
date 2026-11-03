import React, { useState, useEffect } from 'react';

import SideSectionJoinSite from '../components/side_section_join_site/side_section_join_site';
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
    Checkbox,
    FormControl,
    FormLabel,
    Alert
} from '@mui/material';

function Sigin() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [course, setCourse] = useState('cct-cc');
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
                backgroundColor: '#ffffff',
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
                    backgroundColor: '#ffffff',
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
                            color: '#006b47',
                            textDecoration: 'none',
                            fontSize: '12.5px',
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
                            color: '#111827',
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
                            color: '#6b7280',
                            marginBottom: 'clamp(8px, 1.4vh, 12px)',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                    >
                        Crie seu perfil e faça parte desta comunidade.
                    </Typography>

                    {/* Mensagens de feedback da API */}
                    {errorMessage && (
                        <Alert severity="error" sx={{ marginBottom: '10px', borderRadius: '7px', fontSize: '12px', padding: '4px 10px' }}>
                            {errorMessage}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert severity="success" sx={{ marginBottom: '10px', borderRadius: '7px', fontSize: '12px', padding: '4px 10px' }}>
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
                            helperIcon={<CheckOutlinedIcon sx={{ fontSize: '13px', color: '#006b47' }} />}
                            helperText="E-mail em formato válido."
                            helperColor="#006b47"
                        />

                        {/* Campo: Senha */}
                        <InputField
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            autoComplete="new-password"
                            required
                            helperText="Use ao menos 8 caracteres, incluindo letras e números."
                        />

                        {/* Campo: Curso de graduação */}
                        <ComboBox
                            label="Curso de graduação *"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
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
                            required={true}
                        />

                        {/* Campo: Papel solicitado */}
                        <FormControl fullWidth>
                            <FormLabel
                                sx={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    marginBottom: '3px',
                                    '&.Mui-focused': { color: '#1f2937' },
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
                                        backgroundColor: role === 'aluno' ? '#e9f4ee' : '#ffffff',
                                        border: role === 'aluno' ? '1.5px solid #006b47' : '1px solid #d1d5db',
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
                                            color: '#9ca3af',
                                            '&.Mui-checked': { color: '#006b47' },
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '13px',
                                            fontWeight: role === 'aluno' ? 600 : 500,
                                            color: role === 'aluno' ? '#111827' : '#374151',
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
                                        backgroundColor: role === 'professor' ? '#e9f4ee' : '#ffffff',
                                        border: role === 'professor' ? '1.5px solid #006b47' : '1px solid #d1d5db',
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
                                            color: '#9ca3af',
                                            '&.Mui-checked': { color: '#006b47' },
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '13px',
                                            fontWeight: role === 'professor' ? 600 : 500,
                                            color: role === 'professor' ? '#111827' : '#374151',
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
                                    backgroundColor: '#edf3f8',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                }}
                            >
                                <TaskAltOutlinedIcon
                                    sx={{
                                        fontSize: '18px',
                                        color: '#2563eb',
                                        marginTop: '2px',
                                        flexShrink: 0,
                                    }}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#1e3a5f',
                                            lineHeight: 1.25,
                                        }}
                                    >
                                        O papel de professor é atribuído pela administração
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '11px',
                                            color: '#3b526d',
                                            lineHeight: 1.35,
                                        }}
                                    >
                                        Se solicitar esse papel, seu perfil inicia como aluno até a análise e a associação às disciplinas.
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Checkbox de Termos e Privacidade */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
                            <Checkbox
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                size="small"
                                sx={{
                                    padding: '1px 0 0 0',
                                    color: '#9ca3af',
                                    '&.Mui-checked': { color: '#006b47' },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: '11px',
                                    color: '#374151',
                                    lineHeight: 1.35,
                                }}
                            >
                                Li e aceito os Termos de uso e a Política de privacidade. Comprometo-me a compartilhar apenas materiais autorizados.
                            </Typography>
                        </Box>

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
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginTop: 'clamp(6px, 1.2vh, 12px)',
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