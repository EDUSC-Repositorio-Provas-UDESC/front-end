// ============================================================================
// adminService.js — Funcionalidades do administrador (router FastAPI: `admin`)
// ============================================================================
// Todas as rotas exigem `Authorization: Bearer <token>` de um usuário com
// `role == "admin"` → `Depends(require_role("admin"))`.
// Erros comuns a todas as rotas deste arquivo:
// - 401 `"Não autenticado."` (token ausente/inválido/expirado)
// - 403 `"Acesso restrito a administradores."`
//
// Sem `VITE_API_URL` os dados abaixo (mock) são usados e mantidos em memória
// enquanto a página estiver aberta. Cliente HTTP, convenções e formato de erro:
// ver `apiClient.js` e `README.md`.
//
// Modelos Pydantic deste domínio:
//
// ```python
// from datetime import datetime
// from typing import Literal
// from pydantic import EmailStr, Field
// from app.schemas.base import CamelModel  # alias_generator=to_camel
//
// Role = Literal["aluno", "professor", "admin"]
// RequestStatus = Literal["pendente", "aprovada", "rejeitada"]
// CourseStatus = Literal["ativo", "inativo", "novo"]
// Degree = Literal["bacharelado", "licenciatura", "tecnologo"]
//
// # ---- Solicitações (moderação de conteúdo) ----
// class Requester(CamelModel):
//     name: str
//     role: str                           # rótulo exibido, ex.: "Aluna"
//     email: EmailStr
//
// class RequestFile(CamelModel):
//     name: str                           # ex.: "resumo_limites_mariana.pdf"
//     size: str                           # já formatado, ex.: "842 KB"
//     url: str | None = None
//
// class RequestPreview(CamelModel):
//     heading: str
//     body: str
//     example: str
//     note: str
//
// class ContentRequestOut(CamelModel):
//     id: str                             # ex.: "SOL-024"
//     title: str
//     status: RequestStatus
//     requester: Requester
//     subject: str                        # nome da disciplina
//     professor: str
//     course: str                         # nome do curso
//     created_at: str                     # já formatado, ex.: "20 out. 2026, 14h20"
//     description: str
//     decision_note: str | None = None
//     file: RequestFile
//     preview: RequestPreview | None = None
//
// class RequestsSummaryOut(CamelModel):
//     pendente: int
//     aprovada: int
//     rejeitada: int
//
// class RequestDecisionIn(CamelModel):
//     decision: Literal["aprovada", "rejeitada"]
//     justification: str = ""
//
// class RequestDecisionOut(CamelModel):
//     id: str
//     status: RequestStatus
//     decided_at: datetime
//
// # ---- Cursos ----
// class CampusOption(CamelModel):
//     value: str                          # ex.: "cct"
//     label: str                          # ex.: "CCT — Joinville"
//     short: str                          # ex.: "CCT / Joinville"
//
// class Option(CamelModel):
//     value: str
//     label: str
//
// class CourseOptionsOut(CamelModel):
//     campuses: list[CampusOption]
//     degrees: list[Option]
//
// class CourseOut(CamelModel):
//     id: str                             # ex.: "bcc"
//     name: str
//     code: str                           # ex.: "BCC" (único)
//     degree: Degree
//     campus: str
//     status: CourseStatus
//     subjects_qty: int
//     description: str = ""
//
// class CourseCreate(CamelModel):
//     name: str = Field(min_length=1)
//     code: str = Field(min_length=1)
//     degree: Degree
//     campus: str
//     description: str = ""
//     status: Literal["ativo", "inativo"] = "ativo"   # o mock grava "novo" na criação
//
// class CourseUpdate(CamelModel):         # todos opcionais
//     name: str | None = None
//     code: str | None = None
//     degree: Degree | None = None
//     campus: str | None = None
//     description: str | None = None
//     status: CourseStatus | None = None
//
// # ---- Perfis e permissões ----
// class ProfileCourseOption(CamelModel):
//     value: str                          # id do curso
//     label: str
//     campus_label: str | None = None     # ex.: "CCT"
//
// class ProfileSubjectOption(CamelModel):
//     value: str                          # código, ex.: "CAL1001"
//     label: str                          # ex.: "Cálculo I — CAL1001"
//     name: str
//     course_id: str
//
// class ProfileOptionsOut(CamelModel):
//     roles: list[Option]
//     courses: list[ProfileCourseOption]
//     subjects: list[ProfileSubjectOption]
//
// class ProfileOut(CamelModel):
//     id: int
//     name: str
//     email: EmailStr
//     role: Role
//     gender: Literal["f", "m"]
//     course_id: str
//     subjects: list[str]                 # códigos das disciplinas (professor)
//     teacher_request: bool               # pediu para ser professor
//
// class RoleAssignIn(CamelModel):
//     role: Role
//     subjects: list[str] = []            # ignorado (salvo como []) se role != "professor"
// ```
// ============================================================================

