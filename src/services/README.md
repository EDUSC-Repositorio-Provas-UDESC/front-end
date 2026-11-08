# Camada de serviços — contrato com o back-end (FastAPI)

Esta pasta é o **contrato** entre o front-end (React + Vite) e o back-end em **Python / FastAPI**.
Cada função exportada corresponde a uma rota REST e tem um JSDoc com:

- método + caminho, autenticação e papel exigido (`aluno`, `professor`, `admin`);
- modelos Pydantic de entrada/saída (definidos uma vez no topo de cada arquivo) e a assinatura da rota FastAPI;
- exemplos de JSON e os códigos de erro esperados com a mensagem de `detail`.

| Arquivo | Domínio | Router sugerido |
|---|---|---|
| `apiClient.js` | Cliente HTTP compartilhado (URL, token, erros, mock) | — |
| `loginService.js` | Login, cadastro, logout | `app/routers/auth.py` |
| `subjectService.js` | Disciplinas, conteúdos, contribuições, anotações | `subjects.py`, `contents.py`, `contributions.py`, `annotations.py` |
| `professorService.js` | Painel e disciplinas do professor | `professor.py` |
| `adminService.js` | Moderação, cursos, perfis | `admin.py` |

## Configuração

```env
# .env.local (front-end)
VITE_API_URL=http://localhost:8000
```

- `VITE_API_URL` é a URL **base** do servidor, **sem** `/api`. Todas as rotas já são escritas com o prefixo completo (`/api/...`).
  Se alguém configurar `http://localhost:8000/api`, o sufixo `/api` (e barras finais) é removido automaticamente.
- **Sem `VITE_API_URL` o front-end roda em modo mock**: nenhuma requisição é feita, a latência é simulada e cada
  função retorna dados locais com o mesmo formato JSON documentado. Útil para desenvolver as telas sem o back-end.
- Com `VITE_API_URL` definida **não há fallback silencioso**: erros do servidor chegam à tela.

## Convenções

### JSON em camelCase

O front-end envia e espera **camelCase** (`resourcesQty`, `courseId`, `pageSize`). No Python use snake_case com um modelo
base que gera os aliases automaticamente:

```python
# app/schemas/base.py
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
```

O FastAPI serializa `response_model` por alias por padrão (`response_model_by_alias=True`). Para **query params**
em camelCase use `Query(alias=...)`, ex.: `page_size: int = Query(5, alias="pageSize")`.

Datas exibidas na tela já vêm **formatadas em pt-BR** (`"20 out. 2026"`, `"20 out. 2026, às 14h20"`); campos
`createdAt`/`updatedAt`/`decidedAt` são ISO 8601 (`datetime`).

### Autenticação

- `POST /api/auth/login` devolve `user.token` (JWT). O front-end salva o objeto `user` em
  `localStorage['udesc_estuda_user']`.
- Toda requisição seguinte envia `Authorization: Bearer <token>` (login e cadastro não enviam).
- Papéis: `aluno`, `professor`, `admin`. Cada rota indica o papel exigido no JSDoc.

### Formato de erro

Use o formato padrão do FastAPI — o `apiClient` já o interpreta:

```json
// HTTPException(status_code=409, detail="Já existe um curso com este código.")
{ "detail": "Já existe um curso com este código." }

// 422 de validação (gerado pelo FastAPI)
{ "detail": [{ "loc": ["body", "email"], "msg": "value is not a valid email address", "type": "value_error" }] }
```

No front-end isso vira um `ApiError` com `status`, `message` e `details`. **Escreva `detail` em pt-BR**: ele é
exibido diretamente ao usuário. Para 422 a mensagem vira `"Dados inválidos. Verifique os campos informados. (email: ...)"`.

| Status | Quando | `detail` padrão sugerido |
|---|---|---|
| 401 | Token ausente, inválido ou expirado; login incorreto | `"Não autenticado."` / `"E-mail ou senha incorretos."` |
| 403 | Papel sem permissão ou recurso de outro usuário | `"Acesso restrito a administradores."` |
| 404 | Registro inexistente | `"Curso não encontrado."` |
| 409 | Conflito de unicidade/estado | `"Já existe um curso com este código."` |
| 422 | Validação de body/query/path | gerado pelo FastAPI |

