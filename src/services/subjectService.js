import samplePdf from '../assets/StradowskiMadeyski24FSE.pdf';

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    return { items, counts: { all: total, prova, exercicio, atividade } };
}

function getCurrentUser() {
    try {
        const storedUser = JSON.parse(localStorage.getItem('udesc_estuda_user') || 'null');
        if (storedUser && storedUser.email) {
            return storedUser;
        }
    } catch {
        // Ignora erro de parse
    }
    return {
        name: 'Mariana Costa',
        email: 'mariana.costa@edu.udesc.br',
        role: 'aluno',
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

/**
 * ============================================================================
 * CONFIGURAÇÃO DO CLIENTE HTTP REST PARA O BACK-END PYTHON (FastAPI / Flask / Django)
 * ============================================================================
 * Defina `VITE_API_URL=http://localhost:8000/api` no arquivo `.env` quando o
 * servidor Python estiver rodando. Caso `VITE_API_URL` não esteja definida ou o
 * back-end esteja offline em ambiente de desenvolvimento, o helper executa o
 * fallback local com o mesmo formato JSON esperado da API REST.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function requestPythonRest(endpoint, { method = 'GET', params = null, body = null, fallback }) {
    if (API_BASE_URL) {
        try {
            const url = new URL(`${API_BASE_URL}${endpoint}`);
            if (params) {
                Object.entries(params).forEach(([k, v]) => {
                    if (v !== undefined && v !== null && v !== '') {
                        url.searchParams.set(k, String(v));
                    }
                });
            }

            const user = getCurrentUser();
            const headers = { Accept: 'application/json' };
            if (user?.token) {
                headers.Authorization = `Bearer ${user.token}`;
            }
            if (body && !(body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url.toString(), {
                method,
                headers,
                body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            if (!fallback) throw err;
        }
    }

    return fallback();
}

export const subjectService = {
    /**
     * ------------------------------------------------------------------------
     * 1. DISCIPLINAS FAVORITAS (Tela Inicial — `/home`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/subjects/favorites`
     * Header: `Authorization: Bearer <token>`
     * Enviado pelo Front-end: Nenhum parâmetro de corpo ou query.
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * [
     *   {
     *     "id": 1,
     *     "tag": "CAL1001",
     *     "name": "Cálculo I",
     *     "teacher": "Profa. Ana Martins",
     *     "description": "Ciência da Computação • 2026.2",
     *     "resourcesQty": 24
     *   }
     * ]
     * ```
     */
    getFavorites: async () => {
        return requestPythonRest('/subjects/favorites', {
            method: 'GET',
            fallback: async () => {
                await wait(250);
                return SUBJECTS;
            },
        });
    },

    /**
     * ------------------------------------------------------------------------
     * 2. LISTA COMPLETA DE DISCIPLINAS (Combobox de Formulários — `/conteudos/novo`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/subjects/all`
     * Enviado pelo Front-end: Nenhum parâmetro.
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * [
     *   {
     *     "tag": "CAL1001",
     *     "name": "Cálculo I",
     *     "label": "Cálculo I — CAL1001",
     *     "teacher": "Profa. Ana Martins",
     *     "courseLabel": "Ciência da Computação"
     *   }
     * ]
     * ```
     */
    getAllSubjects: async () => {
        return requestPythonRest('/subjects/all', {
            method: 'GET',
            fallback: async () => {
                await wait(100);
                return CATALOG.map((s) => ({
                    tag: s.tag,
                    name: s.name,
                    label: `${s.name} — ${s.tag}`,
                    teacher: s.teacher,
                    courseLabel: courseLabel(s.course),
                }));
            },
        });
    },

    /**
     * ------------------------------------------------------------------------
     * 3. DETALHES DE UMA DISCIPLINA (Cabeçalho — `/disciplina/:tag`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/subjects/{tag}`
     * Path Param enviado: `tag` (string, ex: `"CAL1001"`)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON ou 404):
     * ```json
     * {
     *   "tag": "CAL1001",
     *   "name": "Cálculo I",
     *   "teacher": "Profa. Ana Martins",
     *   "favorite": true,
     *   "courseLabel": "Ciência da Computação",
     *   "semester": "2026.2",
     *   "counts": {
     *     "all": 24,
     *     "prova": 8,
     *     "exercicio": 10,
     *     "atividade": 2
     *   }
     * }
     * ```
     */
    getSubject: async (tag) => {
        return requestPythonRest(`/subjects/${encodeURIComponent(tag)}`, {
            method: 'GET',
            fallback: async () => {
                await wait(200);
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
     * ------------------------------------------------------------------------
     * 4. RECURSOS DE UMA DISCIPLINA COM FILTRO E PAGINAÇÃO (`/disciplina/:tag`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/subjects/{tag}/resources`
     * Path Param enviado: `tag` (string, ex: `"CAL1001"`)
     * Query Params enviados:
     *   - `category`: `'all' | 'prova' | 'exercicio' | 'atividade'`
     *   - `search`: string (busca textual pelo título do recurso)
     *   - `limit`: number (quantidade máxima de itens retornados)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "items": [
     *     {
     *       "id": "CAL1001-1",
     *       "type": "prova",
     *       "format": "PDF",
     *       "title": "Prova 1 — Limites e continuidade",
     *       "author": "Ana Martins",
     *       "typeLabel": "Prova anterior",
     *       "categoryLabel": "Provas anteriores",
     *       "date": "19 out. 2026",
     *       "pages": 4,
     *       "size": "1,2 MB",
     *       "href": "/conteudo/CAL1001-1"
     *     }
     *   ],
     *   "total": 24
     * }
     * ```
     */
    getResources: async ({ tag, category = 'all', search = '', limit = 5 } = {}) => {
        return requestPythonRest(`/subjects/${encodeURIComponent(tag)}/resources`, {
            method: 'GET',
            params: { category, search, limit },
            fallback: async () => {
                await wait(200);
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
     * ------------------------------------------------------------------------
     * 5. OPÇÕES DE FILTRO DO CATÁLOGO (`/explorar`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/subjects/filters`
     * Query Params enviados:
     *   - `course`: string opcional (ex: `'cc'`, `'ee'` ou `''` para todos)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "courses": [{ "value": "cc", "label": "Ciência da Computação" }],
     *   "subjects": [{ "value": "CAL1001", "label": "Cálculo I" }],
     *   "teachers": [{ "value": "Profa. Ana Martins", "label": "Profa. Ana Martins" }]
     * }
     * ```
     */
    getFilterOptions: async (course = '') => {
        return requestPythonRest('/subjects/filters', {
            method: 'GET',
            params: { course },
            fallback: async () => {
                await wait(150);
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
     * ------------------------------------------------------------------------
     * 6. BUSCA PAGINADA NO CATÁLOGO DE DISCIPLINAS (`/explorar`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/subjects`
     * Query Params enviados:
     *   - `search`: string
     *   - `course`: string
     *   - `subject`: string (tag da disciplina)
     *   - `teacher`: string
     *   - `page`: number (página atual, iniciando em 1)
     *   - `pageSize`: number (itens por página, ex: 6)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "items": [
     *     {
     *       "id": 1,
     *       "tag": "ALI1001",
     *       "name": "Álgebra Linear",
     *       "teacher": "Profa. Beatriz Lima",
     *       "course": "cc",
     *       "semester": "2026.2",
     *       "resourcesQty": 16,
     *       "favorite": true,
     *       "description": "Ciência da Computação • 2026.2"
     *     }
     *   ],
     *   "total": 8,
     *   "page": 1,
     *   "totalPages": 2
     * }
     * ```
     */
    getCatalog: async ({ search = '', course = '', subject = '', teacher = '', page = 1, pageSize = 6 } = {}) => {
        return requestPythonRest('/subjects', {
            method: 'GET',
            params: { search, course, subject, teacher, page, pageSize },
            fallback: async () => {
                await wait(250);
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

    /**
     * ------------------------------------------------------------------------
     * 7. CONTEÚDO EM PDF (`/conteudo/:id`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/contents/pdf/{id}`
     * Path Param enviado: `id` (string, ex: `"CAL1001-1"` ou `"CONTRIB-1"`)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "id": "CAL1001-1",
     *   "subjectTag": "CAL1001",
     *   "subjectName": "Cálculo I",
     *   "teacher": "Profa. Ana Martins",
     *   "date": "19 out. 2026",
     *   "categoryLabel": "Provas anteriores",
     *   "shortTitle": "Prova 1",
     *   "title": "Prova 1 — Limites e continuidade",
     *   "description": "Cálculo I • Profa. Ana Martins • Publicado em 19 out. 2026",
     *   "typeLabel": "Prova anterior",
     *   "info": "PDF • 1,2 MB • 4 páginas",
     *   "fileName": "prova_1_calculo_I.pdf",
     *   "fileUrl": "https://.../arquivos/prova_1_calculo_I.pdf",
     *   "pages": 4
     * }
     * ```
     */
    getContentPDF: async (id) => {
        return requestPythonRest(`/contents/pdf/${encodeURIComponent(id || '')}`, {
            method: 'GET',
            fallback: async () => {
                await wait(150);
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

    /** Alias para busca de conteúdo PDF por ID. */
    getResourceById: async (id) => {
        return subjectService.getContentPDF(id);
    },

    /**
     * ------------------------------------------------------------------------
     * 8. CONTEÚDO DO TIPO LINK (`/conteudo-link/:id`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/contents/link/{id}`
     * Path Param enviado: `id` (string, ex: `"CAL1001-4"`)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "id": "CAL1001-4",
     *   "subjectTag": "CAL1001",
     *   "subjectName": "Cálculo I",
     *   "teacher": "Profa. Ana Martins",
     *   "date": "15 out. 2026",
     *   "categoryLabel": "Links recomendados",
     *   "shortTitle": "Limites",
     *   "title": "Limites: uma abordagem visual",
     *   "description": "Cálculo I • Profa. Ana Martins • Publicado em 15 out. 2026",
     *   "typeLabel": "Link recomendado",
     *   "info": "Vídeos e sites • 4 referências de estudo",
     *   "links": [
     *     {
     *       "id": "link-1",
     *       "kind": "video",
     *       "kindLabel": "Vídeo-aula",
     *       "title": "Limites na prática — Explicação visual passo a passo",
     *       "description": "Aula em vídeo demonstrando a intuição geométrica...",
     *       "source": "YouTube • Canal Acadêmico UDESC",
     *       "duration": "18 min",
     *       "url": "https://www.youtube.com/watch?v=..."
     *     }
     *   ]
     * }
     * ```
     */
    getContentLink: async (id) => {
        return requestPythonRest(`/contents/link/${encodeURIComponent(id || '')}`, {
            method: 'GET',
            fallback: async () => {
                await wait(150);
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
     * ------------------------------------------------------------------------
     * 9. CONTEÚDO DO TIPO ATIVIDADE / EXERCÍCIO (`/conteudo-atividade/:id`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/contents/activity/{id}`
     * Path Param enviado: `id` (string, ex: `"CAL1001-6"`)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "id": "CAL1001-6",
     *   "subjectTag": "CAL1001",
     *   "subjectName": "Cálculo I",
     *   "teacher": "Profa. Ana Martins",
     *   "date": "14 out. 2026",
     *   "categoryLabel": "Atividades",
     *   "shortTitle": "Atividade 02",
     *   "title": "Atividade 02 — Limites",
     *   "description": "Cálculo I • Profa. Ana Martins • Valor: 10,0 pontos",
     *   "questions": [
     *     {
     *       "id": "q1",
     *       "number": "01",
     *       "title": "Substituição direta",
     *       "points": "2,0 pontos",
     *       "type": "multiple_choice",
     *       "statement": "Qual é o valor de lim x → 2 de (3x² − 2x + 1)?",
     *       "options": [
     *         { "id": "A", "label": "A. 5" },
     *         { "id": "B", "label": "B. 9" },
     *         { "id": "C", "label": "C. 11" },
     *         { "id": "D", "label": "D. O limite não existe" }
     *       ],
     *       "correctAnswer": "B"
     *     },
     *     {
     *       "id": "q2",
     *       "number": "02",
     *       "title": "Resolva a indeterminação",
     *       "points": "4,0 pontos",
     *       "type": "direct_result",
     *       "statement": "Calcule o valor numérico exato de lim x → 3 de (x² − 9) / (x − 3).",
     *       "placeholder": "Digite apenas o resultado numérico",
     *       "correctAnswer": "6"
     *     }
     *   ]
     * }
     * ```
     */
    getContentActivity: async (id) => {
        return requestPythonRest(`/contents/activity/${encodeURIComponent(id || '')}`, {
            method: 'GET',
            fallback: async () => {
                await wait(150);
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

    /**
     * ------------------------------------------------------------------------
     * 10. LISTAR CONTRIBUIÇÕES DO USUÁRIO (`/conteudos`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/contributions/me`
     * Header: `Authorization: Bearer <token>`
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * [
     *   {
     *     "id": "CONTRIB-1",
     *     "title": "Resumo — Limites e continuidade",
     *     "subjectTag": "CAL1001",
     *     "subjectName": "Cálculo I",
     *     "teacher": "Profa. Ana Martins",
     *     "resourceType": "arquivo",
     *     "typeLabel": "Arquivo PDF",
     *     "format": "PDF",
     *     "date": "20 out. 2026",
     *     "timestamp": 1761000000,
     *     "status": "pendente",
     *     "requestCode": "SOL-024",
     *     "submittedAt": "20 out. 2026, às 14h20",
     *     "author": "Mariana Costa",
     *     "href": "/conteudo/CONTRIB-1"
     *   }
     * ]
     * ```
     */
    getMyContributions: async () => {
        return requestPythonRest('/contributions/me', {
            method: 'GET',
            fallback: async () => {
                await wait(150);
                const user = getCurrentUser();
                const isProfessor = String(user.role || '').toLowerCase() === 'professor';
                const list = readStoredContributions();

                return list.map((item) => ({
                    ...item,
                    status: isProfessor ? 'publicado' : item.status,
                    href:
                        item.resourceType === 'exercicio'
                            ? `/conteudo-atividade/${item.id}`
                            : item.resourceType === 'link'
                                ? `/conteudo-link/${item.id}`
                                : `/conteudo/${item.id}`,
                }));
            },
        });
    },

    /**
     * ------------------------------------------------------------------------
     * 11. BUSCAR UMA CONTRIBUIÇÃO PARA EDIÇÃO (`/conteudos/editar/:id`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/contributions/{id}`
     * Path Param enviado: `id` (string)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * Objeto completo da contribuição contendo `id`, `title`, `subjectTag`, `teacher`,
     * `resourceType` (`'arquivo' | 'exercicio' | 'link'`), `description`, `supportUrl`,
     * `citation`, `fileName`, `fileSize`, `fileUrl`, `questions`, `links`, `requestCode`, `submittedAt`.
     */
    getContributionById: async (id) => {
        return requestPythonRest(`/contributions/${encodeURIComponent(id || '')}`, {
            method: 'GET',
            fallback: async () => {
                await wait(100);
                const list = readStoredContributions();
                return list.find((item) => item.id === id) || null;
            },
        });
    },

    /**
     * ------------------------------------------------------------------------
     * 12. CRIAR OU ATUALIZAR CONTRIBUIÇÃO (`/conteudos/novo` e `/conteudos/editar/:id`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST:
     *   - Criação: `POST /api/contributions`
     *   - Edição:  `PUT /api/contributions/{id}`
     *
     * Corpo JSON enviado pelo Front-end (`payload`):
     * ```json
     * {
     *   "id": "CONTRIB-1",          // Opcional (presente apenas em edição)
     *   "title": "Resumo — Limites",
     *   "subjectTag": "CAL1001",
     *   "teacher": "Profa. Ana Martins",
     *   "resourceType": "arquivo",  // "arquivo" | "exercicio" | "link"
     *   "description": "Descrição detalhada...",
     *   "supportUrl": "https://...",
     *   "citation": "Material autoral...",
     *   "fileName": "resumo.pdf",   // Quando resourceType === "arquivo"
     *   "fileSize": "842 KB",
     *   "fileUrl": "blob:...",
     *   "questions": [],            // Quando resourceType === "exercicio"
     *   "links": []                 // Quando resourceType === "link"
     * }
     * ```
     *
     * Retorno esperado do Back-end Python (Status 201/200 JSON):
     * Objeto salvo contendo `id`, `status` (`"pendente"` para aluno, `"publicado"` para professor),
     * `requestCode` (ex: `"SOL-025"`) e `submittedAt` (ex: `"20 out. 2026, às 14h20"`).
     */
    saveContribution: async (payload) => {
        const isUpdate = Boolean(payload?.id);
        const endpoint = isUpdate
            ? `/contributions/${encodeURIComponent(payload.id)}`
            : '/contributions';

        return requestPythonRest(endpoint, {
            method: isUpdate ? 'PUT' : 'POST',
            body: payload,
            fallback: async () => {
                await wait(200);
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
     * ------------------------------------------------------------------------
     * 13. EXCLUIR CONTRIBUIÇÃO (`/conteudos`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `DELETE /api/contributions/{id}`
     * Path Param enviado: `id` (string)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * `{ "success": true, "deletedId": "CONTRIB-1" }`
     */
    deleteContribution: async (id) => {
        return requestPythonRest(`/contributions/${encodeURIComponent(id || '')}`, {
            method: 'DELETE',
            fallback: async () => {
                await wait(100);
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

    /**
     * ------------------------------------------------------------------------
     * 14. LISTAR ANOTAÇÕES DE UM RECURSO ESPECÍFICO (`NotesCard`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/annotations/{resourceId}/notes`
     * Path Param enviado: `resourceId` (string, ex: `"CAL1001-1"`)
     * Header: `Authorization: Bearer <token>`
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * [
     *   {
     *     "id": "note-1",
     *     "title": "Revisar a questão 02",
     *     "content": "Antes de substituir, fatorar x² − 9 = (x − 3)(x + 3). O limite é 6.",
     *     "date": "20 out. 2026"
     *   }
     * ]
     * ```
     */
    getNotes: async (resourceId) => {
        if (!resourceId) return [];
        return requestPythonRest(`/annotations/${encodeURIComponent(resourceId)}/notes`, {
            method: 'GET',
            fallback: async () => {
                await wait(100);
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
     * ------------------------------------------------------------------------
     * 15. SALVAR / CRIAR ANOTAÇÃO EM UM RECURSO (`NotesCard` e `AnnotationDetails`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `POST /api/annotations/{resourceId}/notes`
     * Path Param enviado: `resourceId` (string)
     * Corpo JSON enviado pelo Front-end:
     * ```json
     * {
     *   "title": "Revisar a questão 02",
     *   "content": "Texto da anotação..."
     * }
     * ```
     *
     * Retorno esperado do Back-end Python (Status 201 JSON):
     * Array atualizado de anotações daquele `resourceId`:
     * `[ { "id": "note-123", "title": "...", "content": "...", "date": "20 out. 2026" }, ... ]`
     */
    saveNote: async (resourceId, { title, content }) => {
        return requestPythonRest(`/annotations/${encodeURIComponent(resourceId)}/notes`, {
            method: 'POST',
            body: { title, content },
            fallback: async () => {
                await wait(100);
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
     * ------------------------------------------------------------------------
     * 16. EXCLUIR ANOTAÇÃO DE UM RECURSO (`NotesCard` e `AnnotationDetails`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `DELETE /api/annotations/{resourceId}/notes/{noteId}`
     * Path Params enviados:
     *   - `resourceId`: string
     *   - `noteId`: string
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * Array atualizado de anotações restantes daquele `resourceId`.
     */
    deleteNote: async (resourceId, noteId) => {
        return requestPythonRest(
            `/annotations/${encodeURIComponent(resourceId)}/notes/${encodeURIComponent(noteId)}`,
            {
                method: 'DELETE',
                fallback: async () => {
                    await wait(100);
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
     * ------------------------------------------------------------------------
     * 17. LISTAR CONTEÚDOS COM ANOTAÇÕES POR ABA E PAGINAÇÃO (`Annotations` — `/anotacoes`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/annotations`
     * Header: `Authorization: Bearer <token>`
     * Query Params enviados pelo Front-end:
     *   - `category`: `'all' | 'prova' | 'link' | 'atividade' | 'outros'`
     *   - `page`: number (página atual, iniciando em 1)
     *   - `pageSize`: number (quantidade de itens por página, ex: 5)
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "items": [
     *     {
     *       "id": "CAL1001-1",
     *       "title": "Prova 1 — Limites e continuidade",
     *       "type": "prova",
     *       "typeLabel": "Prova anterior",
     *       "format": "PDF",
     *       "subjectTag": "CAL1001",
     *       "subjectName": "Cálculo I",
     *       "teacher": "Profa. Ana Martins",
     *       "date": "19 out. 2026",
     *       "href": "/conteudo/CAL1001-1",
     *       "notesCount": 2
     *     }
     *   ],
     *   "total": 2,
     *   "page": 1,
     *   "pageSize": 5,
     *   "totalPages": 1,
     *   "countsByCategory": {
     *     "all": 11,
     *     "prova": 4,
     *     "link": 3,
     *     "atividade": 3,
     *     "outros": 2
     *   }
     * }
     * ```
     */
    getAnnotatedResources: async ({ category = 'all', page = 1, pageSize = 5 } = {}) => {
        return requestPythonRest('/annotations', {
            method: 'GET',
            params: { category, page, pageSize },
            fallback: async () => {
                await wait(150);
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

                const paginatedItems = filtered.slice(start, start + pageSize).map(({ notes, ...meta }) => meta);

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
     * ------------------------------------------------------------------------
     * 18. DETALHE DE UM TÍTULO E SUAS ANOTAÇÕES (`AnnotationDetails` — `/anotacoes/:id`)
     * ------------------------------------------------------------------------
     * Método/Rota Python REST: `GET /api/annotations/{resourceId}`
     * Path Param enviado: `resourceId` (string, ex: `"CAL1001-1"`)
     * Header: `Authorization: Bearer <token>`
     *
     * Retorno esperado do Back-end Python (Status 200 JSON):
     * ```json
     * {
     *   "id": "CAL1001-1",
     *   "title": "Prova 1 — Limites e continuidade",
     *   "type": "prova",
     *   "typeLabel": "Prova anterior",
     *   "format": "PDF",
     *   "subjectTag": "CAL1001",
     *   "subjectName": "Cálculo I",
     *   "teacher": "Profa. Ana Martins",
     *   "date": "19 out. 2026",
     *   "href": "/conteudo/CAL1001-1",
     *   "notes": [
     *     {
     *       "id": "note-1",
     *       "title": "Revisar a questão 02",
     *       "content": "Antes de substituir, fatorar x² − 9 = (x − 3)(x + 3). O limite é 6.",
     *       "date": "20 out. 2026"
     *     }
     *   ]
     * }
     * ```
     */
    getAnnotatedResourceById: async (resourceId) => {
        if (!resourceId) return null;
        return requestPythonRest(`/annotations/${encodeURIComponent(resourceId)}`, {
            method: 'GET',
            fallback: async () => {
                await wait(120);
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
