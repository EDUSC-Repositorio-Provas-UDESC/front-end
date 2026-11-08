// ============================================================================
// apiClient.js — Cliente HTTP único usado por todos os services do UDESC Estuda
// ============================================================================
//
// CONFIGURAÇÃO
// ------------
// Defina no `.env` (ou `.env.local`) a URL BASE do servidor FastAPI, SEM `/api`:
//
//     VITE_API_URL=http://localhost:8000
//
// Todas as rotas do back-end ficam sob o prefixo `/api/...` e os services já
// escrevem o caminho completo (ex.: `apiRequest('/api/auth/login', ...)`).
// Por segurança, se a variável terminar com `/` ou com `/api`, esse sufixo é
// removido automaticamente para evitar URLs como `/api/api/...`.
//
// Sem `VITE_API_URL` o front-end roda em MODO MOCK: nenhuma requisição é feita,
// a latência é simulada e o `fallback()` de cada chamada é retornado.
//
// CONVENÇÕES DO CONTRATO (resumo — detalhes em `src/services/README.md`)
// ----------------------
// - JSON em camelCase. No FastAPI, use um `CamelModel` (alias_generator=to_camel)
//   para escrever os campos em snake_case no Python e expor camelCase no JSON.
// - Autenticação: header `Authorization: Bearer <token>`. O token vem do campo
//   `token` do usuário salvo em `localStorage['udesc_estuda_user']` (gravado no login).
// - Erros: o front-end entende o formato padrão do FastAPI:
//     HTTPException  -> {"detail": "Mensagem em pt-BR"}
//     422 validação  -> {"detail": [{"loc": ["body", "email"], "msg": "...", "type": "..."}]}
//   e lança um `ApiError` com `status`, `message` (legível em pt-BR) e `details`.
// - 204 No Content: `apiRequest` resolve com `null`.
// ============================================================================

/** Chave do `localStorage` onde o usuário autenticado (com `token`) é salvo. */
export const USER_STORAGE_KEY = 'udesc_estuda_user';

/** Remove barras finais e um eventual sufixo `/api` da URL configurada. */
function normalizeBaseUrl(raw) {
    if (!raw) return '';
    return String(raw).trim().replace(/\/+$/, '').replace(/\/api$/i, '');
}

/** URL base do back-end (ex.: `http://localhost:8000`). Vazia = modo mock. */
export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

/** `true` quando não há back-end configurado e os fallbacks locais são usados. */
export const IS_MOCK_MODE = !API_BASE_URL;

/** Latência padrão simulada no modo mock (ms). */
const DEFAULT_MOCK_DELAY = 300;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Mensagens padrão (pt-BR) usadas quando o back-end não envia `detail`. */
const DEFAULT_MESSAGES = {
    0: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    400: 'Requisição inválida.',
    401: 'Sessão expirada ou credenciais inválidas. Faça login novamente.',
    403: 'Você não tem permissão para realizar esta ação.',
    404: 'Recurso não encontrado.',
    409: 'Conflito: o registro já existe ou foi alterado.',
    422: 'Dados inválidos. Verifique os campos informados.',
    500: 'Erro interno no servidor. Tente novamente mais tarde.',
};

/**
 * Erro lançado por qualquer chamada à API.
 * - `status`: código HTTP (0 = falha de rede).
 * - `message`: texto legível em pt-BR, pronto para exibir na interface.
 * - `details`: corpo do erro (ex.: lista de erros de validação do FastAPI).
 */
export class ApiError extends Error {
    constructor(message, { status = 0, details = null } = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

/** Lê o usuário autenticado salvo no `localStorage` (ou `null`). */
export function getStoredUser() {
    try {
        const stored = localStorage.getItem(USER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

/** Token JWT do usuário autenticado (ou `null`). */
export function getAuthToken() {
    return getStoredUser()?.token || null;
}

/** Monta a URL final com query params, ignorando valores `null`, `undefined` e `''`. */
function buildUrl(path, params) {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    if (!params) return url;

    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach((v) => search.append(key, String(v)));
        } else {
            search.append(key, String(value));
        }
    });
    const qs = search.toString();
    return qs ? `${url}?${qs}` : url;
}

/** Converte um item `{loc, msg}` de validação do FastAPI em texto legível. */
function formatValidationItem(item) {
    if (!item || typeof item !== 'object') return String(item);
    const loc = Array.isArray(item.loc)
        ? item.loc.filter((part) => !['body', 'query', 'path', 'header'].includes(part)).join('.')
        : '';
    return loc ? `${loc}: ${item.msg}` : item.msg;
}

/** Extrai uma mensagem pt-BR do corpo de erro do FastAPI (ou usa o padrão do status). */
function extractErrorMessage(status, data) {
    const detail = data && typeof data === 'object' ? data.detail ?? data.message : data;

    if (typeof detail === 'string' && detail.trim()) return detail;

    if (Array.isArray(detail) && detail.length) {
        const fields = detail.map(formatValidationItem).filter(Boolean).join('; ');
        return `${DEFAULT_MESSAGES[422]} (${fields})`;
    }

    return DEFAULT_MESSAGES[status] || (status >= 500 ? DEFAULT_MESSAGES[500] : `Erro HTTP ${status}.`);
}

/** Lê o corpo da resposta como JSON quando possível; senão, como texto. */
async function parseBody(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/**
 * Executa uma requisição ao back-end FastAPI (ou o mock, se não configurado).
 *
 * @param {string} path - Caminho completo da rota, sempre iniciando em `/api/...`.
 * @param {object} [options]
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method='GET']
 * @param {object} [options.params] - Query params (valores vazios são omitidos).
 * @param {object|FormData} [options.body] - Corpo; objetos são enviados como JSON.
 * @param {boolean} [options.auth=true] - Envia `Authorization: Bearer <token>` se houver token.
 * @param {() => any} [options.fallback] - Gera o retorno no modo mock. Erros lançados
 *   aqui são propagados ao chamador (úteis para simular 409/422 no mock).
 * @param {number} [options.mockDelay=300] - Latência simulada no modo mock (ms).
 * @param {AbortSignal} [options.signal] - Permite cancelar a requisição.
 * @returns {Promise<any>} JSON da resposta; `null` para 204 No Content.
 * @throws {ApiError}
 */
export async function apiRequest(
    path,
    { method = 'GET', params, body, auth = true, fallback, mockDelay = DEFAULT_MOCK_DELAY, signal } = {}
) {
    if (IS_MOCK_MODE) {
        if (typeof fallback !== 'function') {
            throw new ApiError(`VITE_API_URL não configurada e sem fallback para ${method} ${path}.`);
        }
        await wait(mockDelay);
        return fallback();
    }

    const headers = { Accept: 'application/json' };
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body != null && !isFormData) headers['Content-Type'] = 'application/json';

    if (auth) {
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(buildUrl(path, params), {
            method,
            headers,
            body: body == null ? undefined : isFormData ? body : JSON.stringify(body),
            signal,
        });
    } catch (err) {
        if (err?.name === 'AbortError') throw err;
        throw new ApiError(DEFAULT_MESSAGES[0], { status: 0, details: err });
    }

    if (response.status === 204) return null;

    const data = await parseBody(response);
    if (!response.ok) {
        throw new ApiError(extractErrorMessage(response.status, data), {
            status: response.status,
            details: data,
        });
    }
    return data;
}

/** Atalhos por método HTTP. */
export const apiClient = {
    request: apiRequest,
    get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
    post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};

export default apiClient;
