// ============================================================
// professorService.js
// Service responsável pelas funcionalidades exclusivas do professor.
// Todos os métodos documentam o contrato REST esperado do backend Python.
// Quando VITE_API_URL não estiver configurado, usa fallback com dados mock.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Helpers ----

/**
 * Simula uma chamada REST ao backend Python.
 * @param {string} endpoint - Rota da API (e.g. '/api/professor/dashboard')
 * @param {object} options
 * @param {'GET'|'POST'|'PUT'|'DELETE'} options.method
 * @param {object} [options.params]  - Query params
 * @param {object} [options.body]    - Request body (para POST/PUT)
 * @param {*}      options.fallback  - Valor retornado quando API_URL não está definida
 */
async function requestPythonRest(endpoint, { method = 'GET', params, body, fallback }) {
    if (!API_URL) {
        await wait(300);
        return fallback;
    }

    const url = new URL(`${API_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return res.json();
}

// ---- Mock Data ----

const PROFESSOR_SUBJECTS = [
    {
        id: 'CAL1001',
        name: 'Cálculo I',
        course: 'cc',
        courseLabel: 'Ciência da Computação',
        semester: '2026.2',
        status: 'publicada',
        resourcesQty: 24,
        activitiesQty: 2,
    },
    {
        id: 'CAL2001',
        name: 'Cálculo II',
        course: 'cc',
        courseLabel: 'Ciência da Computação',
        semester: '2026.2',
        status: 'rascunho',
        resourcesQty: 0,
        activitiesQty: 0,
        draftNote: 'Preparando ementa e materiais',
    },
];

const DASHBOARD_STATS = {
    subjectsCount: 2,
    subjectsPublished: 1,
    subjectsDraft: 1,
    activitiesPublished: 2,
    activitiesDraft: 1,
    draftLabel: '1 rascunho para continuar',
    deliveriesReceived: 10,
    deliveriesTotal: 24,
    pendingDeliveryActivity: 'Atividade 02 — Limites',
    toReview: 10,
    reviewDeadline: '23 out.',
};

const AVAILABLE_COURSES = [
    { value: 'cc', label: 'Ciência da Computação — CCT' },
    { value: 'ee', label: 'Engenharia Elétrica — CCT' },
    { value: 'si', label: 'Sistemas de Informação — CCT' },
    { value: 'mat', label: 'Matemática — CCT' },
];

// ---- API Methods ----

/**
 * Retorna as métricas do painel do professor.
 *
 * REST: GET /api/professor/dashboard
 * Headers: Authorization: Bearer <token>
 * Response: {
 *   subjectsCount: number,
 *   subjectsPublished: number,
 *   subjectsDraft: number,
 *   activitiesPublished: number,
 *   activitiesDraft: number,
 *   draftLabel: string,
 *   deliveriesReceived: number,
 *   deliveriesTotal: number,
 *   pendingDeliveryActivity: string,
 *   toReview: number,
 *   reviewDeadline: string
 * }
 */
export async function getDashboardStats() {
    return requestPythonRest('/api/professor/dashboard', {
        method: 'GET',
        fallback: DASHBOARD_STATS,
    });
}

/**
 * Retorna as disciplinas do professor autenticado.
 *
 * REST: GET /api/professor/subjects
 * Headers: Authorization: Bearer <token>
 * Response: Array<{
 *   id: string,
 *   name: string,
 *   course: string,
 *   courseLabel: string,
 *   semester: string,
 *   status: 'publicada' | 'rascunho',
 *   resourcesQty: number,
 *   activitiesQty: number,
 *   draftNote?: string
 * }>
 */
export async function getProfessorSubjects() {
    return requestPythonRest('/api/professor/subjects', {
        method: 'GET',
        fallback: PROFESSOR_SUBJECTS,
    });
}

/**
 * Retorna os cursos disponíveis para vinculação de disciplinas.
 *
 * REST: GET /api/professor/courses
 * Headers: Authorization: Bearer <token>
 * Response: Array<{ value: string, label: string }>
 */
export async function getAvailableCourses() {
    return requestPythonRest('/api/professor/courses', {
        method: 'GET',
        fallback: AVAILABLE_COURSES,
    });
}

/**
 * Verifica se um código de disciplina está disponível no curso informado.
 *
 * REST: GET /api/professor/subjects/validate-code?code=CAL2001&courseId=cc
 * Headers: Authorization: Bearer <token>
 * Response: { available: boolean, message: string }
 */
export async function validateSubjectCode(code, courseId) {
    if (!code || !courseId) return { available: false, message: '' };

    const existingCodes = PROFESSOR_SUBJECTS.map((s) => s.id.toUpperCase());
    const available = !existingCodes.includes(code.toUpperCase());

    return requestPythonRest('/api/professor/subjects/validate-code', {
        method: 'GET',
        params: { code, courseId },
        fallback: {
            available,
            message: available
                ? '✓ Código disponível neste curso.'
                : 'Código já utilizado neste curso.',
        },
    });
}

/**
 * Cria uma nova disciplina.
 *
 * REST: POST /api/professor/subjects
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   name: string,
 *   code: string,
 *   courseId: string,
 *   professorId: string,
 *   description: string,
 *   status: 'rascunho' | 'publicado'
 * }
 * Response: {
 *   id: string,
 *   name: string,
 *   status: string,
 *   createdAt: string
 * }
 */
export async function createSubject(payload) {
    return requestPythonRest('/api/professor/subjects', {
        method: 'POST',
        body: payload,
        fallback: {
            id: payload.code,
            name: payload.name,
            status: payload.status,
            createdAt: new Date().toISOString(),
        },
    });
}

/**
 * Atualiza uma disciplina existente.
 *
 * REST: PUT /api/professor/subjects/{id}
 * Headers: Authorization: Bearer <token>
 * Body: {
 *   name?: string,
 *   code?: string,
 *   courseId?: string,
 *   professorId?: string,
 *   description?: string,
 *   status?: 'rascunho' | 'publicado'
 * }
 * Response: { id: string, updatedAt: string }
 */
export async function updateSubject(id, payload) {
    return requestPythonRest(`/api/professor/subjects/${id}`, {
        method: 'PUT',
        body: payload,
        fallback: {
            id,
            updatedAt: new Date().toISOString(),
        },
    });
}

