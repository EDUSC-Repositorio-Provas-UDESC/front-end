// ============================================================================
// subjectService.js — Disciplinas, conteúdos, contribuições e anotações
// (routers FastAPI: `subjects`, `contents`, `contributions`, `annotations`)
// ============================================================================
// Todas as rotas exigem usuário autenticado (`Depends(get_current_user)`,
// qualquer papel: aluno, professor ou admin), salvo indicação em contrário.
// Erros comuns a todas as rotas deste arquivo:
// - 401 `"Não autenticado."` (token ausente/inválido/expirado)
// - 422 validação de path/query/body
//
// Sem `VITE_API_URL` os dados mock abaixo são usados (contribuições e anotações
// persistem no `localStorage`). Cliente HTTP, convenções e formato de erro:
// ver `apiClient.js` e `README.md`.
//
// Modelos Pydantic deste domínio (definidos uma única vez aqui):
//
// ```python
// from typing import Literal
// from pydantic import Field
// from app.schemas.base import CamelModel  # alias_generator=to_camel
//
// ResourceType = Literal["prova", "exercicio", "arquivo", "link", "livro", "atividade"]
// ResourceFormat = Literal["PDF", "Link", "Livro", "Atividade"]
// ContributionType = Literal["arquivo", "exercicio", "link"]
//
// class Option(CamelModel):
//     value: str
//     label: str
//
// # ---- Disciplinas ----
// class FavoriteSubjectOut(CamelModel):
//     id: int
//     tag: str                            # código, ex.: "CAL1001"
//     name: str
//     teacher: str                        # ex.: "Profa. Ana Martins"
//     description: str                    # ex.: "Ciência da Computação • 2026.2"
//     resources_qty: int
//
// class SubjectOptionOut(CamelModel):
//     tag: str
//     name: str
//     label: str                          # ex.: "Cálculo I — CAL1001"
//     teacher: str
//     course_label: str
//
// class ResourceCounts(CamelModel):
//     all: int
//     prova: int
//     link: int
//     atividade: int
//
// class SubjectDetailOut(CamelModel):
//     tag: str
//     name: str
//     teacher: str
//     favorite: bool                      # favorita para o usuário do token
//     course_label: str
//     semester: str
//     counts: ResourceCounts
//
// class ResourceOut(CamelModel):
//     id: str                             # ex.: "CAL1001-1"
//     type: ResourceType
//     format: ResourceFormat
//     title: str
//     author: str
//     type_label: str                     # ex.: "Prova anterior"
//     category_label: str                 # ex.: "Provas anteriores"
//     date: str                           # já formatado, ex.: "19 out. 2026"
//     pages: int | None = None
//     size: str | None = None             # ex.: "1,2 MB"
//     file_name: str | None = None
//     file_url: str | None = None
//     href: str                           # rota do front: /conteudo/{id}, /conteudo-link/{id}, /conteudo-atividade/{id}
//
// class ResourceListOut(CamelModel):
//     items: list[ResourceOut]
//     total: int                          # total após filtros (antes do limit)
//
// class FilterOptionsOut(CamelModel):
//     courses: list[Option]
//     subjects: list[Option]              # value = tag, label = nome
//     teachers: list[Option]              # value = label = nome do professor
//
// class CatalogSubjectOut(CamelModel):
//     id: int
//     tag: str
//     name: str
//     teacher: str
//     course: str
//     semester: str
//     resources_qty: int
//     favorite: bool
//     description: str                    # "<curso> • <semestre>"
//
// class CatalogPageOut(CamelModel):
//     items: list[CatalogSubjectOut]
//     total: int
//     page: int                           # página efetiva (limitada a total_pages)
//     total_pages: int                    # mínimo 1
//
// # ---- Conteúdos (visualização) ----
// class ContentBase(CamelModel):
//     id: str
//     subject_tag: str
//     subject_name: str
//     teacher: str
//     course_label: str | None = None
//     semester: str | None = None
//     date: str
//     category_label: str                 # "Meus conteúdos" para contribuições
//     short_title: str                    # título antes de "—" (ou ":" para links)
//     title: str
//     description: str                    # ex.: "Cálculo I • Profa. Ana Martins • Publicado em 19 out. 2026"
//
// class ContentPdfOut(ContentBase):
//     type_label: str
//     info: str                           # ex.: "PDF • 1,2 MB • 4 páginas"
//     file_name: str
//     file_url: str                       # URL pública/assinada do PDF
//     pages: int
//
// class StudyLink(CamelModel):
//     id: str
//     kind: Literal["video", "simulador", "site"]
//     kind_label: str                     # ex.: "Vídeo-aula"
//     title: str
//     description: str = ""
//     source: str = ""                    # ex.: "YouTube • Canal Acadêmico UDESC"
//     duration: str = ""                  # ex.: "18 min"
//     url: str
//     embed_url: str | None = None
//
// class ContentLinkOut(ContentBase):
//     type_label: str
//     info: str                           # ex.: "Vídeos e sites • 4 referências de estudo"
//     main_url: str                       # url do primeiro link ("" se nenhum)
//     links: list[StudyLink]
//
// class QuestionOption(CamelModel):
//     id: str                             # "A".."D"
//     label: str                          # ex.: "A. 5"
//
// class Question(CamelModel):
//     id: str
//     number: str                         # ex.: "01"
//     title: str
//     points: str                         # já formatado, ex.: "2,0 pontos"
//     type: Literal["multiple_choice", "direct_result"]
//     statement: str
//     options: list[QuestionOption] | None = None   # multiple_choice
//     placeholder: str | None = None                # direct_result
//     correct_answer: str                 # id da opção ou resultado numérico
//
// class ContentActivityOut(ContentBase):
//     questions: list[Question]
//
// # ---- Contribuições (materiais enviados pelo usuário) ----
// class ContributionIn(CamelModel):
//     id: str | None = None               # presente só na edição (também vai no path)
//     title: str
//     subject_tag: str
//     teacher: str = ""
//     resource_type: ContributionType = "arquivo"
//     description: str = ""
//     support_url: str = ""
//     citation: str = ""
//     file_name: str | None = None        # resource_type == "arquivo"
//     file_size: str | None = None        # já formatado, ex.: "842 KB"
//     file_url: str | None = None         # hoje é um blob: local — ver README (upload)
//     pages: int | None = None
//     questions: list[Question] = []      # resource_type == "exercicio"
//     links: list[StudyLink] = []         # resource_type == "link"
//
// class ContributionOut(CamelModel):
//     id: str                             # ex.: "CONTRIB-1"
//     title: str
//     subject_tag: str
//     subject_name: str
//     teacher: str
//     resource_type: ContributionType
//     type_label: str                     # "Arquivo PDF" | "Exercício" | "Link recomendado"
//     format: Literal["PDF", "Atividade", "Link"]
//     date: str
//     timestamp: int                      # usado para ordenação
//     status: Literal["pendente", "publicado"]   # professor publica direto; aluno fica pendente
//     request_code: str                   # ex.: "SOL-024"
//     submitted_at: str                   # ex.: "20 out. 2026, às 14h20"
//     author: str
//     file_name: str | None = None
//     file_size: str | None = None
//     file_url: str | None = None
//     pages: int | None = None
//     description: str = ""
//     support_url: str = ""
//
// class ContributionPageOut(CamelModel):  # lista paginada de "Meus conteúdos"
//     items: list[ContributionOut]        # mais recentes primeiro (timestamp desc)
//     total: int                          # total de contribuições do usuário
//     page: int
//     page_size: int
//     citation: str = ""
//     questions: list[Question] = []
//     links: list[StudyLink] = []
//     href: str | None = None             # preenchido na listagem (GET /api/contributions/me)
//
// # ---- Anotações ----
// class NoteIn(CamelModel):
//     title: str = "Sem título"
//     content: str = ""
//
// class NoteOut(CamelModel):
//     id: str
//     title: str
//     content: str
//     date: str                           # ex.: "20 out. 2026"
//
// AnnotationCategory = Literal["all", "prova", "link", "atividade", "outros"]
//
// class AnnotatedResourceOut(CamelModel):
//     id: str
//     title: str
//     type: ResourceType
//     type_label: str
//     format: str
//     subject_tag: str
//     subject_name: str
//     teacher: str
//     date: str
//     href: str
//     notes_count: int
//
// class AnnotationCounts(CamelModel):     # soma de ANOTAÇÕES (não de recursos) por aba
//     all: int
//     prova: int
//     link: int
//     atividade: int
//     outros: int                         # exercicio + arquivo + livro
//
// class AnnotatedPageOut(CamelModel):
//     items: list[AnnotatedResourceOut]
//     total: int
//     page: int
//     page_size: int
//     total_pages: int
//     counts_by_category: AnnotationCounts
//
// class AnnotatedResourceDetailOut(CamelModel):
//     id: str
//     title: str
//     type: ResourceType
//     type_label: str
//     format: str
//     subject_tag: str
//     subject_name: str
//     teacher: str
//     date: str
//     href: str
//     notes_count: int | None = None
//     notes: list[NoteOut]
// ```
// ============================================================================

