import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sideBar.css';
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

const ROUTES = {
    inicio: '/home',
    explorar: '/explorar',
    conteudos: '/conteudos',
    anotacoes: '/anotacoes',
    'painel-professor': '/professor/painel',
    'criar-materia': '/professor/criar-materia',
};

function SideBar({
    userName = '',
    userRole = '',
    userInitials = '',
    defaultActive = 'inicio',
    userRoleKey = '',
}) {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState(defaultActive);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isProfessor = userRoleKey === 'professor';

    const handleSelect = (id) => {
        setActiveItem(id);
        setMobileOpen(false);
        navigate(ROUTES[id]);
    };

    const onLogout = () => {

    }

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
                    <Avatar className="sidebar-avatar">{userInitials}</Avatar>
                    <div className="sidebar-user-details">
                        <p className="sidebar-user-name">{userName}</p>
                        <p className="sidebar-user-role">{userRole}</p>
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

            {/* Navegação: MEU ESPAÇO */}
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

            {/* Navegação: ENSINO (apenas professor) */}
            {isProfessor && (
                <div className="sidebar-menu-section">
                    <Typography
                        variant="caption"
                        className="sidebar-section-label"
                        sx={{ color: '#6b7280', fontWeight: 700, letterSpacing: '0.08em', display: 'block', px: 1, mb: 0.5 }}
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
                    sx={{ color: '#005c3b' }}
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