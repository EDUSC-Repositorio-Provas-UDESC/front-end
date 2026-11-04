import { useEffect, useRef, useState } from 'react';
import { Typography, Tabs, Tab, InputBase, IconButton } from '@mui/material';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckIcon from '@mui/icons-material/Check';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PrimaryButton from '../PrimaryButton';
import subjectService from '../../../services/subjectService';
import './NotesCard.css';

/** Painel de anotações do usuário para um recurso específico. */
export default function NotesCard({ resourceId = 'CAL1001-1' }) {
    const contentRef = useRef(null);

    const [tab, setTab] = useState('nova');
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('Revisar a questão 02');
    const [content, setContent] = useState('Antes de substituir, fatorar x² − 9 = (x − 3)(x + 3). O limite é 6.');

    useEffect(() => {
        const loadNotes = async () => {
            setNotes(await subjectService.getNotes(resourceId));
        };
        loadNotes();
    }, [resourceId]);

    const handleFormat = (type) => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart ?? content.length;
        const end = textarea.selectionEnd ?? content.length;
        const selected = content.slice(start, end);

        const formats = {
            bold: `**${selected || 'texto'}**`,
            italic: `*${selected || 'texto'}*`,
            list: `\n• ${selected || 'item'}`,
        };

        setContent(content.slice(0, start) + formats[type] + content.slice(end));
    };

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) return;
        const updated = await subjectService.saveNote(resourceId, {
            title: title.trim() || 'Sem título',
            content,
        });
        setNotes(updated);
        setTab('salvas');
    };

    const handleDelete = async (noteId, e) => {
        e.stopPropagation();
        setNotes(await subjectService.deleteNote(resourceId, noteId));
    };

    const handleSelectNote = (note) => {
        setTitle(note.title);
        setContent(note.content);
        setTab('nova');
    };

    return (
        <aside className="notes-card">
            <div className="notes-card-header">
                <EditNoteOutlinedIcon fontSize="small" />
                <Typography className="notes-card-title">Minhas anotações</Typography>
            </div>

            <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                className="notes-card-tabs"
            >
                <Tab value="nova" label="Nova anotação" disableRipple />
                <Tab value="salvas" label={`Salvas (${notes.length})`} disableRipple />
            </Tabs>

            {tab === 'nova' ? (
                <div className="notes-card-form">
                    <div>
                        <Typography className="notes-card-label">Título da nota</Typography>
                        <InputBase
                            fullWidth
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Revisar a questão 02"
                            className="notes-card-input"
                        />
                    </div>

                    <div className="notes-card-editor">
                        <div className="notes-card-toolbar">
                            <IconButton size="small" onClick={() => handleFormat('bold')} aria-label="Negrito">
                                <FormatBoldIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleFormat('italic')} aria-label="Itálico">
                                <FormatItalicIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleFormat('list')} aria-label="Lista">
                                <FormatListBulletedIcon fontSize="small" />
                            </IconButton>
                        </div>

                        <InputBase
                            multiline
                            minRows={10}
                            inputRef={contentRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Escreva suas anotações sobre este material..."
                            className="notes-card-textarea"
                        />
                    </div>

                    <PrimaryButton
                        fullWidth={false}
                        onClick={handleSave}
                        startIcon={<CheckIcon fontSize="small" />}
                        className="notes-card-save-btn"
                    >
                        Salvar anotação
                    </PrimaryButton>
                </div>
            ) : (
                <div className="notes-card-saved-list">
                    {notes.length === 0 && (
                        <Typography className="notes-card-empty">
                            Nenhuma anotação salva ainda.
                        </Typography>
                    )}

                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="notes-card-saved-item"
                            onClick={() => handleSelectNote(note)}
                        >
                            <div className="notes-card-saved-top">
                                <Typography className="notes-card-saved-title">{note.title}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleDelete(note.id, e)}
                                    className="notes-card-delete-btn"
                                    aria-label="Excluir anotação"
                                >
                                    <DeleteOutlinedIcon fontSize="small" />
                                </IconButton>
                            </div>
                            <Typography className="notes-card-saved-content">{note.content}</Typography>
                            <Typography className="notes-card-saved-date">{note.date}</Typography>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
}
