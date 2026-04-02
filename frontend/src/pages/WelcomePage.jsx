import { useNavigate } from 'react-router-dom'
import './WelcomePage.css'
import homeBG from '../assets/HomeBG1.jpg'

function WelcomePage() {
    const navigate = useNavigate()

    return (
        <div className="welcome-page" style={{ backgroundImage: `linear-gradient(rgba(235,243,254,0.78), rgba(235,243,254,0.78)), url(${homeBG})` }}>
            <h1 className="welcome-title">Lukudiplomi</h1>
            <p className="welcome-subtitle">Valitse roolisi jatkaaksesi</p>

            <div className="role-cards">
                <div className="role-card" onClick={() => navigate('/login/teacher')}>
                    <div className="role-icon">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="58" height="58">
                            <circle cx="32" cy="32" r="28" stroke="#2c5f8a" strokeWidth="1.5"/>
                            <circle cx="32" cy="32" r="21" stroke="#2c5f8a" strokeWidth="1" strokeDasharray="3 3"/>
                            <polygon points="32,10 35,31 32,29 29,31" fill="#C4973A"/>
                            <polygon points="32,54 35,33 32,35 29,33" fill="#2c5f8a"/>
                            <circle cx="32" cy="32" r="3" fill="#2c5f8a"/>
                            <text x="32" y="7" fontSize="6" fontFamily="serif" fill="#2c5f8a" textAnchor="middle">N</text>
                            <text x="32" y="61" fontSize="6" fontFamily="serif" fill="#2c5f8a" textAnchor="middle">S</text>
                            <text x="4" y="34" fontSize="6" fontFamily="serif" fill="#2c5f8a" textAnchor="middle">W</text>
                            <text x="60" y="34" fontSize="6" fontFamily="serif" fill="#2c5f8a" textAnchor="middle">E</text>
                        </svg>
                    </div>
                    <h2>Opettaja</h2>
                    <p>Hallinnoi oppilaita ja kirjoja</p>
                </div>

                <div className="role-card" onClick={() => navigate('/login/student')}>
                    <div className="role-icon">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="58" height="58">
                            <path d="M8,16 C8,16 20,14 31,16 L31,50 C20,48 8,50 8,50 Z" stroke="#2c5f8a" strokeWidth="1.8" fill="#F5F0E4"/>
                            <path d="M33,16 C44,14 56,16 56,16 L56,50 C56,50 44,48 33,50 Z" stroke="#2c5f8a" strokeWidth="1.8" fill="#F5F0E4"/>
                            <line x1="31" y1="16" x2="31" y2="50" stroke="#2c5f8a" strokeWidth="1.5"/>
                            <line x1="33" y1="16" x2="33" y2="50" stroke="#2c5f8a" strokeWidth="1.5"/>
                            <line x1="12" y1="24" x2="27" y2="23" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="12" y1="30" x2="27" y2="29" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="12" y1="36" x2="27" y2="35" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="12" y1="42" x2="22" y2="41" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="37" y1="23" x2="52" y2="24" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="37" y1="29" x2="52" y2="30" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="37" y1="35" x2="52" y2="36" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="37" y1="41" x2="50" y2="42" stroke="#C4973A" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2>Oppilas</h2>
                    <p>Lue kirjoja ja ansaitse palkintoja</p>
                </div>
            </div>

            <p className="welcome-feedback">
                Jätä palautetta / leave feedback{' '}
                <a href='https://docs.google.com/forms/d/e/1FAIpQLSc7E9irvWsfvF8Zb4D505cs5p9U9kiqt4TQwRHINyRFFnQkXg/viewform?usp=publish-editor' target="_blank" rel="noopener noreferrer">
                    Google Forms
                </a>
            </p>
            <p className="welcome-footer">Tarvitsetko apua? Ota yhteys opettajaasi.</p>
        </div>
    )
}

export default WelcomePage