import { apiRequest, ApiError } from './apiClient';

const normalize = (text = '') =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ---- Mock Data ----

let REQUESTS = [
    {
        id: 'SOL-024',
        title: 'Resumo — Limites e continuidade',
        status: 'pendente',
        requester: { name: 'Mariana Costa', role: 'Aluna', email: 'mariana.costa@edu.udesc.br' },
        subject: 'Cálculo I',
        professor: 'Ana Martins',
        course: 'Ciência da Computação',
        createdAt: '20 out. 2026, 14h20',
        description:
            'Resumo autoral sobre limites, limites laterais e continuidade, com exemplos resolvidos para revisão da Prova 1.',
        file: { name: 'resumo_limites_mariana.pdf', size: '842 KB' },
        preview: {
            heading: 'Limites e continuidade',
            body: 'Um limite descreve o comportamento de uma função quando a variável se aproxima de um valor.',
            example: 'Exemplo: lim x → 3 de (x² − 9)/(x − 3) = 6',
            note: 'Após fatorar, simplificamos (x − 3) e avaliamos x + 3. Material autoral de Mariana Costa.',
        },
    },
    {
        id: 'SOL-023',
        title: 'Lista extra — Laços em Python',
        status: 'pendente',
        requester: { name: 'Lucas Ferreira', role: 'Aluno', email: 'lucas.ferreira@edu.udesc.br' },
        subject: 'Algoritmos I',
        professor: 'Rafael Souza',
        course: 'Ciência da Computação',
        createdAt: '19 out. 2026, 18h05',
        description:
            'Lista com 12 exercícios de laços for e while em Python, com gabarito comentado ao final.',
        file: { name: 'lista_lacos_python.pdf', size: '516 KB' },
        preview: {
            heading: 'Lista extra — Laços',
            body: 'Exercício 1: escreva um programa que some os números pares de 1 a 100.',
            example: 'for i in range(2, 101, 2): total += i',
            note: 'Gabarito comentado disponível ao final do arquivo.',
        },
    },
    {
        id: 'SOL-022',
        title: 'Mapa de vetores',
        status: 'pendente',
        requester: { name: 'Juliana Mendes', role: 'Aluna', email: 'juliana.mendes@edu.udesc.br' },
        subject: 'Álgebra Linear',
        professor: 'Ana Martins',
        course: 'Ciência da Computação',
        createdAt: '19 out. 2026, 10h40',
        description:
            'Mapa mental com operações entre vetores, produto escalar, produto vetorial e interpretação geométrica.',
        file: { name: 'mapa_vetores.pdf', size: '1,2 MB' },
        preview: {
            heading: 'Vetores no plano e no espaço',
            body: 'Um vetor é definido por módulo, direção e sentido.',
            example: 'u · v = |u| |v| cos θ',
            note: 'Material autoral de Juliana Mendes.',
        },
    },
    ...Array.from({ length: 12 }, (_, i) => ({
        id: `SOL-${String(21 - i).padStart(3, '0')}`,
        title: `Material aprovado ${i + 1}`,
        status: 'aprovada',
        requester: { name: 'Pedro Santos', role: 'Aluno', email: 'pedro.santos@edu.udesc.br' },
        subject: 'Cálculo I',
        professor: 'Ana Martins',
        course: 'Ciência da Computação',
        createdAt: `${15 - Math.floor(i / 2)} out. 2026, 09h00`,
        description: 'Material revisado e publicado no acervo.',
        decisionNote: 'Material adequado ao conteúdo da disciplina.',
        file: { name: `material_${i + 1}.pdf`, size: '300 KB' },
    })),
    ...Array.from({ length: 2 }, (_, i) => ({
        id: `SOL-${String(9 - i).padStart(3, '0')}`,
        title: `Material rejeitado ${i + 1}`,
        status: 'rejeitada',
        requester: { name: 'Felipe Rocha', role: 'Aluno', email: 'felipe.rocha@edu.udesc.br' },
        subject: 'Algoritmos I',
        professor: 'Rafael Souza',
        course: 'Ciência da Computação',
        createdAt: `0${8 - i} out. 2026, 16h30`,
        description: 'Conteúdo enviado para revisão.',
        decisionNote: 'Conteúdo sem autoria identificada.',
        file: { name: `envio_${i + 1}.pdf`, size: '210 KB' },
    })),
];