import samplePdf from '../assets/StradowskiMadeyski24FSE.pdf';
import { apiRequest, getStoredUser } from './apiClient';

// ---- Mock Data e helpers do modo mock ----

const SUBJECTS = [
    { id: 1, tag: 'CAL1001', name: 'Cálculo I', teacher: 'Profa. Ana Martins', description: 'Ciência da Computação • 2026.2', resourcesQty: 24 },
    { id: 2, tag: 'ALG1001', name: 'Algoritmos I', teacher: 'Prof. Rafael Souza', description: 'Ciência da Computação • 2026.2', resourcesQty: 18 },
    { id: 3, tag: 'ALI1001', name: 'Álgebra Linear', teacher: 'Profa. Beatriz Lima', description: 'Ciência da Computação • 2026.2', resourcesQty: 16 },
    { id: 4, tag: 'CAL1001', name: 'Cálculo I', teacher: 'Profa. Ana Martins', description: 'Ciência da Computação • 2026.2', resourcesQty: 24 },
    { id: 5, tag: 'ALG1001', name: 'Algoritmos I', teacher: 'Prof. Rafael Souza', description: 'Ciência da Computação • 2026.2', resourcesQty: 18 },
    { id: 6, tag: 'ALI1001', name: 'Álgebra Linear', teacher: 'Profa. Beatriz Lima', description: 'Ciência da Computação • 2026.2', resourcesQty: 16 },
];

const COURSES = [
    { value: 'cc', label: 'Ciência da Computação' },
    { value: 'ee', label: 'Engenharia Elétrica' },
];

const CATALOG = [
    { id: 1, tag: 'ALI1001', name: 'Álgebra Linear', teacher: 'Profa. Beatriz Lima', course: 'cc', semester: '2026.2', resourcesQty: 16, favorite: true },
    { id: 2, tag: 'ALG1001', name: 'Algoritmos I', teacher: 'Prof. Rafael Souza', course: 'cc', semester: '2026.2', resourcesQty: 18, favorite: true },
    { id: 3, tag: 'CAL1001', name: 'Cálculo I', teacher: 'Profa. Ana Martins', course: 'cc', semester: '2026.2', resourcesQty: 24, favorite: true },
    { id: 4, tag: 'FIS1001', name: 'Física I', teacher: 'Prof. Lucas Pereira', course: 'cc', semester: '2026.2', resourcesQty: 12, favorite: false },
    { id: 5, tag: 'LOG1001', name: 'Lógica Matemática', teacher: 'Profa. Camila Rocha', course: 'cc', semester: '2026.2', resourcesQty: 9, favorite: false },
    { id: 6, tag: 'MAD1001', name: 'Matemática Discreta', teacher: 'Prof. Pedro Alves', course: 'cc', semester: '2026.2', resourcesQty: 14, favorite: false },
    { id: 7, tag: 'CEL2001', name: 'Circuitos Elétricos', teacher: 'Prof. Marcos Teixeira', course: 'ee', semester: '2026.2', resourcesQty: 20, favorite: false },
    { id: 8, tag: 'EAN2001', name: 'Eletrônica Analógica', teacher: 'Profa. Helena Duarte', course: 'ee', semester: '2026.2', resourcesQty: 11, favorite: false },
];


const courseLabel = (value) => COURSES.find((c) => c.value === value)?.label ?? '';

const normalize = (text) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const TOPICS = {
    CAL1001: ['Limites', 'Limites laterais', 'Derivadas', 'Regras de derivação', 'Continuidade de funções', 'Aplicações da derivada'],
    ALG1001: ['Variáveis e tipos', 'Estruturas condicionais', 'Laços de repetição', 'Vetores', 'Funções'],
    ALI1001: ['Matrizes', 'Sistemas lineares', 'Determinantes', 'Espaços vetoriais', 'Autovalores'],
    FIS1001: ['Cinemática', 'Leis de Newton', 'Trabalho e energia', 'Quantidade de movimento'],
    LOG1001: ['Proposições', 'Tabelas-verdade', 'Quantificadores', 'Demonstrações'],
    MAD1001: ['Conjuntos', 'Relações', 'Funções', 'Contagem', 'Grafos'],
    CEL2001: ['Leis de Kirchhoff', 'Análise nodal', 'Circuitos RC', 'Circuitos RLC'],
    EAN2001: ['Diodos', 'Transistores', 'Amplificadores', 'Realimentação'],
};

const MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