### Respostas vazias

`204 No Content` é aceito (o cliente resolve com `null`). Exceção: `DELETE` de anotação deve devolver a lista
restante de notas (200), pois a tela usa o retorno.

## Tabela de endpoints

| Método | Caminho | Papel | Função (arquivo) |
|---|---|---|---|
| POST | `/api/auth/login` | público | `loginService.login` (login) |
| POST | `/api/auth/register` | público | `loginService.register` (login) |
| POST | `/api/auth/logout` | autenticado | `loginService.logout` (login) |
| POST | `/api/auth/password/forgot` | público | `loginService.requestPasswordReset` (esqueci-senha) |
| POST | `/api/auth/password/verify` | público | `loginService.verifyResetCode` (esqueci-senha) |
| POST | `/api/auth/password/reset` | público | `loginService.resetPassword` (esqueci-senha) |
| GET | `/api/subjects/favorites` | autenticado | `subjectService.getFavorites` |
| GET | `/api/subjects/all` | autenticado | `subjectService.getAllSubjects` |
| GET | `/api/subjects/filters` | autenticado | `subjectService.getFilterOptions` |
| GET | `/api/subjects` | autenticado | `subjectService.getCatalog` |
| GET | `/api/subjects/{tag}` | autenticado | `subjectService.getSubject` |
| GET | `/api/subjects/{tag}/resources` | autenticado | `subjectService.getResources` |
| GET | `/api/contents/pdf/{id}` | autenticado | `subjectService.getContentPDF` / `getResourceById` |
| GET | `/api/contents/link/{id}` | autenticado | `subjectService.getContentLink` |
| GET | `/api/contents/activity/{id}` | autenticado | `subjectService.getContentActivity` |
| GET | `/api/contributions/me?page=&pageSize=` | aluno, professor | `subjectService.getMyContributions` (paginado) |
| GET | `/api/contributions/{id}` | aluno, professor (autor) | `subjectService.getContributionById` |
| POST | `/api/contributions` | aluno, professor | `subjectService.saveContribution` (sem `id`) |
| PUT | `/api/contributions/{id}` | aluno, professor (autor) | `subjectService.saveContribution` (com `id`) |
| DELETE | `/api/contributions/{id}` | aluno, professor (autor) | `subjectService.deleteContribution` |
| GET | `/api/annotations` | autenticado | `subjectService.getAnnotatedResources` |
| GET | `/api/annotations/{resourceId}` | autenticado | `subjectService.getAnnotatedResourceById` |
| GET | `/api/annotations/{resourceId}/notes` | autenticado | `subjectService.getNotes` |
| POST | `/api/annotations/{resourceId}/notes` | autenticado | `subjectService.saveNote` |
| DELETE | `/api/annotations/{resourceId}/notes/{noteId}` | autenticado (dono) | `subjectService.deleteNote` |
| GET | `/api/professor/dashboard` | professor | `getDashboardStats` (professor) |
| GET | `/api/professor/subjects` | professor | `getProfessorSubjects` (professor) |
| GET | `/api/professor/courses` | professor | `getAvailableCourses` (professor) |
| GET | `/api/professor/subjects/validate-code` | professor | `validateSubjectCode` (professor) |
| POST | `/api/professor/subjects` | professor | `createSubject` (professor) |
| PUT | `/api/professor/subjects/{id}` | professor (dono) | `updateSubject` (professor) |
| GET | `/api/admin/requests/summary` | admin | `getRequestsSummary` (admin) |
| GET | `/api/admin/requests` | admin | `getRequests` (admin) |
| PATCH | `/api/admin/requests/{id}` | admin | `decideRequest` (admin) |
| GET | `/api/admin/courses/options` | admin | `getCourseOptions` (admin) |
| GET | `/api/admin/courses` | admin | `getCourses` (admin) |
| POST | `/api/admin/courses` | admin | `createCourse` (admin) |
| PUT | `/api/admin/courses/{id}` | admin | `updateCourse` (admin) |
| DELETE | `/api/admin/courses/{id}` | admin | `deleteCourse` (admin) |
| GET | `/api/admin/profiles/options` | admin | `getProfileOptions` (admin) |
| GET | `/api/admin/profiles` | admin | `getProfiles` (admin) |
| PUT | `/api/admin/profiles/{id}/role` | admin | `assignRole` (admin) |
| DELETE | `/api/admin/profiles/{id}` | admin | `deleteProfile` (admin) |

