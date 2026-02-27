import { useNavigate } from 'react-router-dom'
import './TeacherLoginPage.css'
import homeBG from '../assets/HomeBG1.jpg'

function TeacherLoginPage() {
    const navigate = useNavigate()

    const handleGoogleLogin = () => {
        window.location.href = '/auth/google'
    }

    return (
        <div className="teacher-login-page" style={{ backgroundImage: `linear-gradient(rgba(235,243,254,0.78), rgba(235,243,254,0.78)), url(${homeBG})` }}>
            <h1 className="site-logo">Lukudiplomi</h1>
            <div className="login-card">
                <button className="back-button" onClick={() => navigate('/')}>
                    &larr; Takaisin
                </button>
                <h2>Opettajan kirjautuminen</h2>
                <p>Kirjaudu Google-tililläsi</p>
                <button className="google-button" onClick={handleGoogleLogin}>
                    Kirjaudu Google-tilillä
                </button>
            </div>
        </div>
    )
}

export default TeacherLoginPage