const formatDate = (daysAgo) => {
    const d = new Date(2026, 9, 19 - daysAgo);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const shortName = (teacher) => teacher.replace(/^Profa?\.\s*/, '');

const TYPE_INFO = {
    prova: { label: 'Prova anterior', categoryLabel: 'Provas anteriores', format: 'PDF', hasPages: true },
    exercicio: { label: 'Exercício', categoryLabel: 'Exercícios', format: 'PDF', hasPages: true },
    arquivo: { label: 'Arquivo', categoryLabel: 'Arquivos', format: 'PDF', hasPages: false },
    link: { label: 'Link recomendado', categoryLabel: 'Links recomendados', format: 'Link', hasPages: false },
    livro: { label: 'Trecho de livro', categoryLabel: 'Leituras', format: 'Livro', hasPages: false },
    atividade: { label: 'Atividade', categoryLabel: 'Atividades', format: 'Atividade', hasPages: false },
};

const TYPE_ORDER = ['prova', 'exercicio', 'arquivo', 'link', 'livro', 'atividade'];

const FILE_SIZES = ['1,2 MB', '850 KB', '1,8 MB', '940 KB'];

const INITIAL_NOTES = [
    {
        id: 'note-1',
        title: 'Revisar a questão 02',
        content: 'Antes de substituir, fatorar x² − 9 = (x − 3)(x + 3). O limite é 6.',
        date: '20 out. 2026',
    },
    {
        id: 'note-2',
        title: 'Condição de continuidade',
        content: 'Verificar se f(a) está definida, se lim f(x) existe e se lim f(x) = f(a).',
        date: '19 out. 2026',
    },
];

const INITIAL_NOTES_BY_RESOURCE = {
    'CAL1001-1': INITIAL_NOTES,
    'ALI1001-1': [
        {
            id: 'note-ali-1',
            title: 'Escalonamento de Gauss',
            content: 'Sempre pivoteamento parcial na primeira coluna para evitar frações logo no início do sistema.',
            date: '18 out. 2026',
        },
        {
            id: 'note-ali-2',
            title: 'Propriedade do determinante',
            content: 'Se duas linhas são proporcionais, det(A) = 0 e o sistema não possui solução única.',
            date: '17 out. 2026',
        },
    ],
    'CAL1001-4': [
        {
            id: 'note-link-1',
            title: 'Explicação visual no minuto 08:30',
            content: 'O vídeo mostra claramente como os limites laterais se aproximam do mesmo valor mesmo com ponto aberto.',
            date: '20 out. 2026',
        },
        {
            id: 'note-link-2',
            title: 'Teste no simulador GeoGebra',
            content: 'Ao variar delta para 0.01 no laboratório interativo, a oscilação perto de x = 0 fica evidente.',
            date: '19 out. 2026',
        },
    ],
    'ALG1001-4': [
        {
            id: 'note-link-alg-1',
            title: 'Conversão implícita de tipos',
            content: 'Divisão entre dois inteiros trunca a parte decimal; converter pelo menos um operando para float.',
            date: '16 out. 2026',
        },
    ],
    'CAL1001-6': [
        {
            id: 'note-act-1',
            title: 'Dica para a questão 02 (indeterminação)',
            content: 'Usar produto notável a² − b² = (a − b)(a + b) antes de substituir x = 3.',
            date: '20 out. 2026',
        },
        {
            id: 'note-act-2',
            title: 'Questão 03 — valor de f(4)',
            content: 'Como x² − 16 = (x − 4)(x + 4), para f ser contínua em x = 4 devemos ter f(4) = 4 + 4 = 8.',
            date: '20 out. 2026',
        },
    ],
    'ALG1001-6': [
        {
            id: 'note-act-alg-1',
            title: 'Ordem de precedência dos operadores',
            content: 'Parênteses primeiro, depois multiplicação/divisão/resto (%) e por fim soma e subtração.',
            date: '15 out. 2026',
        },
    ],
    'CAL1001-2': [
        {
            id: 'note-ex-1',
            title: 'Limites laterais diferentes',
            content: 'Nos exercícios 4 e 5 da lista, o limite pela esquerda dá −1 e pela direita dá +1 (módulo de x).',
            date: '18 out. 2026',
        },
    ],
    'CAL1001-3': [
        {
            id: 'note-arq-1',
            title: 'Resumo da Regra da Cadeia',
            content: 'Derivada da função externa aplicada na interna vezes a derivada da função interna: (f(g(x)))\' = f\'(g(x)) · g\'(x).',
            date: '16 out. 2026',
        },
    ],
};

/** Links fictícios de vídeo, artigos e simuladores para estudo dos tópicos. */
function buildStudyLinks(subject, topicTitle) {
    const cleanTopic = topicTitle.split(':')[0].split('—')[0].trim();
    return [
        {
            id: 'link-1',
            kind: 'video',
            kindLabel: 'Vídeo-aula',
            title: `${cleanTopic} na prática — Explicação visual passo a passo`,
            description: `Aula em vídeo demonstrando a intuição geométrica e resolução comentada de exemplos sobre ${cleanTopic.toLowerCase()} em ${subject.name}.`,
            source: 'YouTube • Canal Acadêmico UDESC',
            duration: '18 min',
            url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
            embedUrl: 'https://www.youtube.com/embed/WUvTyaaNkzM',
        },
        {
            id: 'link-2',
            kind: 'simulador',
            kindLabel: 'Simulador interativo',
            title: `Laboratório interativo: explorando ${cleanTopic.toLowerCase()}`,
            description: 'Manipule parâmetros em tempo real, visualize gráficos dinamicamente e teste casos limites diretamente no navegador.',
            source: 'GeoGebra / Desmos Academy',
            duration: 'Interativo',
            url: 'https://www.geogebra.org/m/r5ef2z5r',
        },
        {
            id: 'link-3',
            kind: 'site',
            kindLabel: 'Artigo e guia',
            title: `Resumo teórico e propriedades fundamentais de ${cleanTopic}`,
            description: 'Material de referência rápida com definições formais, teoremas principais e erros comuns para evitar nas avaliações.',
            source: 'Khan Academy Brasil',
            duration: '12 min de leitura',
            url: 'https://pt.khanacademy.org/math/calculus-1',
        },
        {
            id: 'link-4',
            kind: 'video',
            kindLabel: 'Resolução de exercícios',
            title: `Revisão guiada: 5 questões clássicas de prova sobre ${cleanTopic}`,
            description: 'Vídeo focado na resolução passo a passo de exercícios similares aos cobrados nas provas anteriores da disciplina.',
            source: 'YouTube • Monitoria ' + subject.tag,
            duration: '26 min',
            url: 'https://www.youtube.com/watch?v=kfF40MiS7zA',
        },
    ];
}

/** Questões de múltipla escolha e resultado direto (sem texto livre). */
function buildActivityQuestions() {
    return [
        {
            id: 'q1',
            number: '01',
            title: 'Substituição direta',
            points: '2,0 pontos',
            type: 'multiple_choice',
            statement: 'Qual é o valor de lim x → 2 de (3x² − 2x + 1)?',
            options: [
                { id: 'A', label: 'A. 5' },
                { id: 'B', label: 'B. 9' },
                { id: 'C', label: 'C. 11' },
                { id: 'D', label: 'D. O limite não existe' },
            ],
            correctAnswer: 'B',
        },
        {
            id: 'q2',
            number: '02',
            title: 'Resolva a indeterminação',
            points: '4,0 pontos',
            type: 'direct_result',
            statement: 'Calcule o valor numérico exato de lim x → 3 de (x² − 9) / (x − 3).',
            placeholder: 'Digite apenas o resultado numérico (ex: 6)',
            correctAnswer: '6',
        },
        {
            id: 'q3',
            number: '03',
            title: 'Continuidade em um ponto',
            points: '4,0 pontos',
            type: 'direct_result',
            statement: 'Sabendo que f(x) = (x² − 16) / (x − 4) para x ≠ 4 é contínua em x = 4, qual é o valor numérico de f(4)?',
            placeholder: 'Digite apenas o resultado numérico',
            correctAnswer: '8',
        },
    ];
}

/** Contribuições iniciais fictícias do usuário. */
const INITIAL_CONTRIBUTIONS = [
    {
        id: 'CONTRIB-1',
        title: 'Resumo — Limites e continuidade',
        subjectTag: 'CAL1001',
        subjectName: 'Cálculo I',
        teacher: 'Profa. Ana Martins',
        resourceType: 'arquivo',
        typeLabel: 'Arquivo PDF',
        format: 'PDF',
        date: '20 out. 2026',
        timestamp: 3,
        status: 'pendente',
        requestCode: 'SOL-024',
        submittedAt: '20 out. 2026, às 14h20',
        author: 'Mariana Costa',
        fileName: 'resumo_limites_mariana.pdf',
        fileSize: '842 KB',
        fileUrl: samplePdf,
        pages: 4,
        description: 'Resumo autoral sobre limites, limites laterais e continuidade, com exemplos resolvidos para revisão da Prova 1.',
        supportUrl: 'https://www.geogebra.org/graphing',
        citation: 'Material autoral de Mariana Costa',
        questions: [],
        links: [],
    },
    {
        id: 'CONTRIB-2',
        title: 'Lista 02 — Limites laterais',
        subjectTag: 'CAL1001',
        subjectName: 'Cálculo I',
        teacher: 'Profa. Ana Martins',
        resourceType: 'exercicio',
        typeLabel: 'Exercício',
        format: 'Atividade',
        date: '18 out. 2026',
        timestamp: 2,
        status: 'publicado',
        requestCode: 'SOL-019',
        submittedAt: '18 out. 2026, às 10h15',
        author: 'Mariana Costa',
        fileName: null,
        fileSize: null,
        fileUrl: null,
        pages: null,
        description: 'Exercícios práticos com correção automática sobre limites laterais e existência de limite.',
        supportUrl: '',
        citation: 'Material autoral de Mariana Costa',
        questions: buildActivityQuestions(),
        links: [],
    },
    {
        id: 'CONTRIB-3',
        title: 'Resumo — Regras de derivação',
        subjectTag: 'CAL1001',
        subjectName: 'Cálculo I',
        teacher: 'Profa. Ana Martins',
        resourceType: 'arquivo',
        typeLabel: 'Arquivo PDF',
        format: 'PDF',
        date: '15 out. 2026',
        timestamp: 1,
        status: 'publicado',
        requestCode: 'SOL-012',
        submittedAt: '15 out. 2026, às 16h40',
        author: 'Mariana Costa',
        fileName: 'resumo_regras_derivacao.pdf',
        fileSize: '1,1 MB',
        fileUrl: samplePdf,
        pages: 3,
        description: 'Guia prático das regras do produto, quociente e regra da cadeia com exemplos comentados.',
        supportUrl: '',
        citation: 'Material autoral de Mariana Costa',
        questions: [],
        links: [],
    },
];

function buildTitle(type, n, topics) {
    const t = (i) => topics[i % topics.length];
    switch (type) {
        case 'prova': return `Prova ${n + 1} — ${t(n) === 'Limites' ? 'Limites e continuidade' : t(n)}`;
        case 'exercicio': return `Lista ${String(n + 2).padStart(2, '0')} — ${t(n + 1)}`;
        case 'arquivo': return `Guia de revisão — ${t(n + 2)}`;
        case 'link': return `${t(n).split(' ')[0]}: uma abordagem visual`;
        case 'livro': return `${t(n + 4)} — leitura`;
        default: return `Atividade ${String(n + 2).padStart(2, '0')} — ${t(n)}`;
    }
}

function buildFileName(title, subjectName) {
    const prefix = normalize(title.split('—')[0].trim()).replace(/[^a-z0-9]+/g, '_');
    const subjectSlug = normalize(subjectName)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_i$/, '_I');
    return `${prefix}_${subjectSlug}.pdf`;
}

function resolveResourceHref(format, id) {
    if (format === 'PDF') return `/conteudo/${id}`;
    if (format === 'Link') return `/conteudo-link/${id}`;
    if (format === 'Atividade') return `/conteudo-atividade/${id}`;
    return '#';
}