> **Ordem das rotas no FastAPI:** rotas fixas devem ser declaradas antes das paramétricas do mesmo prefixo —
> `/api/subjects/favorites|all|filters` antes de `/api/subjects/{tag}` e `/api/contributions/me` antes de
> `/api/contributions/{id}`.

## Esqueleto mínimo do projeto FastAPI

```text
backend/
├── app/
│   ├── main.py
│   ├── deps.py              # get_db, get_current_user, require_role
│   ├── schemas/
│   │   ├── base.py          # CamelModel
│   │   ├── auth.py          # LoginIn, RegisterIn, UserOut, AuthOut
│   │   ├── subjects.py      # ... (modelos de subjectService.js)
│   │   ├── professor.py
│   │   └── admin.py
│   └── routers/
│       ├── auth.py
│       ├── subjects.py      # subjects + contents + contributions + annotations (ou separe)
│       ├── professor.py
│       └── admin.py
└── requirements.txt         # fastapi, uvicorn[standard], pydantic[email], pyjwt
```

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, subjects, professor, admin

app = FastAPI(title="UDESC Estuda API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],                       # inclui Authorization
)

# Os caminhos completos (/api/...) ficam nos decorators, como documentado nos services.
app.include_router(auth.router, tags=["auth"])
app.include_router(subjects.router, tags=["subjects"])
app.include_router(professor.router, tags=["professor"])
app.include_router(admin.router, tags=["admin"])
```

```python
# app/deps.py
from typing import Literal
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import UserOut

SECRET_KEY = "trocar-em-producao"
bearer = HTTPBearer(auto_error=False)
Role = Literal["aluno", "professor", "admin"]
ROLE_LABELS = {"aluno": "alunos", "professor": "professores", "admin": "administradores"}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> UserOut:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Não autenticado.")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Sessão expirada. Faça login novamente.")
    user = ...  # buscar no banco pelo payload["sub"]
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Não autenticado.")
    return user


def require_role(*roles: Role):
    async def checker(user: UserOut = Depends(get_current_user)) -> UserOut:
        if user.role not in roles:
            labels = " e ".join(ROLE_LABELS[r] for r in roles)
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail=f"Acesso restrito a {labels}.")
        return user
    return checker
```

```python
# app/routers/admin.py (trecho)
from fastapi import APIRouter, Depends, HTTPException
from app.deps import require_role
from app.schemas.admin import CourseCreate, CourseOut

router = APIRouter(dependencies=[Depends(require_role("admin"))])

@router.post("/api/admin/courses", response_model=CourseOut, status_code=201)
async def create_course(data: CourseCreate) -> CourseOut:
    if course_code_exists(data.code):
        raise HTTPException(409, detail="Já existe um curso com este código.")
    ...
```

Rodar: `uvicorn app.main:app --reload --port 8000` e, no front-end, `VITE_API_URL=http://localhost:8000`.

## Pontos em aberto para alinhar

- **Upload de arquivos**: hoje `saveContribution` envia `fileUrl` como `blob:` local (não serve ao servidor).
  Sugestão: `POST /api/uploads` (`multipart/form-data`, `UploadFile`) devolvendo `{ "fileUrl", "fileName", "fileSize" }`,
  e depois enviar a URL retornada na contribuição. O `apiClient` já envia `FormData` sem forçar `Content-Type`.
- **Status de disciplina**: `GET /api/professor/subjects` usa `"publicada" | "rascunho"`, mas o corpo de criação
  usa `"publicado" | "rascunho"`. Mantido como está nas telas; vale padronizar.
- **Respostas de atividades**: `correctAnswer` é enviado ao cliente (correção no front-end). Se for avaliativo,
  mover a correção para uma rota `POST` no servidor.
- **`professorId`** em `createSubject` é informativo — o servidor deve usar o usuário do token.
- **Cadastro com `role`**: o servidor não deve aceitar `"admin"` no auto-cadastro; `"professor"` provavelmente deve
  virar uma solicitação (`teacherRequest`) analisada pelo admin em `/api/admin/profiles`.