let COURSES = [
    { id: 'bcc', name: 'Ciência da Computação', code: 'BCC', degree: 'bacharelado', campus: 'cct', status: 'ativo', subjectsQty: 6, description: 'Formação em fundamentos da computação, desenvolvimento de sistemas e resolução de problemas.' },
    { id: 'eel', name: 'Engenharia Elétrica', code: 'EEL', degree: 'bacharelado', campus: 'cct', status: 'ativo', subjectsQty: 8, description: 'Formação em sistemas elétricos, eletrônica e automação.' },
    { id: 'adm', name: 'Administração', code: 'ADM', degree: 'bacharelado', campus: 'esag', status: 'ativo', subjectsQty: 7, description: 'Formação em gestão de organizações públicas e privadas.' },
    { id: 'eso', name: 'Engenharia de Software', code: 'ESO', degree: 'bacharelado', campus: 'ceavi', status: 'novo', subjectsQty: 0, description: '' },
    { id: 'ecv', name: 'Engenharia Civil', code: 'ECV', degree: 'bacharelado', campus: 'cct', status: 'inativo', subjectsQty: 4, description: 'Formação em projeto, construção e manutenção de obras.' },
];

const CAMPUSES = [
    { value: 'cct', label: 'CCT — Joinville', short: 'CCT / Joinville' },
    { value: 'esag', label: 'ESAG — Florianópolis', short: 'ESAG / Florianópolis' },
    { value: 'ceavi', label: 'CEAVI — Ibirama', short: 'CEAVI / Ibirama' },
    { value: 'cefid', label: 'CEFID — Florianópolis', short: 'CEFID / Florianópolis' },
];

const DEGREES = [
    { value: 'bacharelado', label: 'Bacharelado' },
    { value: 'licenciatura', label: 'Licenciatura' },
    { value: 'tecnologo', label: 'Tecnólogo' },
];

const SUBJECTS = [
    { value: 'ALG1001', label: 'Algoritmos I — ALG1001', name: 'Algoritmos I', courseId: 'bcc' },
    { value: 'CAL1001', label: 'Cálculo I — CAL1001', name: 'Cálculo I', courseId: 'bcc' },
    { value: 'ALI1001', label: 'Álgebra Linear — ALI1001', name: 'Álgebra Linear', courseId: 'bcc' },
    { value: 'EDA2001', label: 'Estrutura de Dados — EDA2001', name: 'Estrutura de Dados', courseId: 'bcc' },
    { value: 'CIR1001', label: 'Circuitos I — CIR1001', name: 'Circuitos I', courseId: 'eel' },
];

let PROFILES = [
    { id: 1, name: 'Mariana Costa', email: 'mariana.costa@edu.udesc.br', role: 'aluno', gender: 'f', courseId: 'bcc', subjects: [], teacherRequest: false },
    { id: 2, name: 'Ana Martins', email: 'ana.martins@udesc.br', role: 'professor', gender: 'f', courseId: 'bcc', subjects: ['CAL1001', 'ALI1001'], teacherRequest: false },
    { id: 3, name: 'Rafael Souza', email: 'rafael.souza@udesc.br', role: 'professor', gender: 'm', courseId: 'bcc', subjects: ['ALG1001'], teacherRequest: false },
    { id: 4, name: 'Felipe Rocha', email: 'felipe.rocha@edu.udesc.br', role: 'aluno', gender: 'm', courseId: 'bcc', subjects: [], teacherRequest: true },
    { id: 5, name: 'Pedro Santos', email: 'pedro.santos@edu.udesc.br', role: 'aluno', gender: 'm', courseId: 'bcc', subjects: [], teacherRequest: false },
    { id: 6, name: 'Carolina Lima', email: 'carolina.lima@udesc.br', role: 'admin', gender: 'f', courseId: 'bcc', subjects: [], teacherRequest: false },
];

const ROLES = [
    { value: 'aluno', label: 'Aluno' },
    { value: 'professor', label: 'Professor' },
    { value: 'admin', label: 'Administrador' },
];


// ============================================================
// SOLICITAÇÕES (moderação de conteúdo)
// ============================================================

