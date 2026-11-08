import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import './header.css';

const DEFAULT_BREADCRUMBS = [
    { label: 'Espaço acadêmico', href: '/home' },
    { label: 'Início' },
];

function formatDate(date = new Date()) {
    const parts = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).formatToParts(date);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    return `${get('day')} ${get('month')} ${get('year')}`;
}

// A última posição de `breadcrumbs` é a página atual (sem link).
function Header({ breadcrumbs = DEFAULT_BREADCRUMBS }) {
    return (
        <header className="header">
            <Breadcrumbs aria-label="breadcrumb" separator="/" className="header-breadcrumbs">
                {breadcrumbs.map((item, index) =>
                    index === breadcrumbs.length - 1 || !item.href ? (
                        <Typography key={item.label} className="header-breadcrumb-current">
                            {item.label}
                        </Typography>
                    ) : (
                        <Link
                            key={item.label}
                            href={item.href}
                            underline="hover"
                            className="header-breadcrumb-link"
                        >
                            {item.label}
                        </Link>
                    )
                )}
            </Breadcrumbs>

            <div className="header-date">
                <Divider orientation="vertical" flexItem className="header-divider" />
                <Typography className="header-date-text">{formatDate()}</Typography>
            </div>
        </header>
    );
}

export default Header;