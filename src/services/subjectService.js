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
    CAL1001: ['Limites e continuidade', 'Limites laterais', 'Derivadas', 'Regras de derivação', 'Continuidade de funções', 'Aplicações da derivada'],
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
    link: { label: 'Link recomendado', categoryLabel: 'Links', format: 'Link', hasPages: false },
    livro: { label: 'Trecho de livro', categoryLabel: 'Leituras', format: 'Livro', hasPages: false },
    atividade: { label: 'Atividade', categoryLabel: 'Atividades', format: 'PDF', hasPages: true },
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

function buildTitle(type, n, topics) {
    const t = (i) => topics[i % topics.length];
    switch (type) {
        case 'prova': return `Prova ${n + 1} — ${t(n)}`;
        case 'exercicio': return `Lista ${String(n + 2).padStart(2, '0')} — ${t(n + 1)}`;
        case 'arquivo': return `Guia de revisão — ${t(n + 2)}`;
        case 'link': return `${t(n).split(' ')[0]}: uma abordagem visual`;
        case 'livro': return `${t(n + 4)} — leitura`;
        default: return `Atividade ${n + 1} — ${t(n)}`;
    }
}

function buildFileName(title, subjectName) {
    const prefix = normalize(title.split('—')[0].trim()).replace(/[^a-z0-9]+/g, '_');
    const subjectSlug = normalize(subjectName)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_i$/, '_I');
    return `${prefix}_${subjectSlug}.pdf`;
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
                href: isPdf ? `/conteudo/${id}` : '#',
            });
        }
    }

    return { items, counts: { all: total, prova, exercicio, atividade } };
}

function getNotesStorageKey(resourceId = 'CAL1001-1') {
    try {
        const storedUser = JSON.parse(localStorage.getItem('udesc_estuda_user') || 'null');
        const userKey = storedUser?.email || storedUser?.id || 'mariana.costa@edu.udesc.br';
        return `udesc_notes_${userKey}_${resourceId}`;
    } catch {
        return `udesc_notes_mariana.costa@edu.udesc.br_${resourceId}`;
    }
}

export const subjectService = {
    /** Simula a busca das disciplinas favoritas do usuário. */
    getFavorites: async () => {
        await wait(400);
        return SUBJECTS;
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

    /** Busca os dados completos de um conteúdo em PDF pelo id (ex: 'CAL1001-1'). */
    getContentPDF: async (id = 'CAL1001-1') => {
        await wait(150);
        let targetSub = CATALOG.find((s) => s.tag === 'CAL1001') || CATALOG[0];
        let targetItem = buildResources(targetSub).items[0];

        for (const sub of CATALOG) {
            const found = buildResources(sub).items.find((r) => r.id === id);
            if (found) {
                targetSub = sub;
                targetItem = found;
                break;
            }
        }

        const pages = targetItem.pdfPages ?? 4;

        return {
            id: targetItem.id,
            subjectTag: targetSub.tag,
            subjectName: targetSub.name,
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