/**
 * Total de solicitações por estado (abas e badge da sidebar).
 *
 * **`GET /api/admin/requests/summary`** — admin.
 *
 * ```python
 * # Declare ANTES de rotas "/api/admin/requests/{request_id}" com GET.
 * @router.get("/api/admin/requests/summary", response_model=RequestsSummaryOut)
 * async def requests_summary(user = Depends(require_role("admin"))): ...
 * ```
 * Response 200 (`RequestsSummaryOut`): `{ "pendente": 3, "aprovada": 12, "rejeitada": 2 }`.
 */
export async function getRequestsSummary() {
    return apiRequest('/api/admin/requests/summary', {
        fallback: () => ({
            pendente: REQUESTS.filter((r) => r.status === 'pendente').length,
            aprovada: REQUESTS.filter((r) => r.status === 'aprovada').length,
            rejeitada: REQUESTS.filter((r) => r.status === 'rejeitada').length,
        }),
    });
}

/**
 * Lista as solicitações de publicação de conteúdo.
 *
 * **`GET /api/admin/requests?status=pendente&q=limites`** — admin.
 *
 * ```python
 * @router.get("/api/admin/requests", response_model=list[ContentRequestOut])
 * async def list_requests(
 *     status: RequestStatus | None = None,   # omitido = histórico completo
 *     q: str | None = None,                  # busca em título e nome do solicitante (sem acento)
 *     user = Depends(require_role("admin")),
 * ): ...
 * ```
 * Response 200: `list[ContentRequestOut]`, ex.:
 * ```json
 * [{ "id": "SOL-024", "title": "Resumo — Limites e continuidade", "status": "pendente",
 *    "requester": { "name": "Mariana Costa", "role": "Aluna", "email": "mariana.costa@edu.udesc.br" },
 *    "subject": "Cálculo I", "professor": "Ana Martins", "course": "Ciência da Computação",
 *    "createdAt": "20 out. 2026, 14h20", "description": "...",
 *    "file": { "name": "resumo_limites_mariana.pdf", "size": "842 KB" },
 *    "preview": { "heading": "...", "body": "...", "example": "...", "note": "..." } }]
 * ```
 * Erros: 422 (`status` fora do enum).
 */
export async function getRequests({ status, q } = {}) {
    return apiRequest('/api/admin/requests', {
        params: { status, q },
        fallback: () => {
            const term = normalize(q);
            return REQUESTS.filter((r) => !status || r.status === status).filter(
                (r) =>
                    !term ||
                    normalize(r.title).includes(term) ||
                    normalize(r.requester.name).includes(term)
            );
        },
    });
}

/**
 * Registra a decisão do administrador sobre uma solicitação.
 *
 * **`PATCH /api/admin/requests/{id}`** — admin.
 *
 * ```python
 * @router.patch("/api/admin/requests/{request_id}", response_model=RequestDecisionOut)
 * async def decide_request(request_id: str, data: RequestDecisionIn,
 *                          user = Depends(require_role("admin"))): ...
 * ```
 * Request (`RequestDecisionIn`): `{ "decision": "rejeitada", "justification": "Conteúdo sem autoria identificada." }`
 * Response 200 (`RequestDecisionOut`): `{ "id": "SOL-024", "status": "rejeitada", "decidedAt": "2026-10-21T10:00:00Z" }`
 * Erros:
 * - 404 `"Solicitação não encontrada."`
 * - 409 `"Esta solicitação já foi decidida."`
 * - 422 validação (`decision` fora do enum)
 */
