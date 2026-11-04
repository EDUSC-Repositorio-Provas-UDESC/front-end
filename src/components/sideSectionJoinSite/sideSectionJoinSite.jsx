import './sideSectionJoinSite.css';
import ImportContactsOutlinedIcon from '@mui/icons-material/ImportContactsOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';

function SideSectionJoinSite() {
    return (
        <aside id="main_container" className="main_container">
            <div className="top-content">
                <p id="symbol" className="symbol">UDESC Estuda</p>
                <span id="tag" className="tag">FEITO PARA A COMUNIDADE ACADÊMICA</span>
                <h1 id="title" className="title">Seu próximo passo começa com conhecimento.</h1>
                <p className="normal-text">
                    Provas, atividades e descobertas. Um espaço para aprender em conjunto e ir além em cada disciplina.
                </p>
            </div>

            <div className="visual-container">
                <div className="circle-bg circle-1"></div>
                <div className="circle-bg circle-2"></div>
                <div className="card-glass">
                    <div className="card-icon">
                        <ImportContactsOutlinedIcon sx={{ fontSize: 28 }} />
                    </div>
                    <div className="card-texts">
                        <p className="title-container">Um lugar para o que você aprende.</p>
                        <p className="normal-text">Organize. Compartilhe. Evolua.</p>
                    </div>
                </div>
                <div className="card-accent">
                    <div className="card-icon">
                        <PeopleOutlineIcon sx={{ fontSize: 22 }} />
                    </div>
                    <p className="title-container">Juntos, o saber vai mais longe.</p>
                </div>
            </div>

            <div className="footer-disclaimer">
                <p className="normal-text">Plataforma conceitual de apoio aos estudos da UDESC.</p>
                <p className="normal-text">Sem vínculo com os sistemas acadêmicos oficiais.</p>
            </div>
        </aside>
    );
}

export default SideSectionJoinSite;