// ============================================================================
// loginService.js — Autenticação e cadastro (router FastAPI: `auth`)
// ============================================================================
// Rotas: POST /api/auth/login · POST /api/auth/register · POST /api/auth/logout
//        POST /api/auth/password/forgot · POST /api/auth/password/verify · POST /api/auth/password/reset
// Cliente HTTP, convenções de JSON (camelCase), token e formato de erro:
// ver `apiClient.js` e `README.md` nesta pasta.
//
// Modelos Pydantic deste domínio (definidos uma única vez aqui):
//
// ```python
// from typing import Literal
// from pydantic import EmailStr, Field
// from app.schemas.base import CamelModel  # alias_generator=to_camel
//
// Role = Literal["aluno", "professor", "admin"]
//
// class LoginIn(CamelModel):
//     email: EmailStr
//     password: str = Field(min_length=6)
//     remember_me: bool = False            # JSON: "rememberMe"
//
// class RegisterIn(CamelModel):
//     name: str = Field(min_length=1)
//     email: EmailStr
//     password: str = Field(min_length=8)
//     course: str                          # ex.: "cc"
//     role: Literal["aluno", "professor"] = "aluno"   # "admin" nunca por auto-cadastro
//
// class UserOut(CamelModel):
//     id: int
//     name: str
//     email: EmailStr
//     role: Role
//     course: str | None = None
//     token: str                           # JWT usado em "Authorization: Bearer <token>"
//
// class AuthOut(CamelModel):
//     success: bool = True
//     user: UserOut
//     message: str
//
// # ---- Recuperação de senha ("Esqueci minha senha") ----
// class ForgotPasswordIn(CamelModel):
//     email: EmailStr
//
// class VerifyResetCodeIn(CamelModel):
//     email: EmailStr
//     code: str = Field(pattern=r"^\d{6}$")      # código de 6 dígitos enviado por e-mail
//
// class ResetTokenOut(CamelModel):
//     reset_token: str                          # JSON: "resetToken" (JWT curto, ~15 min, uso único)
//
// class ResetPasswordIn(CamelModel):
//     reset_token: str
//     new_password: str = Field(min_length=8)   # JSON: "newPassword"
//
// class MessageOut(CamelModel):
//     success: bool = True
//     message: str
// ```
// ============================================================================

import { ApiError, apiRequest, getStoredUser, USER_STORAGE_KEY } from './apiClient';

// Mock da recuperação de senha: código fixo para testar sem back-end
export const MOCK_RESET_CODE = '123456';