export async function decideRequest(id, { decision, justification }) {
    return apiRequest(`/api/admin/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { decision, justification },
        fallback: () => {
            REQUESTS = REQUESTS.map((r) =>
                r.id === id ? { ...r, status: decision, decisionNote: justification } : r
            );
            return { id, status: decision, decidedAt: new Date().toISOString() };
        },
    });
}

// ============================================================
// CURSOS
// ============================================================

/**
 * Opções auxiliares do formulário de curso.
 *
 * **`GET /api/admin/courses/options`** — admin.
 *
 * ```python
 * @router.get("/api/admin/courses/options", response_model=CourseOptionsOut)
 * async def course_options(user = Depends(require_role("admin"))): ...
 * ```
 * Response 200 (`CourseOptionsOut`):
 * ```json
 * { "campuses": [{ "value": "cct", "label": "CCT — Joinville", "short": "CCT / Joinville" }],
 *   "degrees": [{ "value": "bacharelado", "label": "Bacharelado" }] }
 * ```
 */
export async function getCourseOptions() {
    return apiRequest('/api/admin/courses/options', {
        fallback: () => ({ campuses: CAMPUSES, degrees: DEGREES }),
    });
}

/**
 * Lista os cursos de graduação.
 *
 * **`GET /api/admin/courses?q=computação`** — admin.
 *
 * ```python
 * @router.get("/api/admin/courses", response_model=list[CourseOut])
 * async def list_courses(q: str | None = None,   # busca em nome e código (sem acento)
 *                        user = Depends(require_role("admin"))): ...
 * ```
 * Response 200: `list[CourseOut]`, ex.:
 * ```json
 * [{ "id": "bcc", "name": "Ciência da Computação", "code": "BCC", "degree": "bacharelado",
 *    "campus": "cct", "status": "ativo", "subjectsQty": 6, "description": "..." }]
 * ```
 */
export async function getCourses({ q } = {}) {
    return apiRequest('/api/admin/courses', {
        params: { q },
        fallback: () => {
            const term = normalize(q);
            return COURSES.filter(
                (c) => !term || normalize(c.name).includes(term) || normalize(c.code).includes(term)
            );
        },
    });
}

/**
 * Cria um curso de graduação.
 *
 * **`POST /api/admin/courses`** — admin.
 *
 * ```python
 * @router.post("/api/admin/courses", response_model=CourseOut, status_code=201)
 * async def create_course(data: CourseCreate, user = Depends(require_role("admin"))): ...
 * ```
 * Request (`CourseCreate`):
 * ```json
 * { "name": "Engenharia de Software", "code": "ESO", "degree": "bacharelado",
 *   "campus": "ceavi", "description": "", "status": "ativo" }
 * ```
 * Response 201: `CourseOut` (o front-end usa `id` para abrir o editor do curso criado).
 * Erros:
 * - 409 `"Já existe um curso com este código."` (comparação sem diferenciar maiúsculas)
 * - 422 validação
 */
export async function createCourse(payload) {
    return apiRequest('/api/admin/courses', {
        method: 'POST',
        body: payload,
        fallback: () => {
            if (COURSES.some((c) => c.code.toUpperCase() === payload.code.toUpperCase())) {
                throw new ApiError('Já existe um curso com este código.', { status: 409 });
            }
            const course = { ...payload, id: payload.code.toLowerCase(), subjectsQty: 0, status: 'novo' };
            COURSES = [...COURSES, course];
            return course;
        },
    });
}

/**
 * Atualiza um curso de graduação.
 *
 * **`PUT /api/admin/courses/{id}`** — admin.
 *
 * ```python
 * @router.put("/api/admin/courses/{course_id}", response_model=CourseOut)
 * async def update_course(course_id: str, data: CourseUpdate,
 *                         user = Depends(require_role("admin"))): ...
 * ```
 * Request: `CourseUpdate` (a tela envia o formulário completo, mesmo formato de `CourseCreate`).
 * Response 200: `CourseOut` atualizado.
 * Erros:
 * - 404 `"Curso não encontrado."`
 * - 409 `"Já existe um curso com este código."`
 * - 422 validação
 */
export async function updateCourse(id, payload) {
    return apiRequest(`/api/admin/courses/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: payload,
        fallback: () => {
            if (COURSES.some((c) => c.id !== id && c.code.toUpperCase() === payload.code?.toUpperCase())) {
                throw new ApiError('Já existe um curso com este código.', { status: 409 });
            }
            COURSES = COURSES.map((c) => (c.id === id ? { ...c, ...payload } : c));
            return COURSES.find((c) => c.id === id);
        },
    });
}

/**
 * Exclui um curso de graduação.
 *
 * **`DELETE /api/admin/courses/{id}`** — admin.
 *
 * ```python
 * @router.delete("/api/admin/courses/{course_id}", status_code=204)
 * async def delete_course(course_id: str, user = Depends(require_role("admin"))) -> None: ...
 * ```
 * Response: 204 sem corpo (o front-end retorna `{ success: true }` aos chamadores).
 * Erros:
 * - 404 `"Curso não encontrado."`
 * - 409 `"Não é possível excluir um curso com disciplinas vinculadas."` (sugerido)
 */
