import { Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import RuleIcon from '@mui/icons-material/Rule';
import './SectionContent.css';

const FORMAT_ICONS = {
    PDF: DescriptionOutlinedIcon,
    Link: InsertLinkOutlinedIcon,
    Livro: MenuBookOutlinedIcon,
    Atividade: RuleIcon,
};

function resolveTargetHref(format, id, href) {
    if (href && href !== '#') return href;
    if (format === 'PDF') return `/conteudo/${id || 'CAL1001-1'}`;
    if (format === 'Link') return `/conteudo-link/${id || 'CAL1001-4'}`;
    if (format === 'Atividade') return `/conteudo-atividade/${id || 'CAL1001-6'}`;
    return '#';
}

/** Resumo de um recurso da disciplina (prova, lista, arquivo, link...). */
export default function SectionContent({ id, format = 'PDF', title, typeLabel, author, date, pages, href = '#' }) {
    const Icon = FORMAT_ICONS[format] ?? DescriptionOutlinedIcon;
    const meta = [typeLabel, author, date, pages ? `${pages} páginas` : null].filter(Boolean).join(' • ');
    const targetHref = resolveTargetHref(format, id, href);
    const isInternal = targetHref.startsWith('/');

    return (
        <div className="section-content">
            <div className="section-content-icon">
                <Icon fontSize="small" />
                <span>{format}</span>
            </div>

            <div className="section-content-info">
                <Typography className="section-content-title">{title}</Typography>
                <Typography className="section-content-meta">{meta}</Typography>
            </div>

            <Link
                component={isInternal ? RouterLink : 'a'}
                to={isInternal ? targetHref : undefined}
                href={!isInternal ? targetHref : undefined}
                underline="hover"
                className="section-content-open"
            >
                Abrir →
            </Link>
        </div>
    );
}
