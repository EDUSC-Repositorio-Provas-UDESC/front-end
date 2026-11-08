/**
 * ============================================================================
 * SERVIÇO DE AUTENTICAÇÃO E CADASTRO — UDESC Estuda (Python REST API)
 * ============================================================================
 * Define os contratos REST (`POST /api/auth/login`, `POST /api/auth/register`,
 * `POST /api/auth/logout`) esperados do back-end em Python.
 * Configure `VITE_API_URL=http://localhost:8000/api` no `.env` para conectar ao
 * servidor Python; caso não configurado, utiliza o fallback local.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function requestAuthRest(endpoint, { method = 'POST', body = null, fallback }) {
    if (API_BASE_URL) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.detail || data?.message || 'Erro na requisição de autenticação.');
            }
            return data;
        } catch (err) {
            if (!fallback) throw err;
        }
    }
    return fallback();
}

export const loginService = {
    /**
     * ------------------------------------------------------------------------
     * 1. AUTENTICAÇÃO DE LOGIN (`/`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `POST /api/auth/login`
     * Corpo JSON enviado pelo Front-end:
     * ```json
     * {
     *   "email": "mariana.costa@edu.udesc.br",
     *   "password": "******",
     *   "rememberMe": true
     * }
     * ```
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "success": true,
     *   "user": {
     *     "id": 101,
     *     "name": "Mariana Costa",
     *     "email": "mariana.costa@edu.udesc.br",
     *     "role": "aluno",
     *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *   },
     *   "message": "Bem-vindo de volta! Login efetuado com sucesso."
     * }
     * ```
     */
    login: async (email, password, rememberMe = false) => {
        if (!email || !password) {
            throw new Error('Por favor, informe seu e-mail institucional e sua senha.');
        }

        if (!email.includes('@')) {
            throw new Error('E-mail institucional em formato inválido.');
        }

        if (password.length < 6) {
            throw new Error('A senha deve conter ao menos 6 caracteres.');
        }

        const result = await requestAuthRest('/auth/login', {
            method: 'POST',
            body: { email, password, rememberMe },
            fallback: async () => {
                await new Promise((resolve) => setTimeout(resolve, 400));
                const userData = {
                    id: 101,
                    name: email.split('@')[0],
                    email,
                    role: 'aluno',
                    token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
                };
                return {
                    success: true,
                    user: userData,
                    message: 'Bem-vindo de volta! Login efetuado com sucesso.',
                };
            },
        });

        if (result?.user) {
            localStorage.setItem('udesc_estuda_user', JSON.stringify(result.user));
        }

        return result;
    },

    /**
     * ------------------------------------------------------------------------
     * 2. CADASTRO DE NOVO USUÁRIO (`/sigin`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `POST /api/auth/register`
     * Corpo JSON enviado pelo Front-end:
     * ```json
     * {
     *   "name": "Mariana Costa",
     *   "email": "mariana.costa@edu.udesc.br",
     *   "password": "********",
     *   "course": "cc",
     *   "role": "aluno"
     * }
     * ```
     *
     * Retorno esperado do Back-end Python (Status 201 JSON):
     * ```json
     * {
     *   "success": true,
     *   "user": {
     *     "id": 102,
     *     "name": "Mariana Costa",
     *     "email": "mariana.costa@edu.udesc.br",
     *     "course": "cc",
     *     "role": "aluno",
     *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *   },
     *   "message": "Perfil criado com sucesso! Seja bem-vindo à comunidade."
     * }
     * ```
     */
    register: async ({ name, email, password, course, role, termsAccepted }) => {
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

        return requestAuthRest('/auth/register', {
            method: 'POST',
            body: {
                name: name.trim(),
                email: email.trim(),
                password,
                course,
                role,
            },
            fallback: async () => {
                await new Promise((resolve) => setTimeout(resolve, 400));
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
        });
    },

    /**
     * ------------------------------------------------------------------------
     * 3. ENCERRAR SESSÃO (LOGOUT)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `POST /api/auth/logout`
     * Header: `Authorization: Bearer <token>`
     * Retorno esperado do Back-end Python: `{ "success": true }`
     */
    logout: async () => {
        await requestAuthRest('/auth/logout', {
            method: 'POST',
            fallback: async () => {
                await new Promise((resolve) => setTimeout(resolve, 150));
                return { success: true };
            },
        });
        localStorage.removeItem('udesc_estuda_user');
        return { success: true };
    },

    /**
     * Recupera o usuário autenticado salvo na sessão local.
     */
    getCurrentUser: () => {
        try {
            const stored = localStorage.getItem('udesc_estuda_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    },
};

export default loginService;

