/**
 * Serviço de Autenticação e Cadastro - UDESC Estuda
 * Simula requisições de rede assíncronas (conversas com a API)
 */

export const loginService = {
    /**
     * Simula a autenticação de login
     * @param {string} email
     * @param {string} password
     * @param {boolean} rememberMe
     * @returns {Promise<{ success: boolean, user: object, message: string }>}
     */
    login: async (email, password, rememberMe = false) => {
        // Simulação de delay de rede de 800ms
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!email || !password) {
            throw new Error('Por favor, informe seu e-mail institucional e sua senha.');
        }

        if (!email.includes('@')) {
            throw new Error('E-mail institucional em formato inválido.');
        }

        if (password.length < 6) {
            throw new Error('A senha deve conter ao menos 6 caracteres.');
        }

        // Mock de resposta da API
        const userData = {
            id: 101,
            name: email.split('@')[0],
            email: email,
            role: 'aluno',
            token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
        };

        if (rememberMe) {
            localStorage.setItem('udesc_estuda_user', JSON.stringify(userData));
        }

        return {
            success: true,
            user: userData,
            message: 'Bem-vindo de volta! Login efetuado com sucesso.',
        };
    },

    /**
     * Simula o cadastro de novo perfil no UDESC Estuda
     * @param {object} userData
     * @returns {Promise<{ success: boolean, user: object, message: string }>}
     */
    register: async ({ name, email, password, course, role, termsAccepted }) => {
        // Simulação de delay de rede de 1000ms
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!termsAccepted) {
            throw new Error('É necessário aceitar os Termos de Uso e Política de Privacidade para prosseguir.');
        }

        if (!name?.trim()) {
            throw new Error('Por favor, informe seu nome completo.');
        }

        if (!email || !email.includes('@')) {
            throw new Error('Por favor, insira um e-mail institucional válido.');
        }

        if (!password || password.length < 8) {
            throw new Error('A senha deve possuir no mínimo 8 caracteres.');
        }

        if (!course) {
            throw new Error('Selecione seu curso de graduação.');
        }

        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email.trim(),
            course,
            role,
            token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
        };

        return {
            success: true,
            user: newUser,
            message: 'Perfil criado com sucesso! Seja bem-vindo à comunidade.',
        };
    },

    /**
     * Finaliza a sessão do usuário
     */
    logout: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        localStorage.removeItem('udesc_estuda_user');
        return { success: true };
    },

    /**
     * Recupera o usuário salvo na sessão
     */
    getCurrentUser: () => {
        try {
            const stored = localStorage.getItem('udesc_estuda_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }
};

export default loginService;

