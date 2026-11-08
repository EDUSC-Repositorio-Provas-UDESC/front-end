import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sideBar.css';
import loginService from '../../services/loginService';
import PreferencesControls from '../preferences/PreferencesControls';
import {
    Divider,
    Avatar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Drawer,
    Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

const MENU_ITEMS = [
    { id: 'inicio', label: 'Início', icon: <HomeOutlinedIcon /> },
    { id: 'explorar', label: 'Disciplinas', icon: <StyleRoundedIcon /> },
    { id: 'conteudos', label: 'Meus conteúdos', icon: <FolderOpenOutlinedIcon /> },
    { id: 'anotacoes', label: 'Anotações', icon: <EditNoteOutlinedIcon /> },
];

const PROFESSOR_ITEMS = [
    { id: 'painel-professor', label: 'Painel do professor', icon: <DashboardOutlinedIcon /> },
    { id: 'criar-materia', label: 'Criar matéria', icon: <AddCircleOutlinedIcon /> },
];

const ADMIN_ITEMS = [
    { id: 'solicitacoes', label: 'Solicitações', icon: <InboxOutlinedIcon /> },
    { id: 'cursos', label: 'Cursos', icon: <SchoolOutlinedIcon /> },
    { id: 'perfis', label: 'Perfis e permissões', icon: <PeopleAltOutlinedIcon /> },
];

const ROLE_LABELS = {
    aluno: 'Aluno',
    professor: 'Professor',
    admin: 'Administrador',
    administrador: 'Administrador',
};

const getInitials = (name = '') =>
    name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const ROUTES = {
    inicio: '/home',
    explorar: '/explorar',
    conteudos: '/conteudos',
    anotacoes: '/anotacoes',
    'painel-professor': '/professor/painel',
    'criar-materia': '/professor/criar-materia',
    solicitacoes: '/admin/solicitacoes',
    cursos: '/admin/cursos',
    perfis: '/admin/perfis',
};

function SideBar({
    userName = '',
    userRole = '',
    userInitials = '',
    defaultActive = 'inicio',
    userRoleKey = '',
    badges = {},
}) {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState(defaultActive);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Quando a página não informa os dados, usa o usuário logado.
    // Assim o menu do professor/admin se mantém em qualquer página (Início, Disciplinas...).
    const currentUser = loginService.getCurrentUser();
    const roleKey = String(userRoleKey || currentUser?.role || 'aluno').toLowerCase();
    const isProfessor = roleKey === 'professor';
    const isAdmin = roleKey === 'admin' || roleKey === 'administrador';
    const displayName = userName || currentUser?.name || '';
    const displayRole = ROLE_LABELS[String(userRole).toLowerCase()] || userRole || ROLE_LABELS[roleKey] || '';
    const displayInitials = userInitials || getInitials(displayName);

    const handleSelect = (id) => {
        setActiveItem(id);
        setMobileOpen(false);
        navigate(ROUTES[id]);
    };

    // Encerra a sessão (remove o usuário salvo) e volta para a tela de login
    const onLogout = async () => {
        setMobileOpen(false);
        try {
            await loginService.logout();
        } catch {
            localStorage.removeItem('udesc_estuda_user');
        }
        navigate('/', { replace: true });
    };

    const sidebarContent = (
        <aside className="sidebar-container">
            {/* Topo: Logo UDESC Estuda e Subtítulo */}
            <div className="sidebar-header">
                <h1 className="sidebar-logo">
                    UDESC <span>Estuda</span>
                </h1>
                <span className="sidebar-subtitle">CONHECIMENTO QUE CONECTA</span>
            </div>

            <Divider className="sidebar-divider" />

            {/* Perfil do Usuário */}
            <div className="sidebar-account">
                <div className="sidebar-account-info">
                    <Avatar className="sidebar-avatar">{displayInitials}</Avatar>
                    <div className="sidebar-user-details">
                        <p className="sidebar-user-name">{displayName}</p>
                        <p className="sidebar-user-role">{displayRole}</p>
                    </div>
                </div>
                <IconButton
                    className="sidebar-logout-btn"
                    onClick={onLogout}
                    aria-label="Sair da conta"
                    title="Sair"
                >
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </div>

            {/* Navegação: MEU ESPAÇO (oculto para o administrador) */}
            {!isAdmin && (
            <div className="sidebar-menu-section">
                <p className="sidebar-section-label">MEU ESPAÇO</p>
                <List className="sidebar-nav-list" disablePadding>
                    {MENU_ITEMS.map((item) => {
                        const isActive = activeItem === item.id;
                        return (
                            <ListItem key={item.id} className="sidebar-nav-item" disablePadding>
                                <ListItemButton
                                    selected={isActive}
                                    onClick={() => handleSelect(item.id)}
                                    className={`sidebar-nav-button ${isActive ? 'active' : ''}`}
                                >
                                    <ListItemIcon className="sidebar-nav-icon">
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        className="sidebar-nav-text"
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </div>
            )}

            {/* Navegação: ENSINO (apenas professor) */}
            {isProfessor && (
                <div className="sidebar-menu-section">
                    <Typography
                        variant="caption"
                        className="sidebar-section-label"
                        sx={{ color: 'var(--c-text-muted)', fontWeight: 700, letterSpacing: '0.08em', display: 'block', px: 1, mb: 0.5 }}
                    >
                        ENSINO
                    </Typography>
                    <List className="sidebar-nav-list" disablePadding>
                        {PROFESSOR_ITEMS.map((item) => {
                            const isActive = activeItem === item.id;
                            return (
                                <ListItem key={item.id} className="sidebar-nav-item" disablePadding>
                                    <ListItemButton
                                        selected={isActive}
                                        onClick={() => handleSelect(item.id)}
                                        className={`sidebar-nav-button ${isActive ? 'active' : ''}`}
                                    >
                                        <ListItemIcon className="sidebar-nav-icon">
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            className="sidebar-nav-text"
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </div>
            )}

            {/* Navegação: GESTÃO DA PLATAFORMA (apenas administrador) */}
            {isAdmin && (
                <div className="sidebar-menu-section">
                    <p className="sidebar-section-label">GESTÃO DA PLATAFORMA</p>
                    <List className="sidebar-nav-list" disablePadding>
                        {ADMIN_ITEMS.map((item) => {
                            const isActive = activeItem === item.id;
                            const badge = badges[item.id];
                            return (
                                <ListItem key={item.id} className="sidebar-nav-item" disablePadding>
                                    <ListItemButton
                                        selected={isActive}
                                        onClick={() => handleSelect(item.id)}
                                        className={`sidebar-nav-button ${isActive ? 'active' : ''}`}
                                    >
                                        <ListItemIcon className="sidebar-nav-icon">
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            className="sidebar-nav-text"
                                        />
                                        {badge > 0 && <span className="sidebar-nav-badge">{badge}</span>}
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </div>
            )}

            {/* Rodapé: tema e tamanho de fonte */}
            <div className="sidebar-footer">
                <PreferencesControls />
            </div>
        </aside>
    );

    return (
        <>
            {/* Barra superior visível apenas em telas pequenas (Mobile/Tablet) */}
            <header className="sidebar-mobile-header">
                <h1 className="sidebar-logo">
                    UDESC <span>Estuda</span>
                </h1>
                <IconButton
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Abrir menu"
                    sx={{ color: 'var(--c-primary-strong)' }}
                >
                    {mobileOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
                </IconButton>
            </header>

            {/* Drawer Responsivo para Mobile */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                classes={{ paper: 'sidebar-drawer-paper' }}
            >
                {sidebarContent}
            </Drawer>

            {/* Sidebar Fixa para Desktop */}
            <div className="sidebar-desktop">
                {sidebarContent}
            </div>
        </>
    );
}

export default SideBar;