export const loginService = {
    /**
     * Autentica o usuário e salva `{...user, token}` no `localStorage`.
     *
     * **`POST /api/auth/login`** — público (sem token).
     *
     * ```python
     * @router.post("/api/auth/login", response_model=AuthOut)
     * async def login(data: LoginIn, db: Session = Depends(get_db)) -> AuthOut: ...
     * ```
     *
     * Request (`LoginIn`):
     * ```json
     * { "email": "mariana.costa@edu.udesc.br", "password": "******", "rememberMe": true }
     * ```
     * Response 200 (`AuthOut`):
     * ```json
     * {
     *   "success": true,
     *   "user": { "id": 101, "name": "Mariana Costa", "email": "mariana.costa@edu.udesc.br",
     *             "role": "aluno", "token": "eyJhbGciOiJIUzI1NiIs..." },
     *   "message": "Bem-vindo de volta! Login efetuado com sucesso."
     * }
     * ```
     * Erros:
     * - 401 `"E-mail ou senha incorretos."`
     * - 422 validação (e-mail inválido, senha < 6 caracteres)
     *
     * Mock: e-mails iniciados por "admin" entram como `admin`; os demais como `professor`.
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

        const result = await apiRequest('/api/auth/login', {
            method: 'POST',
            auth: false,
            body: { email, password, rememberMe },
            mockDelay: 400,
            fallback: () => ({
                success: true,
                user: {
                    id: 101,
                    name: email.split('@')[0],
                    email,
                    // Mock: e-mails iniciados por "admin" entram como administrador
                    role: email.toLowerCase().startsWith('admin') ? 'admin' : 'professor',
                    token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
                },
                message: 'Bem-vindo de volta! Login efetuado com sucesso.',
            }),
        });

        if (result?.user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
        }

        return result;
    },

    /**
     * Cadastra um novo usuário (não faz login automático no front-end).
     *
     * **`POST /api/auth/register`** — público (sem token).
     *
     * ```python
     * @router.post("/api/auth/register", response_model=AuthOut, status_code=201)
     * async def register(data: RegisterIn, db: Session = Depends(get_db)) -> AuthOut: ...
     * ```
     *
     * Request (`RegisterIn`) — `termsAccepted` é validado só no front-end e não é enviado:
     * ```json
     * { "name": "Mariana Costa", "email": "mariana.costa@edu.udesc.br",
     *   "password": "********", "course": "cc", "role": "aluno" }
     * ```
     * Response 201 (`AuthOut`; `user.course` preenchido):
     * ```json
     * { "success": true, "user": { "id": 102, "name": "Mariana Costa", "email": "...",
     *   "course": "cc", "role": "aluno", "token": "eyJ..." },
     *   "message": "Perfil criado com sucesso! Seja bem-vindo à comunidade." }
     * ```
     * Erros:
     * - 409 `"Já existe uma conta com este e-mail."`
     * - 422 validação (senha < 8, e-mail inválido, `role` diferente de aluno/professor)
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

        return apiRequest('/api/auth/register', {
            method: 'POST',
            auth: false,
            body: {
                name: name.trim(),
                email: email.trim(),
                password,
                course,
                role,
            },
            mockDelay: 400,
            fallback: () => ({
                success: true,
                user: {
                    id: Date.now(),
                    name: name.trim(),
                    email: email.trim(),
                    course,
                    role,
                    token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
                },
                message: 'Perfil criado com sucesso! Seja bem-vindo à comunidade.',
            }),
        });
    },

    /**
     * Encerra a sessão. A sessão local é sempre removida, mesmo que o servidor falhe.
     *
     * **`POST /api/auth/logout`** — autenticado (qualquer papel).
     *
     * ```python
     * @router.post("/api/auth/logout", status_code=204)
     * async def logout(user: UserOut = Depends(get_current_user)) -> None: ...
     * ```
     * Response: 204 sem corpo (ou 200 `{"success": true}` — o corpo é ignorado).
     * Erros: 401 (token ausente/expirado) — ignorado pelo front-end.
     */
    logout: async () => {
        try {
            await apiRequest('/api/auth/logout', {
                method: 'POST',
                mockDelay: 150,
                fallback: () => ({ success: true }),
            });
        } catch {
            // A sessão local é encerrada mesmo se o servidor estiver indisponível.
        }
        localStorage.removeItem(USER_STORAGE_KEY);
        return { success: true };
    },

    // ------------------------------------------------------------------------
    // RECUPERAÇÃO DE SENHA (`/esqueci-senha`) — 3 etapas:
    //   1. forgot  -> envia um código de 6 dígitos para o e-mail
    //   2. verify  -> troca e-mail + código por um `resetToken` temporário
    //   3. reset   -> define a nova senha usando o `resetToken`
    // ------------------------------------------------------------------------

    /**
     * Etapa 1 — solicita o código de redefinição.
     *
     * **`POST /api/auth/password/forgot`** — público (sem token).
     *
     * ```python
     * @router.post("/api/auth/password/forgot", response_model=MessageOut, status_code=202)
     * async def forgot_password(data: ForgotPasswordIn, background: BackgroundTasks,
     *                           db: Session = Depends(get_db)) -> MessageOut:
     *     user = get_user_by_email(db, data.email)
     *     if user:
     *         code = f"{secrets.randbelow(10**6):06d}"
     *         save_reset_code(db, user.id, hash_code(code), expires_in=timedelta(minutes=15))
     *         background.add_task(send_reset_email, user.email, code)
     *     # Sempre a mesma resposta: não revela se o e-mail está cadastrado
     *     return MessageOut(message="Se o e-mail estiver cadastrado, você receberá um código.")
     * ```
     * Request (`ForgotPasswordIn`): `{ "email": "mariana.costa@edu.udesc.br" }`
     * Response 202 (`MessageOut`): `{ "success": true, "message": "Se o e-mail estiver cadastrado, ..." }`
     * Erros: 422 (e-mail inválido), 429 `"Muitas tentativas. Aguarde alguns minutos."` (rate limit sugerido).
     *
     * Mock: aceita qualquer e-mail; o código é sempre `MOCK_RESET_CODE` ("123456").
     */
    requestPasswordReset: async (email) => {
        const value = String(email || '').trim();
        if (!value || !value.includes('@')) {
            throw new Error('Informe um e-mail institucional válido.');
        }

        return apiRequest('/api/auth/password/forgot', {
            method: 'POST',
            auth: false,
            body: { email: value },
            mockDelay: 500,
            fallback: () => ({
                success: true,
                message: 'Se o e-mail estiver cadastrado, você receberá um código.',
            }),
        });
    },

    /**
     * Etapa 2 — valida o código recebido por e-mail.
     *
     * **`POST /api/auth/password/verify`** — público (sem token).
     *
     * ```python
     * @router.post("/api/auth/password/verify", response_model=ResetTokenOut)
     * async def verify_reset_code(data: VerifyResetCodeIn, db: Session = Depends(get_db)) -> ResetTokenOut:
     *     entry = get_valid_reset_code(db, data.email)          # não expirado e não usado
     *     if not entry or not verify_code(data.code, entry.code_hash):
     *         register_failed_attempt(db, entry)                # bloquear após ~5 tentativas
     *         raise HTTPException(400, "Código inválido ou expirado.")
     *     return ResetTokenOut(reset_token=create_reset_token(entry.user_id))
     * ```
     * Request (`VerifyResetCodeIn`): `{ "email": "mariana.costa@edu.udesc.br", "code": "123456" }`
     * Response 200 (`ResetTokenOut`): `{ "resetToken": "eyJhbGciOi..." }`
     * Erros: 400 `"Código inválido ou expirado."`, 422 (código fora do formato de 6 dígitos).
     */
    verifyResetCode: async (email, code) => {
        const value = String(code || '').trim();
        if (!/^\d{6}$/.test(value)) {
            throw new Error('O código deve ter 6 dígitos.');
        }

        return apiRequest('/api/auth/password/verify', {
            method: 'POST',
            auth: false,
            body: { email: String(email || '').trim(), code: value },
            mockDelay: 400,
            fallback: () => {
                if (value !== MOCK_RESET_CODE) {
                    throw new ApiError('Código inválido ou expirado.', { status: 400 });
                }
                return { resetToken: 'mock-reset-token-' + Math.random().toString(36).substring(2) };
            },
        });
    },

    /**
     * Etapa 3 — define a nova senha.
     *
     * **`POST /api/auth/password/reset`** — público (autorizado pelo `resetToken`).
     *
     * ```python
     * @router.post("/api/auth/password/reset", response_model=MessageOut)
     * async def reset_password(data: ResetPasswordIn, db: Session = Depends(get_db)) -> MessageOut:
     *     user_id = decode_reset_token(data.reset_token)        # 400 se inválido/expirado/já usado
     *     update_password(db, user_id, hash_password(data.new_password))
     *     invalidate_reset_codes(db, user_id)                   # e, idealmente, as sessões ativas
     *     return MessageOut(message="Senha redefinida com sucesso. Entre com a nova senha.")
     * ```
     * Request (`ResetPasswordIn`): `{ "resetToken": "eyJhbGciOi...", "newPassword": "********" }`
     * Response 200 (`MessageOut`): `{ "success": true, "message": "Senha redefinida com sucesso. ..." }`
     * Erros: 400 `"Código de redefinição inválido ou expirado."`, 422 (senha com menos de 8 caracteres).
     */
    resetPassword: async ({ resetToken, newPassword }) => {
        if (!newPassword || newPassword.length < 8) {
            throw new Error('A nova senha deve ter ao menos 8 caracteres.');
        }

        return apiRequest('/api/auth/password/reset', {
            method: 'POST',
            auth: false,
            body: { resetToken, newPassword },
            mockDelay: 500,
            fallback: () => ({
                success: true,
                message: 'Senha redefinida com sucesso. Entre com a nova senha.',
            }),
        });
    },

    /**
     * Recupera o usuário autenticado salvo na sessão local (sem requisição).
     * @returns {{id: number, name: string, email: string, role: string, token: string} | null}
     */
    getCurrentUser: () => getStoredUser(),
};

export default loginService;
