import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import IconButton from '@mui/material/IconButton';
import './cardSubject.css';

export default function CardSubject({ tag, name, teacher, description, resourcesQty, favorite: initialFavorite = false }) {
    const [favorite, setFavorite] = useState(initialFavorite);

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        console.log('handleFavoriteClick');
        setFavorite(!favorite);
    }

    const handleCardClick = (e) => {
        e.stopPropagation();
    }

    return (
        <Card className="card-subject" variant="outlined">
            <CardContent className="card-subject-content">
                <div className="card-subject-top">
                    <Chip label={tag} size="small" className="card-subject-tag" />
                    <IconButton className="card-subject-favorite" onClick={handleFavoriteClick}>
                        {favorite ?
                            <StarRoundedIcon fontSize='small' /> :
                            <StarBorderOutlinedIcon fontSize="small" />
                        }
                    </IconButton>
                </div>
                <CardActionArea className="card-subject-action" onClick={handleCardClick}>
                    <Typography className="card-subject-name">{name}</Typography>
                    <Typography className="card-subject-teacher">{teacher}</Typography>
                    <Typography className="card-subject-description">{description}</Typography>

                    <Divider className="card-subject-divider" />
                    <div className="card-subject-footer">
                        <span>{resourcesQty} recursos disponíveis</span>
                        <NorthEastIcon fontSize="small" />
                    </div>
                </CardActionArea>
            </CardContent>
        </Card>
    );
}