/** Gera a lista de recursos da disciplina com base em `resourcesQty`. */
function buildResources(subject) {
    const total = subject.resourcesQty;
    const atividade = total >= 10 ? 2 : 1;
    const prova = Math.floor(total / 3);
    const exercicio = Math.round(total * 0.4);
    const rest = Math.max(0, total - prova - exercicio - atividade);
    const arquivo = Math.ceil(rest / 3);
    const link = Math.ceil((rest - arquivo) / 2);
    const livro = rest - arquivo - link;

    const remaining = { prova, exercicio, arquivo, link, livro, atividade };
    const used = { prova: 0, exercicio: 0, arquivo: 0, link: 0, livro: 0, atividade: 0 };
    const topics = TOPICS[subject.tag] ?? ['Introdução', 'Conceitos fundamentais', 'Aplicações'];
    const items = [];

    while (items.length < total) {
        for (const type of TYPE_ORDER) {
            if (remaining[type] <= 0) continue;
            const n = used[type]++;
            remaining[type]--;
            const i = items.length;
            const info = TYPE_INFO[type];
            const id = `${subject.tag}-${i + 1}`;
            const title = buildTitle(type, n, topics);
            const pages = [4, 2, 3, 5][i % 4];
            const isPdf = info.format === 'PDF';

            items.push({
                id,
                type,
                format: info.format,
                title,
                author: type === 'exercicio' && n % 2 === 0 ? 'Mariana Costa' : shortName(subject.teacher),
                typeLabel: info.label,
                categoryLabel: info.categoryLabel,
                date: formatDate(i),
                pages: info.hasPages ? pages : null,
                pdfPages: pages,
                size: FILE_SIZES[i % FILE_SIZES.length],
                fileName: isPdf ? buildFileName(title, subject.name) : null,
                fileUrl: isPdf ? samplePdf : null,
                href: resolveResourceHref(info.format, id),
            });
        }
    }

    // Contadores das abas da disciplina (filtro rápido: todos, provas, links, atividades)
    return { items, counts: { all: total, prova, link, atividade } };
}

/** Usuário salvo no login; no mock, cai num usuário padrão para chavear o `localStorage`. */
function getCurrentUser() {
    const storedUser = getStoredUser();
    if (storedUser && storedUser.email) {
        return storedUser;
    }
    return {
        name: 'Mariana Costa',
        email: 'mariana.costa@edu.udesc.br',
        role: 'professor',
    };
}

function getCurrentUserKey() {
    const user = getCurrentUser();
    return user.email || user.id || 'mariana.costa@edu.udesc.br';
}

function getNotesStorageKey(resourceId) {
    return `udesc_notes_${getCurrentUserKey()}_${resourceId}`;
}

function getContributionsStorageKey() {
    return `udesc_contributions_${getCurrentUserKey()}`;
}

function readStoredContributions() {
    const key = getContributionsStorageKey();
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
        localStorage.setItem(key, JSON.stringify(INITIAL_CONTRIBUTIONS));
        return INITIAL_CONTRIBUTIONS;
    } catch {
        return INITIAL_CONTRIBUTIONS;
    }
}

function findResourceAndSubject(id, preferredFormat = null) {
    for (const sub of CATALOG) {
        const found = buildResources(sub).items.find((r) => r.id === id);
        if (found) {
            return { sub, item: found };
        }
    }
    const defaultSub = CATALOG[0];
    const items = buildResources(defaultSub).items;
    const defaultItem = preferredFormat
        ? items.find((r) => r.format === preferredFormat) || items[0]
        : items[0];
    return { sub: defaultSub, item: defaultItem };
}

/** Coleta todos os recursos anotados do usuário (auxiliar de mock para paginação e detalhe no back-end). */
function collectAllAnnotatedResources() {
    const prefix = `udesc_notes_${getCurrentUserKey()}_`;
    const resourceIds = new Set(Object.keys(INITIAL_NOTES_BY_RESOURCE));

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const id = key.slice(prefix.length);
                if (id) resourceIds.add(id);
            }
        }
    } catch {
        // Ignora erro de acesso ao localStorage
    }

    const contributions = readStoredContributions();
    const result = [];

    for (const id of resourceIds) {
        let notes = INITIAL_NOTES_BY_RESOURCE[id] || [];
        try {
            const raw = localStorage.getItem(getNotesStorageKey(id));
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) notes = parsed;
            }
        } catch {
            // Usa default
        }

        if (!notes || notes.length === 0) continue;

        const contrib = contributions.find((c) => c.id === id);
        if (contrib) {
            const typeMap = {
                arquivo: 'arquivo',
                exercicio: 'atividade',
                link: 'link',
            };
            result.push({
                id: contrib.id,
                title: contrib.title,
                type: typeMap[contrib.resourceType] || 'arquivo',
                typeLabel: contrib.typeLabel || 'Arquivo PDF',
                format: contrib.format || 'PDF',
                subjectTag: contrib.subjectTag,
                subjectName: contrib.subjectName,
                teacher: contrib.teacher,
                date: contrib.date,
                href:
                    contrib.resourceType === 'exercicio'
                        ? `/conteudo-atividade/${contrib.id}`
                        : contrib.resourceType === 'link'
                            ? `/conteudo-link/${contrib.id}`
                            : `/conteudo/${contrib.id}`,
                notesCount: notes.length,
                notes,
            });
            continue;
        }

        const { sub, item } = findResourceAndSubject(id);
        if (item && sub) {
            result.push({
                id: item.id,
                title: item.title,
                type: item.type,
                typeLabel: item.typeLabel,
                format: item.format,
                subjectTag: sub.tag,
                subjectName: sub.name,
                teacher: sub.teacher,
                date: item.date,
                href: item.href,
                notesCount: notes.length,
                notes,
            });
        }
    }

    return result;
}

