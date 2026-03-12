import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './StudentLoginPage.css'
import homeBG from '../assets/HomeBG1.jpg'

function StudentLoginPage() {
    const navigate = useNavigate()
    const { checkAuth } = useAuth()
    const [teacherName, setTeacherName] = useState('')
    const [studentName, setStudentName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: studentName,
                    password,
                    teacher_name: teacherName
                })
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Kirjautuminen epäonnistui')
                setSubmitting(false)
                return
            }

            await checkAuth()
            navigate('/game')
        } catch {
            setError('Yhteysvirhe. Yritä uudelleen.')
            setSubmitting(false)
        }
    }

    return (
        <div className="student-login-page" style={{ backgroundImage: `linear-gradient(rgba(235,243,254,0.78), rgba(235,243,254,0.78)), url(${homeBG})` }}>
            <h1 className="site-logo">Lukudiplomi</h1>
            <div className="student-login-card">
                <button className="back-button" onClick={() => navigate('/')}>
                    &larr; Takaisin
                </button>
                <h2>Oppilaan kirjautuminen</h2>
                <p className="subtitle">Kirjaudu opettajasi antamilla tunnuksilla</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Opettajan nimi</label>
                        <input
                            type="text"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Oppilaan nimi</label>
                        <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Salasana</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-submit" disabled={submitting}>
                        {submitting ? 'Kirjaudutaan...' : 'Kirjaudu'}
                    </button>
                </form>
                <div className="login-divider"><span>tai</span></div>
                <button type="button" className="google-button" onClick={() => window.location.href = '/auth/google'}>
                    Kirjaudu Google-tilillä
                </button>
            </div>
        </div>
    )
}

export default StudentLoginPage
