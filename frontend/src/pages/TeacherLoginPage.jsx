import { useNavigate } from 'react-router-dom'
import './TeacherLoginPage.css'

function TeacherLoginPage() {
    const navigate = useNavigate()

    const handleGoogleLogin = () => {
        window.location.href = '/auth/google'
    }

    return (
        <div className="teacher-login-page">
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