export const subjectService = {
    // ========================================================================
    // DISCIPLINAS
    // Atenção à ordem no FastAPI: declare `/api/subjects/favorites`, `/all` e
    // `/filters` ANTES de `/api/subjects/{tag}`.
    // ========================================================================

    /**
     * Disciplinas favoritas do usuário (tela inicial `/home`).
     *
     * **`GET /api/subjects/favorites`** — autenticado.
     *
     * ```python
     * @router.get("/api/subjects/favorites", response_model=list[FavoriteSubjectOut])
     * async def list_favorites(user = Depends(get_current_user)): ...
     * ```
     * Response 200: `list[FavoriteSubjectOut]`, ex.:
     * ```json
     * [{ "id": 1, "tag": "CAL1001", "name": "Cálculo I", "teacher": "Profa. Ana Martins",
     *    "description": "Ciência da Computação • 2026.2", "resourcesQty": 24 }]
     * ```
     */
    getFavorites: async () => {
        return apiRequest('/api/subjects/favorites', {
            mockDelay: 250,
            fallback: () => SUBJECTS,
        });
    },

    /**
     * Lista completa de disciplinas (combobox de `/conteudos/novo`).
     *
     * **`GET /api/subjects/all`** — autenticado.
     *
     * ```python
     * @router.get("/api/subjects/all", response_model=list[SubjectOptionOut])
     * async def list_all_subjects(user = Depends(get_current_user)): ...
     * ```
     * Response 200: `list[SubjectOptionOut]`, ex.:
     * ```json
     * [{ "tag": "CAL1001", "name": "Cálculo I", "label": "Cálculo I — CAL1001",
     *    "teacher": "Profa. Ana Martins", "courseLabel": "Ciência da Computação" }]
     * ```
     */
    getAllSubjects: async () => {
        return apiRequest('/api/subjects/all', {
            mockDelay: 100,
            fallback: () =>
                CATALOG.map((s) => ({
                    tag: s.tag,
                    name: s.name,
                    label: `${s.name} — ${s.tag}`,
                    teacher: s.teacher,
                    courseLabel: courseLabel(s.course),
                })),
        });
    },

    /**
     * Cabeçalho de uma disciplina (`/disciplina/:tag`).
     *
     * **`GET /api/subjects/{tag}`** — autenticado.
     *
     * ```python
     * @router.get("/api/subjects/{tag}", response_model=SubjectDetailOut)
     * async def get_subject(tag: str, user = Depends(get_current_user)): ...
     * ```
     * Response 200 (`SubjectDetailOut`):
     * ```json
     * { "tag": "CAL1001", "name": "Cálculo I", "teacher": "Profa. Ana Martins", "favorite": true,
     *   "courseLabel": "Ciência da Computação", "semester": "2026.2",
     *   "counts": { "all": 24, "prova": 8, "link": 2, "atividade": 2 } }
     * ```
     * Erros: 404 `"Disciplina não encontrada."` (o mock retorna `null`).
     */
    getSubject: async (tag) => {
        return apiRequest(`/api/subjects/${encodeURIComponent(tag)}`, {
            mockDelay: 200,
            fallback: () => {
                const subject = CATALOG.find((s) => s.tag === tag);
                if (!subject) return null;
                return {
                    tag: subject.tag,
                    name: subject.name,
                    teacher: subject.teacher,
                    favorite: subject.favorite,
                    courseLabel: courseLabel(subject.course),
                    semester: subject.semester,
                    counts: buildResources(subject).counts,
                };
            },
        });
    },

    /**
     * Recursos de uma disciplina, com filtro por categoria, busca e limite.
     *
     * **`GET /api/subjects/{tag}/resources?category=prova&search=limites&limit=5`** — autenticado.
     *
     * ```python
     * @router.get("/api/subjects/{tag}/resources", response_model=ResourceListOut)
     * async def list_resources(
     *     tag: str,
     *     category: Literal["all", "prova", "link", "atividade"] = "all",
     *     search: str | None = None,          # busca no título (sem acento)
     *     limit: int = Query(5, ge=1),
     *     user = Depends(get_current_user),
     * ): ...
     * ```
     * Response 200 (`ResourceListOut`):
     * ```json
     * { "items": [{ "id": "CAL1001-1", "type": "prova", "format": "PDF",
     *     "title": "Prova 1 — Limites e continuidade", "author": "Ana Martins",
     *     "typeLabel": "Prova anterior", "categoryLabel": "Provas anteriores",
     *     "date": "19 out. 2026", "pages": 4, "size": "1,2 MB", "href": "/conteudo/CAL1001-1" }],
     *   "total": 24 }
     * ```
     * Erros: 404 `"Disciplina não encontrada."` (o mock retorna lista vazia).
     */
    getResources: async ({ tag, category = 'all', search = '', limit = 5 } = {}) => {
        return apiRequest(`/api/subjects/${encodeURIComponent(tag)}/resources`, {
            params: { category, search, limit },
            mockDelay: 200,
            fallback: () => {
                const subject = CATALOG.find((s) => s.tag === tag);
                if (!subject) return { items: [], total: 0 };

                const term = normalize(search.trim());
                const filtered = buildResources(subject).items.filter(
                    (r) =>
                        (category === 'all' || r.type === category) &&
                        (!term || normalize(r.title).includes(term))
                );

                return { items: filtered.slice(0, limit), total: filtered.length };
            },
        });
    },

    /**
     * Opções dos filtros do catálogo (`/explorar`).
     *
     * **`GET /api/subjects/filters?course=cc`** — autenticado.
     *
     * ```python
     * @router.get("/api/subjects/filters", response_model=FilterOptionsOut)
     * async def filter_options(course: str | None = None,   # restringe subjects/teachers
     *                          user = Depends(get_current_user)): ...
     * ```
     * Response 200 (`FilterOptionsOut`):
     * ```json
     * { "courses": [{ "value": "cc", "label": "Ciência da Computação" }],
     *   "subjects": [{ "value": "CAL1001", "label": "Cálculo I" }],
     *   "teachers": [{ "value": "Profa. Ana Martins", "label": "Profa. Ana Martins" }] }
     * ```
     */
    getFilterOptions: async (course = '') => {
        return apiRequest('/api/subjects/filters', {
            params: { course },
            mockDelay: 150,
            fallback: () => {
                const scoped = CATALOG.filter((s) => !course || s.course === course);
                return {
                    courses: COURSES,
                    subjects: scoped.map((s) => ({ value: s.tag, label: s.name })),
                    teachers: [...new Set(scoped.map((s) => s.teacher))].map((t) => ({
                        value: t,
                        label: t,
                    })),
                };
            },
        });
    },

    /**
     * Busca paginada no catálogo de disciplinas (`/explorar`).
     *
     * **`GET /api/subjects?search=&course=cc&subject=CAL1001&teacher=&page=1&pageSize=6`** — autenticado.
     *
     * ```python
     * @router.get("/api/subjects", response_model=CatalogPageOut)
     * async def search_catalog(
     *     search: str | None = None,          # nome ou tag (sem acento)
     *     course: str | None = None,
     *     subject: str | None = None,         # tag exata
     *     teacher: str | None = None,         # nome exato
     *     page: int = Query(1, ge=1),
     *     page_size: int = Query(6, ge=1, alias="pageSize"),
     *     user = Depends(get_current_user),
     * ): ...
     * ```
     * Response 200 (`CatalogPageOut`):
     * ```json
     * { "items": [{ "id": 1, "tag": "ALI1001", "name": "Álgebra Linear", "teacher": "Profa. Beatriz Lima",
     *     "course": "cc", "semester": "2026.2", "resourcesQty": 16, "favorite": true,
     *     "description": "Ciência da Computação • 2026.2" }],
     *   "total": 8, "page": 1, "totalPages": 2 }
     * ```
     */
    getCatalog: async ({ search = '', course = '', subject = '', teacher = '', page = 1, pageSize = 6 } = {}) => {
        return apiRequest('/api/subjects', {
            params: { search, course, subject, teacher, page, pageSize },
            mockDelay: 250,
            fallback: () => {
                const term = normalize(search.trim());

                const filtered = CATALOG.filter(
                    (s) =>
                        (!course || s.course === course) &&
                        (!subject || s.tag === subject) &&
                        (!teacher || s.teacher === teacher) &&
                        (!term || normalize(s.name).includes(term) || normalize(s.tag).includes(term))
                );

                const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
                const currentPage = Math.min(page, totalPages);
                const start = (currentPage - 1) * pageSize;

                return {
                    items: filtered.slice(start, start + pageSize).map((s) => ({
                        ...s,
                        description: `${courseLabel(s.course)} • ${s.semester}`,
                    })),
                    total: filtered.length,
                    page: currentPage,
                    totalPages,
                };
            },
        });
    },

    // ========================================================================
    // CONTEÚDOS (visualização) — `id` pode ser um recurso ("CAL1001-1") ou
    // uma contribuição do usuário ("CONTRIB-1").
    // ========================================================================

    /**
     * Conteúdo em PDF (`/conteudo/:id`).
     *
     * **`GET /api/contents/pdf/{id}`** — autenticado.
     *
     * ```python
     * @router.get("/api/contents/pdf/{content_id}", response_model=ContentPdfOut)
     * async def get_content_pdf(content_id: str, user = Depends(get_current_user)): ...
     * ```
     * Response 200 (`ContentPdfOut`):
     * ```json
     * { "id": "CAL1001-1", "subjectTag": "CAL1001", "subjectName": "Cálculo I",
     *   "teacher": "Profa. Ana Martins", "courseLabel": "Ciência da Computação", "semester": "2026.2",
     *   "date": "19 out. 2026", "categoryLabel": "Provas anteriores", "shortTitle": "Prova 1",
     *   "title": "Prova 1 — Limites e continuidade",
     *   "description": "Cálculo I • Profa. Ana Martins • Publicado em 19 out. 2026",
     *   "typeLabel": "Prova anterior", "info": "PDF • 1,2 MB • 4 páginas",
     *   "fileName": "prova_1_calculo_I.pdf", "fileUrl": "https://.../prova_1_calculo_I.pdf", "pages": 4 }
     * ```
     * Erros: 404 `"Conteúdo não encontrado."` (o mock devolve um PDF padrão).
     */
    getContentPDF: async (id) => {
        return apiRequest(`/api/contents/pdf/${encodeURIComponent(id || '')}`, {
            mockDelay: 150,
            fallback: () => {
                const contrib = readStoredContributions().find((c) => c.id === id);
                if (contrib) {
                    return {
                        id: contrib.id,
                        subjectTag: contrib.subjectTag,
                        subjectName: contrib.subjectName,
                        teacher: contrib.teacher,
                        date: contrib.date,
                        categoryLabel: 'Meus conteúdos',
                        shortTitle: contrib.title.split('—')[0].trim(),
                        title: contrib.title,
                        description: `${contrib.subjectName} • ${contrib.teacher} • Publicado em ${contrib.date}`,
                        typeLabel: contrib.typeLabel || 'Arquivo PDF',
                        info: `PDF • ${contrib.fileSize || '842 KB'} • ${contrib.pages || 4} páginas`,
                        fileName: contrib.fileName || 'arquivo.pdf',
                        fileUrl: contrib.fileUrl || samplePdf,
                        pages: contrib.pages || 4,
                    };
                }

                const { sub: targetSub, item: targetItem } = findResourceAndSubject(id, 'PDF');
                const pages = targetItem.pdfPages ?? 4;

                return {
                    id: targetItem.id,
                    subjectTag: targetSub.tag,
                    subjectName: targetSub.name,
                    teacher: targetSub.teacher,
                    courseLabel: courseLabel(targetSub.course),
                    semester: targetSub.semester,
                    date: targetItem.date,
                    categoryLabel: targetItem.categoryLabel,
                    shortTitle: targetItem.title.split('—')[0].trim(),
                    title: targetItem.title,
                    description: `${targetSub.name} • ${targetSub.teacher} • Publicado em ${targetItem.date}`,
                    typeLabel: targetItem.typeLabel,
                    info: `PDF • ${targetItem.size} • ${pages} páginas`,
                    fileName: targetItem.fileName ?? 'documento.pdf',
                    fileUrl: targetItem.fileUrl ?? samplePdf,
                    pages,
                };
            },
        });
    },

    /** Alias de `getContentPDF` (mesma rota `GET /api/contents/pdf/{id}`). */
    getResourceById: async (id) => {
        return subjectService.getContentPDF(id);
    },

    /**
     * Conteúdo do tipo link (`/conteudo-link/:id`).
     *
     * **`GET /api/contents/link/{id}`** — autenticado.
     *
     * ```python
     * @router.get("/api/contents/link/{content_id}", response_model=ContentLinkOut)
     * async def get_content_link(content_id: str, user = Depends(get_current_user)): ...
     * ```
     * Response 200 (`ContentLinkOut`; campos de `ContentBase` como em `getContentPDF`):
     * ```json
     * { "id": "CAL1001-4", "...": "...", "typeLabel": "Link recomendado",
     *   "info": "Vídeos e sites • 4 referências de estudo",
     *   "mainUrl": "https://www.youtube.com/watch?v=WUvTyaaNkzM",
     *   "links": [{ "id": "link-1", "kind": "video", "kindLabel": "Vídeo-aula",
     *     "title": "Limites na prática — Explicação visual passo a passo", "description": "...",
     *     "source": "YouTube • Canal Acadêmico UDESC", "duration": "18 min",
     *     "url": "https://www.youtube.com/watch?v=WUvTyaaNkzM",
     *     "embedUrl": "https://www.youtube.com/embed/WUvTyaaNkzM" }] }
     * ```
     * Erros: 404 `"Conteúdo não encontrado."` (o mock devolve um link padrão).
     */
    getContentLink: async (id) => {
        return apiRequest(`/api/contents/link/${encodeURIComponent(id || '')}`, {
            mockDelay: 150,
            fallback: () => {
                const contrib = readStoredContributions().find((c) => c.id === id);
                if (contrib && contrib.links?.length) {
                    return {
                        id: contrib.id,
                        subjectTag: contrib.subjectTag,
                        subjectName: contrib.subjectName,
                        teacher: contrib.teacher,
                        date: contrib.date,
                        categoryLabel: 'Meus conteúdos',
                        shortTitle: contrib.title.split(':')[0].split('—')[0].trim(),
                        title: contrib.title,
                        description: `${contrib.subjectName} • ${contrib.teacher} • Publicado em ${contrib.date}`,
                        typeLabel: 'Link recomendado',
                        info: `Vídeos e sites • ${contrib.links.length} referências de estudo`,
                        mainUrl: contrib.links[0]?.url || '',
                        links: contrib.links,
                    };
                }

                const { sub: targetSub, item: targetItem } = findResourceAndSubject(id, 'Link');
                const links = buildStudyLinks(targetSub, targetItem.title);

                return {
                    id: targetItem.id,
                    subjectTag: targetSub.tag,
                    subjectName: targetSub.name,
                    teacher: targetSub.teacher,
                    courseLabel: courseLabel(targetSub.course),
                    semester: targetSub.semester,
                    date: targetItem.date,
                    categoryLabel: targetItem.categoryLabel || 'Links recomendados',
                    shortTitle: targetItem.title.split(':')[0].split('—')[0].trim(),
                    title: targetItem.title,
                    description: `${targetSub.name} • ${targetSub.teacher} • Publicado em ${targetItem.date}`,
                    typeLabel: targetItem.typeLabel || 'Link recomendado',
                    info: `Vídeos e sites • ${links.length} referências de estudo`,
                    mainUrl: links[0]?.url || '',
                    links,
                };
            },
        });
    },

    /**
     * Conteúdo do tipo atividade / exercício (`/conteudo-atividade/:id`).
     * A correção é feita no front-end comparando com `correctAnswer`.
     *
     * **`GET /api/contents/activity/{id}`** — autenticado.
     *
     * ```python
     * @router.get("/api/contents/activity/{content_id}", response_model=ContentActivityOut)
     * async def get_content_activity(content_id: str, user = Depends(get_current_user)): ...
     * ```
     * Response 200 (`ContentActivityOut`; campos de `ContentBase` como em `getContentPDF`,
     * com `description` = "Cálculo I • Profa. Ana Martins • Valor: 10,0 pontos"):
     * ```json
     * { "id": "CAL1001-6", "...": "...",
     *   "questions": [
     *     { "id": "q1", "number": "01", "title": "Substituição direta", "points": "2,0 pontos",
     *       "type": "multiple_choice", "statement": "Qual é o valor de lim x → 2 de (3x² − 2x + 1)?",
     *       "options": [{ "id": "A", "label": "A. 5" }, { "id": "B", "label": "B. 9" }],
     *       "correctAnswer": "B" },
     *     { "id": "q2", "number": "02", "title": "Resolva a indeterminação", "points": "4,0 pontos",
     *       "type": "direct_result", "statement": "Calcule lim x → 3 de (x² − 9) / (x − 3).",
     *       "placeholder": "Digite apenas o resultado numérico (ex: 6)", "correctAnswer": "6" } ] }
     * ```
     * Erros: 404 `"Conteúdo não encontrado."` (o mock devolve uma atividade padrão).
     */
    getContentActivity: async (id) => {
        return apiRequest(`/api/contents/activity/${encodeURIComponent(id || '')}`, {
            mockDelay: 150,
            fallback: () => {
                const contrib = readStoredContributions().find((c) => c.id === id);
                if (contrib && contrib.questions?.length) {
                    return {
                        id: contrib.id,
                        subjectTag: contrib.subjectTag,
                        subjectName: contrib.subjectName,
                        teacher: contrib.teacher,
                        date: contrib.date,
                        categoryLabel: 'Meus conteúdos',
                        shortTitle: contrib.title.split('—')[0].trim(),
                        title: contrib.title,
                        description: `${contrib.subjectName} • ${contrib.teacher} • Valor: 10,0 pontos`,
                        questions: contrib.questions,
                    };
                }

                const { sub: targetSub, item: targetItem } = findResourceAndSubject(id, 'Atividade');
                const questions = buildActivityQuestions();

                return {
                    id: targetItem.id,
                    subjectTag: targetSub.tag,
                    subjectName: targetSub.name,
                    teacher: targetSub.teacher,
                    courseLabel: courseLabel(targetSub.course),
                    semester: targetSub.semester,
                    date: targetItem.date,
                    categoryLabel: targetItem.categoryLabel || 'Atividades',
                    shortTitle: targetItem.title.split('—')[0].trim(),
                    title: targetItem.title,
                    description: `${targetSub.name} • ${targetSub.teacher} • Valor: 10,0 pontos`,
                    questions,
                };
            },
        });
    },

    // ========================================================================
    // CONTRIBUIÇÕES — materiais enviados pelo próprio usuário (aluno ou professor).
    // Declare `/api/contributions/me` ANTES de `/api/contributions/{id}`.
    // ========================================================================

    /**
     * Contribuições do usuário autenticado (`/conteudos`), paginadas e ordenadas
     * da mais recente para a mais antiga.
     *
     * **`GET /api/contributions/me?page=1&pageSize=5`** — aluno ou professor.
     *
     * ```python
     * @router.get("/api/contributions/me", response_model=ContributionPageOut)
     * async def my_contributions(
     *     page: int = Query(1, ge=1),
     *     page_size: int = Query(5, ge=1, le=50, alias="pageSize"),
     *     user = Depends(require_role("aluno", "professor")),
     * ):
     *     query = select(Contribution).where(Contribution.author_id == user.id)
     *     total = await db.scalar(select(func.count()).select_from(query.subquery()))
     *     rows = await db.scalars(
     *         query.order_by(Contribution.timestamp.desc())
     *              .offset((page - 1) * page_size).limit(page_size)
     *     )
     *     return {"items": rows.all(), "total": total, "page": page, "page_size": page_size}
     * ```
     * Response 200 (`ContributionPageOut`), itens com `href` preenchido
     * (`/conteudo-atividade/{id}` para exercicio, `/conteudo-link/{id}` para link, senão `/conteudo/{id}`):
     * ```json
     * { "total": 7, "page": 1, "pageSize": 5, "items": [{ "id": "CONTRIB-1", "title": "Resumo — Limites e continuidade", "subjectTag": "CAL1001",
     *    "subjectName": "Cálculo I", "teacher": "Profa. Ana Martins", "resourceType": "arquivo",
     *    "typeLabel": "Arquivo PDF", "format": "PDF", "date": "20 out. 2026", "timestamp": 1761000000,
     *    "status": "pendente", "requestCode": "SOL-024", "submittedAt": "20 out. 2026, às 14h20",
     *    "author": "Mariana Costa", "href": "/conteudo/CONTRIB-1" }] }
     * ```
     * Uma página além da última retorna `items: []` com o `total` correto.
     * Erros: 403 `"Acesso restrito a alunos e professores."`, 422 se `page`/`pageSize` inválidos.
     */
    getMyContributions: async ({ page = 1, pageSize = 5 } = {}) => {
        return apiRequest('/api/contributions/me', {
            params: { page, pageSize },
            mockDelay: 150,
            fallback: () => {
                const user = getCurrentUser();
                const isProfessor = String(user.role || '').toLowerCase() === 'professor';
                const sorted = [...readStoredContributions()].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                const start = (page - 1) * pageSize;

                const items = sorted.slice(start, start + pageSize).map((item) => ({
                    ...item,
                    status: isProfessor ? 'publicado' : item.status,
                    href:
                        item.resourceType === 'exercicio'
                            ? `/conteudo-atividade/${item.id}`
                            : item.resourceType === 'link'
                                ? `/conteudo-link/${item.id}`
                                : `/conteudo/${item.id}`,
                }));

                return { items, total: sorted.length, page, pageSize };
            },
        });
    },

    /**
     * Uma contribuição completa, para edição (`/conteudos/editar/:id`).
     *
     * **`GET /api/contributions/{id}`** — aluno ou professor (somente o autor).
     *
     * ```python
     * @router.get("/api/contributions/{contribution_id}", response_model=ContributionOut)
     * async def get_contribution(contribution_id: str,
     *                            user = Depends(require_role("aluno", "professor"))): ...
     * ```
     * Response 200: `ContributionOut` (com `questions`, `links`, `fileName`, `fileUrl`, etc.).
     * Erros:
     * - 403 `"Você não é o autor desta contribuição."`
     * - 404 `"Contribuição não encontrada."` (o mock retorna `null`)
     */
    getContributionById: async (id) => {
        return apiRequest(`/api/contributions/${encodeURIComponent(id || '')}`, {
            mockDelay: 100,
            fallback: () => {
                const list = readStoredContributions();
                return list.find((item) => item.id === id) || null;
            },
        });
    },

    /**
     * Cria (sem `payload.id`) ou atualiza (com `payload.id`) uma contribuição.
     * O back-end define `status`: `"publicado"` para professor, `"pendente"` para aluno
     * (que gera uma solicitação de moderação em `/api/admin/requests`).
     *
     * **`POST /api/contributions`** e **`PUT /api/contributions/{id}`** — aluno ou professor.
     *
     * ```python
     * @router.post("/api/contributions", response_model=ContributionOut, status_code=201)
     * async def create_contribution(data: ContributionIn,
     *                               user = Depends(require_role("aluno", "professor"))): ...
     *
     * @router.put("/api/contributions/{contribution_id}", response_model=ContributionOut)
     * async def update_contribution(contribution_id: str, data: ContributionIn,
     *                               user = Depends(require_role("aluno", "professor"))): ...
     * ```
     * Request (`ContributionIn`):
     * ```json
     * { "id": "CONTRIB-1", "title": "Resumo — Limites", "subjectTag": "CAL1001",
     *   "teacher": "Profa. Ana Martins", "resourceType": "arquivo", "description": "...",
     *   "supportUrl": "https://...", "citation": "Material autoral...",
     *   "fileName": "resumo.pdf", "fileSize": "842 KB", "fileUrl": "blob:...",
     *   "questions": [], "links": [] }
     * ```
     * Response 201/200: `ContributionOut` — a tela usa `requestCode` (ex.: "SOL-025") e
     * `submittedAt` (ex.: "20 out. 2026, às 14h20").
     * Erros:
     * - 403 `"Você não é o autor desta contribuição."` (PUT)
     * - 404 `"Disciplina não encontrada."` / `"Contribuição não encontrada."` (PUT)
     * - 422 validação
     */
    saveContribution: async (payload) => {
        const isUpdate = Boolean(payload?.id);
        const endpoint = isUpdate
            ? `/api/contributions/${encodeURIComponent(payload.id)}`
            : '/api/contributions';

        return apiRequest(endpoint, {
            method: isUpdate ? 'PUT' : 'POST',
            body: payload,
            mockDelay: 200,
            fallback: () => {
                const user = getCurrentUser();
                const isProfessor = String(user.role || '').toLowerCase() === 'professor';
                const list = readStoredContributions();

                const sub = CATALOG.find((s) => s.tag === payload.subjectTag) || CATALOG[0];
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

                const typeMeta = {
                    arquivo: { typeLabel: 'Arquivo PDF', format: 'PDF' },
                    exercicio: { typeLabel: 'Exercício', format: 'Atividade' },
                    link: { typeLabel: 'Link recomendado', format: 'Link' },
                }[payload.resourceType || 'arquivo'];

                const existingIndex = payload.id ? list.findIndex((i) => i.id === payload.id) : -1;
                const existing = existingIndex >= 0 ? list[existingIndex] : null;

                const requestNum = String(24 + list.length).padStart(3, '0');
                const savedItem = {
                    id: existing?.id || `CONTRIB-${Date.now()}`,
                    title: payload.title?.trim() || '',
                    subjectTag: sub.tag,
                    subjectName: sub.name,
                    teacher: payload.teacher || sub.teacher,
                    resourceType: payload.resourceType || 'arquivo',
                    typeLabel: typeMeta.typeLabel,
                    format: typeMeta.format,
                    date: existing?.date || dateStr,
                    timestamp: Date.now(),
                    status: isProfessor ? 'publicado' : 'pendente',
                    requestCode: existing?.requestCode || `SOL-${requestNum}`,
                    submittedAt: `${dateStr}, às ${hours}h${minutes}`,
                    author: user.name || '',
                    fileName: payload.fileName || existing?.fileName || null,
                    fileSize: payload.fileSize || existing?.fileSize || null,
                    fileUrl: payload.fileUrl || existing?.fileUrl || null,
                    pages: payload.pages || existing?.pages || 1,
                    description: payload.description?.trim() || '',
                    supportUrl: payload.supportUrl?.trim() || '',
                    citation: payload.citation?.trim() || '',
                    questions: payload.questions || [],
                    links: payload.links || [],
                };

                let updated;
                if (existingIndex >= 0) {
                    updated = [...list];
                    updated[existingIndex] = savedItem;
                } else {
                    updated = [savedItem, ...list];
                }

                try {
                    localStorage.setItem(getContributionsStorageKey(), JSON.stringify(updated));
                } catch {
                    // Ignora erro de quota
                }

                return savedItem;
            },
        });
    },

    /**
     * Exclui uma contribuição do usuário. A tela ignora o retorno e recarrega a lista.
     *
     * **`DELETE /api/contributions/{id}`** — aluno ou professor (somente o autor).
     *
     * ```python
     * @router.delete("/api/contributions/{contribution_id}", status_code=204)
     * async def delete_contribution(contribution_id: str,
     *                               user = Depends(require_role("aluno", "professor"))) -> None: ...
     * ```
     * Response: 204 sem corpo (o mock retorna a lista restante).
     * Erros:
     * - 403 `"Você não é o autor desta contribuição."`
     * - 404 `"Contribuição não encontrada."`
     */
    deleteContribution: async (id) => {
        return apiRequest(`/api/contributions/${encodeURIComponent(id || '')}`, {
            method: 'DELETE',
            mockDelay: 100,
            fallback: () => {
                const list = readStoredContributions();
                const updated = list.filter((item) => item.id !== id);
                try {
                    localStorage.setItem(getContributionsStorageKey(), JSON.stringify(updated));
                } catch {
                    // Ignora erro de escrita
                }
                return updated;
            },
        });
    },

    // ========================================================================
    // ANOTAÇÕES — notas pessoais do usuário sobre um recurso/contribuição.
    // Sempre filtradas pelo usuário do token.
    // ========================================================================

    /**
     * Anotações do usuário em um recurso (`NotesCard`). Não faz requisição sem `resourceId`.
     *
     * **`GET /api/annotations/{resourceId}/notes`** — autenticado.
     *
     * ```python
     * @router.get("/api/annotations/{resource_id}/notes", response_model=list[NoteOut])
     * async def list_notes(resource_id: str, user = Depends(get_current_user)): ...
     * ```
     * Response 200: `list[NoteOut]` (mais recente primeiro; `[]` se não houver), ex.:
     * ```json
     * [{ "id": "note-1", "title": "Revisar a questão 02",
     *    "content": "Antes de substituir, fatorar x² − 9 = (x − 3)(x + 3). O limite é 6.",
     *    "date": "20 out. 2026" }]
     * ```
     */
    getNotes: async (resourceId) => {
        if (!resourceId) return [];
        return apiRequest(`/api/annotations/${encodeURIComponent(resourceId)}/notes`, {
            mockDelay: 100,
            fallback: () => {
                const key = getNotesStorageKey(resourceId);
                const defaultNotes = INITIAL_NOTES_BY_RESOURCE[resourceId] || INITIAL_NOTES;
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed) ? parsed : defaultNotes;
                    }
                    localStorage.setItem(key, JSON.stringify(defaultNotes));
                    return defaultNotes;
                } catch {
                    return defaultNotes;
                }
            },
        });
    },

    /**
     * Cria uma anotação em um recurso. Uma nota com o mesmo `title` é substituída.
     *
     * **`POST /api/annotations/{resourceId}/notes`** — autenticado.
     *
     * ```python
     * @router.post("/api/annotations/{resource_id}/notes", response_model=list[NoteOut], status_code=201)
     * async def create_note(resource_id: str, data: NoteIn, user = Depends(get_current_user)): ...
     * ```
     * Request (`NoteIn`): `{ "title": "Revisar a questão 02", "content": "Texto da anotação..." }`
     * Response 201: `list[NoteOut]` — a LISTA COMPLETA atualizada do recurso (nova nota primeiro),
     * pois a tela substitui o estado com o retorno.
     * Erros: 404 `"Recurso não encontrado."`
     */
    saveNote: async (resourceId, { title, content }) => {
        return apiRequest(`/api/annotations/${encodeURIComponent(resourceId)}/notes`, {
            method: 'POST',
            body: { title, content },
            mockDelay: 100,
            fallback: async () => {
                const current = await subjectService.getNotes(resourceId);
                const d = new Date();
                const newNote = {
                    id: `note-${Date.now()}`,
                    title: (title || '').trim() || 'Sem título',
                    content: (content || '').trim(),
                    date: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
                };
                const updated = [newNote, ...current.filter((n) => n.title !== newNote.title)];
                try {
                    localStorage.setItem(getNotesStorageKey(resourceId), JSON.stringify(updated));
                } catch {
                    // Ignora erro de quota do localStorage
                }
                return updated;
            },
        });
    },

    /**
     * Exclui uma anotação de um recurso.
     *
     * **`DELETE /api/annotations/{resourceId}/notes/{noteId}`** — autenticado (dono da nota).
     *
     * ```python
     * @router.delete("/api/annotations/{resource_id}/notes/{note_id}", response_model=list[NoteOut])
     * async def delete_note(resource_id: str, note_id: str, user = Depends(get_current_user)): ...
     * ```
     * Response 200: `list[NoteOut]` — as notas RESTANTES do recurso (não use 204 aqui:
     * a tela substitui o estado com o retorno).
     * Erros: 404 `"Anotação não encontrada."`
     */
    deleteNote: async (resourceId, noteId) => {
        return apiRequest(
            `/api/annotations/${encodeURIComponent(resourceId)}/notes/${encodeURIComponent(noteId)}`,
            {
                method: 'DELETE',
                mockDelay: 100,
                fallback: async () => {
                    const current = await subjectService.getNotes(resourceId);
                    const updated = current.filter((n) => n.id !== noteId);
                    try {
                        localStorage.setItem(getNotesStorageKey(resourceId), JSON.stringify(updated));
                    } catch {
                        // Ignora erro de escrita no localStorage
                    }
                    return updated;
                },
            }
        );
    },

    /**
     * Conteúdos que têm anotações do usuário, por aba e paginados (`/anotacoes`).
     *
     * **`GET /api/annotations?category=all&page=1&pageSize=5`** — autenticado.
     *
     * ```python
     * @router.get("/api/annotations", response_model=AnnotatedPageOut)
     * async def list_annotated(
     *     category: AnnotationCategory = "all",   # "outros" = exercicio + arquivo + livro
     *     page: int = Query(1, ge=1),
     *     page_size: int = Query(5, ge=1, alias="pageSize"),
     *     user = Depends(get_current_user),
     * ): ...
     * ```
     * Response 200 (`AnnotatedPageOut`; recursos sem notas não aparecem):
     * ```json
     * { "items": [{ "id": "CAL1001-1", "title": "Prova 1 — Limites e continuidade", "type": "prova",
     *     "typeLabel": "Prova anterior", "format": "PDF", "subjectTag": "CAL1001",
     *     "subjectName": "Cálculo I", "teacher": "Profa. Ana Martins", "date": "19 out. 2026",
     *     "href": "/conteudo/CAL1001-1", "notesCount": 2 }],
     *   "total": 2, "page": 1, "pageSize": 5, "totalPages": 1,
     *   "countsByCategory": { "all": 11, "prova": 4, "link": 3, "atividade": 3, "outros": 2 } }
     * ```
     */
    getAnnotatedResources: async ({ category = 'all', page = 1, pageSize = 5 } = {}) => {
        return apiRequest('/api/annotations', {
            params: { category, page, pageSize },
            mockDelay: 150,
            fallback: () => {
                const allItems = collectAllAnnotatedResources();

                const categoryMatchers = {
                    all: ['prova', 'link', 'atividade', 'exercicio', 'arquivo', 'livro'],
                    prova: ['prova'],
                    link: ['link'],
                    atividade: ['atividade'],
                    outros: ['exercicio', 'arquivo', 'livro'],
                };

                const countsByCategory = {};
                Object.entries(categoryMatchers).forEach(([catKey, types]) => {
                    countsByCategory[catKey] = allItems
                        .filter((item) => types.includes(item.type))
                        .reduce((sum, item) => sum + (item.notesCount || 0), 0);
                });

                const allowedTypes = categoryMatchers[category] || categoryMatchers.all;
                const filtered = allItems.filter((item) => allowedTypes.includes(item.type));

                const total = filtered.length;
                const totalPages = Math.max(1, Math.ceil(total / pageSize));
                const currentPage = Math.min(Math.max(1, page), totalPages);
                const start = (currentPage - 1) * pageSize;

                // A listagem não inclui o array `notes` (apenas `notesCount`).
                const paginatedItems = filtered
                    .slice(start, start + pageSize)
                    .map((item) => Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'notes')));

                return {
                    items: paginatedItems,
                    total,
                    page: currentPage,
                    pageSize,
                    totalPages,
                    countsByCategory,
                };
            },
        });
    },

    /**
     * Um conteúdo anotado com todas as suas notas (`/anotacoes/:id`).
     * Não faz requisição sem `resourceId`.
     *
     * **`GET /api/annotations/{resourceId}`** — autenticado.
     *
     * ```python
     * @router.get("/api/annotations/{resource_id}", response_model=AnnotatedResourceDetailOut)
     * async def get_annotated(resource_id: str, user = Depends(get_current_user)): ...
     * ```
     * Response 200 (`AnnotatedResourceDetailOut`): mesmos campos de `AnnotatedResourceOut` + `notes`:
     * ```json
     * { "id": "CAL1001-1", "title": "Prova 1 — Limites e continuidade", "type": "prova",
     *   "typeLabel": "Prova anterior", "format": "PDF", "subjectTag": "CAL1001",
     *   "subjectName": "Cálculo I", "teacher": "Profa. Ana Martins", "date": "19 out. 2026",
     *   "href": "/conteudo/CAL1001-1",
     *   "notes": [{ "id": "note-1", "title": "Revisar a questão 02", "content": "...", "date": "20 out. 2026" }] }
     * ```
     * Erros: 404 `"Recurso não encontrado."` (com `notes: []` se existir mas não tiver notas).
     */
    getAnnotatedResourceById: async (resourceId) => {
        if (!resourceId) return null;
        return apiRequest(`/api/annotations/${encodeURIComponent(resourceId)}`, {
            mockDelay: 120,
            fallback: async () => {
                const all = collectAllAnnotatedResources();
                const found = all.find((r) => r.id === resourceId);
                if (found) return found;

                const { sub, item } = findResourceAndSubject(resourceId);
                const notes = await subjectService.getNotes(resourceId);
                return {
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    typeLabel: item.typeLabel,
                    format: item.format,
                    subjectTag: sub.tag,
                    subjectName: sub.name,
                    teacher: sub.teacher,
                    date: item.date,
                    href: item.href,
                    notes,
                };
            },
        });
    },
};

export default subjectService;
