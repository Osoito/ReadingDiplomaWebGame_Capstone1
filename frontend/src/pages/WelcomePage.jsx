import { useNavigate } from 'react-router-dom'
import './WelcomePage.css'

function WelcomePage() {
    const navigate = useNavigate()

    return (
        <div className="welcome-page">
            <h1 className="welcome-title">Lukudiplomi</h1>
            <p className="welcome-subtitle">Valitse roolisi jatkaaksesi</p>

            <div className="role-cards">
                <div className="role-card" onClick={() => navigate('/login/teacher')}>
                    <div className="role-icon">&#127891;</div>
                    <h2>Opettaja</h2>
                    <p>Hallinnoi oppilaita ja kirjoja</p>
                </div>

                <div className="role-card" onClick={() => navigate('/login/student')}>
                    <div className="role-icon">&#128214;</div>
                    <h2>Oppilas</h2>
                    <p>Lue kirjoja ja ansaitse palkintoja</p>
                </div>
            </div>

            <p className="welcome-footer">Tarvitsetko apua? Ota yhteys opettajaasi.</p>
        </div>
    )
}

export default WelcomePage
