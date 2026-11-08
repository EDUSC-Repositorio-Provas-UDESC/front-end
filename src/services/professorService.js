// ============================================================================
// professorService.js — Funcionalidades do professor (router FastAPI: `professor`)
// ============================================================================
// Todas as rotas exigem `Authorization: Bearer <token>` de um usuário com
// `role == "professor"` → `Depends(require_role("professor"))`.
// Erros comuns a todas as rotas deste arquivo:
// - 401 `"Não autenticado."` (token ausente/inválido/expirado)
// - 403 `"Acesso restrito a professores."`
//
// Sem `VITE_API_URL` os dados abaixo (mock) são retornados. Cliente HTTP,
// convenções e formato de erro: ver `apiClient.js` e `README.md`.
//
// Modelos Pydantic deste domínio:
//
// ```python
// from datetime import datetime
// from typing import Literal
// from pydantic import Field
// from app.schemas.base import CamelModel  # alias_generator=to_camel
//
// class DashboardStatsOut(CamelModel):
//     subjects_count: int
//     subjects_published: int
//     subjects_draft: int
//     activities_published: int
//     activities_draft: int
//     draft_label: str                    # ex.: "1 rascunho para continuar"
//     deliveries_received: int
//     deliveries_total: int
//     pending_delivery_activity: str      # ex.: "Atividade 02 — Limites"
//     to_review: int
//     review_deadline: str                # já formatado, ex.: "23 out."
//
// class ProfessorSubjectOut(CamelModel):
//     id: str                             # código da disciplina, ex.: "CAL1001"
//     name: str
//     course: str                         # ex.: "cc"
//     course_label: str                   # ex.: "Ciência da Computação"
//     semester: str                       # ex.: "2026.2"
//     status: Literal["publicada", "rascunho"]
//     resources_qty: int
//     activities_qty: int
//     draft_note: str | None = None
//
// class CourseOptionOut(CamelModel):
//     value: str                          # id do curso, ex.: "cc"
//     label: str                          # ex.: "Ciência da Computação — CCT"
//
// class SubjectCodeValidationOut(CamelModel):
//     available: bool
//     message: str
//
// SubjectWriteStatus = Literal["rascunho", "publicado"]  # atenção: masculino na escrita
//
// class SubjectCreate(CamelModel):
//     name: str = Field(min_length=1)
//     code: str = Field(min_length=1)     # enviado em maiúsculas, ex.: "CAL2001"
//     course_id: str
//     professor_id: int | str | None = None  # informativo; use o usuário do token
//     description: str = ""
//     status: SubjectWriteStatus
//
// class SubjectCreatedOut(CamelModel):
//     id: str
//     name: str
//     status: SubjectWriteStatus
//     created_at: datetime
//
// class SubjectUpdate(CamelModel):        # todos opcionais (atualização parcial)
//     name: str | None = None
//     code: str | None = None
//     course_id: str | None = None
//     professor_id: int | str | None = None
//     description: str | None = None
//     status: SubjectWriteStatus | None = None
//
// class SubjectUpdatedOut(CamelModel):
//     id: str
//     updated_at: datetime
// ```
// ============================================================================

import { apiRequest } from './apiClient';

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
 * Métricas do painel do professor.
 *
 * **`GET /api/professor/dashboard`** — professor.
 *
 * ```python
 * @router.get("/api/professor/dashboard", response_model=DashboardStatsOut)
 * async def get_dashboard(user = Depends(require_role("professor"))): ...
 * ```
 * Response 200: `DashboardStatsOut`.
 */
export async function getDashboardStats() {
    return apiRequest('/api/professor/dashboard', {
        fallback: () => DASHBOARD_STATS,
    });
}

/**
 * Disciplinas do professor autenticado.
 *
 * **`GET /api/professor/subjects`** — professor.
 *
 * ```python
 * @router.get("/api/professor/subjects", response_model=list[ProfessorSubjectOut])
 * async def list_my_subjects(user = Depends(require_role("professor"))): ...
 * ```
 * Response 200: `list[ProfessorSubjectOut]`, ex.:
 * ```json
 * [{ "id": "CAL1001", "name": "Cálculo I", "course": "cc", "courseLabel": "Ciência da Computação",
 *    "semester": "2026.2", "status": "publicada", "resourcesQty": 24, "activitiesQty": 2 }]
 * ```
 */
export async function getProfessorSubjects() {
    return apiRequest('/api/professor/subjects', {
        fallback: () => PROFESSOR_SUBJECTS,
    });
}

