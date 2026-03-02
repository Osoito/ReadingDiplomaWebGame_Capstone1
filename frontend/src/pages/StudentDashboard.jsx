import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import homeBG from '../assets/HomeBG1.jpg'
import './StudentDashboard.css'

const LEVELS = [
    { level: 1, name: 'Arktis' },
    { level: 2, name: 'Eurooppa' },
    { level: 3, name: 'Aasia' },
    { level: 4, name: 'Pohjois-Amerikka' },
    { level: 5, name: 'Etelä-Amerikka' },
    { level: 6, name: 'Afrikka' },
    { level: 7, name: 'Oseania' },
    { level: 8, name: 'Antarktis' },
]

function StudentDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [progress, setProgress] = useState([])
    const [rewards, setRewards] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/progress').then(r => r.ok ? r.json() : []),
            fetch('/api/rewards').then(r => r.ok ? r.json() : []),
        ]).then(([prog, rew]) => {
            setProgress(prog)
            setRewards(Array.isArray(rew) ? rew : [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const getStatus = (level) => {
        const entry = progress.find(p => p.level === level)
        return entry?.level_status ?? 'incomplete'
    }

    const completedCount = progress.filter(p => p.level_status === 'complete').length

    return (
        <div
            className="student-dashboard"
            style={{ backgroundImage: `linear-gradient(rgba(235,243,254,0.82), rgba(235,243,254,0.82)), url(${homeBG})` }}
        >
            <header className="student-header">
                <h1>Matkupäiväkirja</h1>
                <div className="header-right">
                    <span>Tervetuloa, {user?.name}</span>
                    <button className="play-button" onClick={() => navigate('/game')}>
                        ▶ Pelaa
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Kirjaudu ulos
                    </button>
                </div>
            </header>

            <div className="student-content">
                {loading ? (
                    <p className="loading-text">Ladataan...</p>
                ) : (
                    <>
                        <section className="dashboard-section voyage-log">
                            <h2>Matkakirja</h2>
                            <p className="voyage-summary">
                                Olet suorittanut <strong>{completedCount}</strong> / <strong>8</strong> matkaa
                            </p>
                            <div className="level-grid">
                                {LEVELS.map(({ level, name }) => {
                                    const done = getStatus(level) === 'complete'
                                    return (
                                        <div key={level} className={`level-card ${done ? 'level-done' : 'level-pending'}`}>
                                            <span className="level-number">{level}</span>
                                            <span className="level-name">{name}</span>
                                            <span className={`level-badge ${done ? 'badge-done' : 'badge-pending'}`}>
                                                {done ? '✓ Suoritettu' : 'Kesken'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="dashboard-section rewards-section">
                            <h2>Palkinnot</h2>
                            {rewards.length === 0 ? (
                                <p className="empty-message">Ei palkintoja vielä — lue kirjoja ansaitaksesi!</p>
                            ) : (
                                <div className="rewards-grid">
                                    {rewards.map((r) => (
                                        <div key={r.id} className="reward-card">
                                            <span className="reward-type">{r.reward_type}</span>
                                            <span className="reward-name">{r.reward}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}

export default StudentDashboard
