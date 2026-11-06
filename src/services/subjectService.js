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

function getNotesStorageKey(resourceId = 'CAL1001-1') {
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
    const defaultSub = CATALOG.find((s) => s.tag === 'CAL1001') || CATALOG[0];
    const items = buildResources(defaultSub).items;
    const defaultItem = preferredFormat
        ? items.find((r) => r.format === preferredFormat) || items[0]
        : items[0];
    return { sub: defaultSub, item: defaultItem };
}

export const subjectService = {
    /** Simula a busca das disciplinas favoritas do usuário. */
    getFavorites: async () => {
        await wait(400);
        return SUBJECTS;
    },

    /** Lista todas as disciplinas e respectivos professores para formulários de contribuição. */
    getAllSubjects: async () => {
        await wait(100);
        return CATALOG.map((s) => ({
            tag: s.tag,
            name: s.name,
            label: `${s.name} — ${s.tag}`,
            teacher: s.teacher,
            courseLabel: courseLabel(s.course),
        }));
    },

    /** Dados da disciplina (cabeçalho da página) e contagem de recursos por categoria. */
    getSubject: async (tag) => {
        await wait(250);
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

    /**
     * Recursos da disciplina.
     * `category`: 'all' | 'prova' | 'exercicio' | 'atividade'. `limit` controla o "Carregar mais".
     */
    getResources: async ({ tag, category = 'all', search = '', limit = 5 } = {}) => {
        await wait(250);
        const subject = CATALOG.find((s) => s.tag === tag);
        if (!subject) return { items: [], total: 0 };

        const term = normalize(search.trim());
        const filtered = buildResources(subject).items.filter((r) =>
            (category === 'all' || r.type === category) &&
            (!term || normalize(r.title).includes(term))
        );

        return { items: filtered.slice(0, limit), total: filtered.length };
    },

    /**
     * Opções dos filtros da tela de exploração.
     * Disciplinas e professores são restritos ao curso informado (se houver).
     */
    getFilterOptions: async (course = '') => {
        await wait(150);
        const scoped = CATALOG.filter((s) => !course || s.course === course);
        return {
            courses: COURSES,
            subjects: scoped.map((s) => ({ value: s.tag, label: s.name })),
            teachers: [...new Set(scoped.map((s) => s.teacher))].map((t) => ({ value: t, label: t })),
        };
    },

    /** Busca paginada no catálogo de disciplinas com filtros opcionais. */
    getCatalog: async ({ search = '', course = '', subject = '', teacher = '', page = 1, pageSize = 6 } = {}) => {
        await wait(300);
        const term = normalize(search.trim());

        const filtered = CATALOG.filter((s) =>
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

    /** Busca os dados completos de um conteúdo em PDF pelo id (ex: 'CAL1001-1' ou 'CONTRIB-1'). */
    getContentPDF: async (id = 'CAL1001-1') => {
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
                fileName: contrib.fileName || 'resumo_limites_mariana.pdf',
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
            fileName: targetItem.fileName ?? 'prova_1_calculo_I.pdf',
            fileUrl: targetItem.fileUrl ?? samplePdf,
            pages,
        };
    },

    /** Alias para compatibilidade com chamadas por id de recurso. */
    getResourceById: async (id = 'CAL1001-1') => {
        return subjectService.getContentPDF(id);
    },

    /** Busca os dados completos de um conteúdo do tipo Link (vídeos, sites, simuladores) pelo id. */
    getContentLink: async (id = 'CAL1001-4') => {
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
                mainUrl: contrib.links[0]?.url || 'https://pt.khanacademy.org',
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
            mainUrl: links[0]?.url || 'https://pt.khanacademy.org',
            links,
        };
    },

    /** Busca os dados de uma Atividade (múltipla escolha e resultados diretos) para resolução em tempo real. */
    getContentActivity: async (id = 'CAL1001-6') => {
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

    /** Lista as contribuições publicadas/enviadas pelo usuário atual. */
    getMyContributions: async () => {
        await wait(150);
        const user = getCurrentUser();
        const isProfessor = String(user.role || '').toLowerCase() === 'professor';
        const list = readStoredContributions();

        // Quando o perfil é professor, as postagens são publicadas na hora (sem status pendente)
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

    /** Busca uma contribuição específica pelo ID para edição. */
    getContributionById: async (id) => {
        await wait(100);
        const list = readStoredContributions();
        return list.find((item) => item.id === id) || null;
    },

    /** Cria ou atualiza uma contribuição (aluno -> 'pendente', professor -> 'publicado' na hora). */
    saveContribution: async (payload) => {
        await wait(200);
        const user = getCurrentUser();
        const isProfessor = String(user.role || '').toLowerCase() === 'professor';
        const list = readStoredContributions();

        const sub = CATALOG.find((s) => s.tag === payload.subjectTag) || CATALOG[2];
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const dateStr = '20 out. 2026';

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
            title: payload.title?.trim() || 'Novo conteúdo',
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
            author: user.name || 'Mariana Costa',
            fileName: payload.fileName || existing?.fileName || 'resumo_limites_mariana.pdf',
            fileSize: payload.fileSize || existing?.fileSize || '842 KB',
            fileUrl: payload.fileUrl || existing?.fileUrl || samplePdf,
            pages: payload.pages || existing?.pages || 4,
            description: payload.description?.trim() || '',
            supportUrl: payload.supportUrl?.trim() || '',
            citation: payload.citation?.trim() || `Material autoral de ${user.name || 'Mariana Costa'}`,
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

    /** Exclui uma contribuição do usuário atual. */
    deleteContribution: async (id) => {
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

    /** Recupera as anotações do usuário atual para um conteúdo específico. */
    getNotes: async (resourceId = 'CAL1001-1') => {
        await wait(100);
        const key = getNotesStorageKey(resourceId);
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : INITIAL_NOTES;
            }
            localStorage.setItem(key, JSON.stringify(INITIAL_NOTES));
            return INITIAL_NOTES;
        } catch {
            return INITIAL_NOTES;
        }
    },

    /** Salva uma anotação para o usuário atual e retorna a lista atualizada. */
    saveNote: async (resourceId = 'CAL1001-1', { title, content }) => {
        await wait(100);
        const current = await subjectService.getNotes(resourceId);
        const d = new Date();
        const newNote = {
            id: `note-${Date.now()}`,
            title: title.trim(),
            content: content.trim(),
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

    /** Remove uma anotação do usuário atual e retorna a lista atualizada. */
    deleteNote: async (resourceId = 'CAL1001-1', noteId) => {
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
};

export default subjectService;