/**
 * Cursos disponíveis para vincular uma nova disciplina.
 *
 * **`GET /api/professor/courses`** — professor.
 *
 * ```python
 * @router.get("/api/professor/courses", response_model=list[CourseOptionOut])
 * async def list_courses(user = Depends(require_role("professor"))): ...
 * ```
 * Response 200: `list[CourseOptionOut]`, ex.: `[{ "value": "cc", "label": "Ciência da Computação — CCT" }]`.
 */
export async function getAvailableCourses() {
    return apiRequest('/api/professor/courses', {
        fallback: () => AVAILABLE_COURSES,
    });
}

/**
 * Verifica se um código de disciplina está livre no curso informado.
 * Não faz requisição quando `code` ou `courseId` estão vazios.
 *
 * **`GET /api/professor/subjects/validate-code?code=CAL2001&courseId=cc`** — professor.
 *
 * ```python
 * # Declare ANTES de qualquer rota "/api/professor/subjects/{id}" com GET.
 * @router.get("/api/professor/subjects/validate-code", response_model=SubjectCodeValidationOut)
 * async def validate_code(
 *     code: str,
 *     course_id: str = Query(alias="courseId"),
 *     user = Depends(require_role("professor")),
 * ): ...
 * ```
 * Response 200 (`SubjectCodeValidationOut`) — indisponível NÃO é erro HTTP:
 * ```json
 * { "available": false, "message": "Código já utilizado neste curso." }
 * ```
 * Erros: 422 (query `code`/`courseId` ausente).
 */
export async function validateSubjectCode(code, courseId) {
    if (!code || !courseId) return { available: false, message: '' };

    return apiRequest('/api/professor/subjects/validate-code', {
        params: { code, courseId },
        fallback: () => {
            const existingCodes = PROFESSOR_SUBJECTS.map((s) => s.id.toUpperCase());
            const available = !existingCodes.includes(code.toUpperCase());
            return {
                available,
                message: available ? '✓ Código disponível neste curso.' : 'Código já utilizado neste curso.',
            };
        },
    });
}

/**
 * Cria uma disciplina para o professor autenticado.
 *
 * **`POST /api/professor/subjects`** — professor.
 *
 * ```python
 * @router.post("/api/professor/subjects", response_model=SubjectCreatedOut, status_code=201)
 * async def create_subject(data: SubjectCreate, user = Depends(require_role("professor"))): ...
 * ```
 * Request (`SubjectCreate`):
 * ```json
 * { "name": "Cálculo II", "code": "CAL2001", "courseId": "cc", "professorId": 101,
 *   "description": "Ementa...", "status": "rascunho" }
 * ```
 * Response 201 (`SubjectCreatedOut`):
 * ```json
 * { "id": "CAL2001", "name": "Cálculo II", "status": "rascunho", "createdAt": "2026-10-20T14:20:00Z" }
 * ```
 * Erros:
 * - 404 `"Curso não encontrado."`
 * - 409 `"Código já utilizado neste curso."`
 * - 422 validação
 */
export async function createSubject(payload) {
    return apiRequest('/api/professor/subjects', {
        method: 'POST',
        body: payload,
        fallback: () => ({
            id: payload.code,
            name: payload.name,
            status: payload.status,
            createdAt: new Date().toISOString(),
        }),
    });
}

/**
 * Atualiza parcialmente uma disciplina do professor.
 *
 * **`PUT /api/professor/subjects/{id}`** — professor (dono da disciplina).
 *
 * ```python
 * @router.put("/api/professor/subjects/{subject_id}", response_model=SubjectUpdatedOut)
 * async def update_subject(subject_id: str, data: SubjectUpdate,
 *                          user = Depends(require_role("professor"))): ...
 * ```
 * Request: `SubjectUpdate` (apenas os campos alterados).
 * Response 200 (`SubjectUpdatedOut`): `{ "id": "CAL2001", "updatedAt": "2026-10-21T09:00:00Z" }`.
 * Erros:
 * - 403 `"Você não é responsável por esta disciplina."`
 * - 404 `"Disciplina não encontrada."`
 * - 409 `"Código já utilizado neste curso."`
 * - 422 validação
 */
export async function updateSubject(id, payload) {
    return apiRequest(`/api/professor/subjects/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: payload,
        fallback: () => ({
            id,
            updatedAt: new Date().toISOString(),
        }),
    });
}