export async function deleteCourse(id) {
    const result = await apiRequest(`/api/admin/courses/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        fallback: () => {
            COURSES = COURSES.filter((c) => c.id !== id);
            return { success: true };
        },
    });
    return result ?? { success: true };
}

// ============================================================
// PERFIS E PERMISSÕES
// ============================================================

/**
 * Opções auxiliares da tela de perfis (papéis, cursos e disciplinas).
 *
 * **`GET /api/admin/profiles/options`** — admin.
 *
 * ```python
 * @router.get("/api/admin/profiles/options", response_model=ProfileOptionsOut)
 * async def profile_options(user = Depends(require_role("admin"))): ...
 * ```
 * Response 200 (`ProfileOptionsOut`):
 * ```json
 * { "roles": [{ "value": "professor", "label": "Professor" }],
 *   "courses": [{ "value": "bcc", "label": "Ciência da Computação", "campusLabel": "CCT" }],
 *   "subjects": [{ "value": "CAL1001", "label": "Cálculo I — CAL1001", "name": "Cálculo I", "courseId": "bcc" }] }
 * ```
 */
export async function getProfileOptions() {
    return apiRequest('/api/admin/profiles/options', {
        fallback: () => ({
            roles: ROLES,
            courses: COURSES.map((c) => ({
                value: c.id,
                label: c.name,
                campusLabel: CAMPUSES.find((p) => p.value === c.campus)?.value.toUpperCase(),
            })),
            subjects: SUBJECTS,
        }),
    });
}

/**
 * Lista os perfis cadastrados.
 *
 * **`GET /api/admin/profiles?q=rafael&role=professor&courseId=bcc`** — admin.
 *
 * ```python
 * @router.get("/api/admin/profiles", response_model=list[ProfileOut])
 * async def list_profiles(
 *     q: str | None = None,                         # busca em nome e e-mail (sem acento)
 *     role: Role | None = None,
 *     course_id: str | None = Query(None, alias="courseId"),
 *     user = Depends(require_role("admin")),
 * ): ...
 * ```
 * Response 200: `list[ProfileOut]`, ex.:
 * ```json
 * [{ "id": 3, "name": "Rafael Souza", "email": "rafael.souza@udesc.br", "role": "professor",
 *    "gender": "m", "courseId": "bcc", "subjects": ["ALG1001"], "teacherRequest": false }]
 * ```
 */
export async function getProfiles({ q, role, courseId } = {}) {
    return apiRequest('/api/admin/profiles', {
        params: { q, role, courseId },
        fallback: () => {
            const term = normalize(q);
            return PROFILES.filter((p) => !role || p.role === role)
                .filter((p) => !courseId || p.courseId === courseId)
                .filter(
                    (p) => !term || normalize(p.name).includes(term) || normalize(p.email).includes(term)
                );
        },
    });
}

/**
 * Atribui um papel a um perfil e associa disciplinas (quando professor).
 * Também zera `teacherRequest`.
 *
 * **`PUT /api/admin/profiles/{id}/role`** — admin.
 *
 * ```python
 * @router.put("/api/admin/profiles/{profile_id}/role", response_model=ProfileOut)
 * async def assign_role(profile_id: int, data: RoleAssignIn,
 *                       user = Depends(require_role("admin"))): ...
 * ```
 * Request (`RoleAssignIn`): `{ "role": "professor", "subjects": ["CAL1001", "ALI1001"] }`
 * Response 200: `ProfileOut` atualizado.
 * Erros:
 * - 404 `"Perfil não encontrado."` / `"Disciplina não encontrada: XYZ1001."`
 * - 422 validação (`role` fora do enum)
 */
export async function assignRole(id, { role, subjects }) {
    return apiRequest(`/api/admin/profiles/${encodeURIComponent(id)}/role`, {
        method: 'PUT',
        body: { role, subjects },
        fallback: () => {
            PROFILES = PROFILES.map((p) =>
                p.id === id
                    ? { ...p, role, subjects: role === 'professor' ? subjects : [], teacherRequest: false }
                    : p
            );
            return PROFILES.find((p) => p.id === id);
        },
    });
}

/**
 * Remove um perfil da plataforma.
 *
 * **`DELETE /api/admin/profiles/{id}`** — admin.
 *
 * ```python
 * @router.delete("/api/admin/profiles/{profile_id}", status_code=204)
 * async def delete_profile(profile_id: int, user = Depends(require_role("admin"))) -> None: ...
 * ```
 * Response: 204 sem corpo (o front-end retorna `{ success: true }` aos chamadores).
 * Erros:
 * - 403 `"Você não pode remover o próprio perfil."`
 * - 404 `"Perfil não encontrado."`
 */
export async function deleteProfile(id) {
    const result = await apiRequest(`/api/admin/profiles/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        fallback: () => {
            PROFILES = PROFILES.filter((p) => p.id !== id);
            return { success: true };
        },
    });
    return result ?? { success: true };
}
