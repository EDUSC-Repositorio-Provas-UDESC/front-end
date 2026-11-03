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

// Catálogo completo de disciplinas (dados fictícios)
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

export const subjectService = {
    /** Simula a busca das disciplinas favoritas do usuário. */
    getFavorites: async () => {
        await wait(400);
        return SUBJECTS;
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
};

export default subjectService;
