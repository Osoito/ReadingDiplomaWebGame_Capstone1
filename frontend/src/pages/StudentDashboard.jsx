import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { STUDENT_AVATARS, StudentAvatarBadge } from '../components/StudentAvatar'
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
    const { user, logout, checkAuth } = useAuth()
    const navigate = useNavigate()
    const [progress, setProgress] = useState([])
    const [rewards, setRewards] = useState([])
    const [loading, setLoading] = useState(true)
    const [avatarSelecting, setAvatarSelecting] = useState(false)
    const [selectedChar, setSelectedChar] = useState('')
    const [avatarSaving, setAvatarSaving] = useState(false)
    const [avatarError, setAvatarError] = useState('')

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

    const handlePlay = () => {
        sessionStorage.setItem('lukudiplomi_avatar', user.avatar)
        navigate('/game')
    }

    const handleAvatarSave = async () => {
        if (!selectedChar) return
        setAvatarSaving(true)
        setAvatarError('')
        try {
            const res = await fetch(`/api/users/profile/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: selectedChar }),
            })
            if (!res.ok) {
                const data = await res.json()
                setAvatarError(data.error || 'Tallennus epäonnistui')
            } else {
                await checkAuth()
                setAvatarSelecting(false)
            }
        } catch {
            setAvatarError('Yhteysvirhe')
        } finally {
            setAvatarSaving(false)
        }
    }

    const getStatus = (level) => {
        const entry = progress.find(p => p.level === level)
        return entry?.level_status ?? 'incomplete'
    }

    const completedCount = progress.filter(p => p.level_status === 'complete').length
    const hasAvatar = !!user?.avatar
    const showPicker = !hasAvatar || avatarSelecting

    return (
        <div
            className="student-dashboard"
            style={{ backgroundImage: `linear-gradient(rgba(235,243,254,0.82), rgba(235,243,254,0.82)), url(${homeBG})` }}
        >
            <header className="student-header">
                <h1>Matkupäiväkirja</h1>
                <div className="header-right">
                    <StudentAvatarBadge avatarId={user?.avatar} size={36} />
                    <span>Tervetuloa, {user?.name}</span>
                    <button
                        className="play-button"
                        onClick={hasAvatar ? handlePlay : undefined}
                        disabled={!hasAvatar}
                        title={!hasAvatar ? 'Valitse ensin hahmosi' : undefined}
                    >
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
                        <section className={`dashboard-section avatar-selection-section${!hasAvatar ? ' avatar-selection-section--prominent' : ''}`}>
                            <h2>Valitse hahmosi</h2>
                            {!showPicker ? (
                                <div className="avatar-current">
                                    <StudentAvatarBadge avatarId={user.avatar} size={64} />
                                    <div className="avatar-current-info">
                                        <p className="avatar-current-name">
                                            {STUDENT_AVATARS.find(a => a.id === user.avatar)?.label ?? user.avatar}
                                        </p>
                                        <button
                                            className="change-avatar-button"
                                            onClick={() => {
                                                setSelectedChar(user.avatar)
                                                setAvatarSelecting(true)
                                            }}
                                        >
                                            Vaihda hahmoa
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="avatar-picker">
                                    <div className="char-grid">
                                        {STUDENT_AVATARS.map(({ id, label, Icon, bg, fg }) => (
                                            <button
                                                key={id}
                                                type="button"
                                                className={`char-option${selectedChar === id ? ' char-option--selected' : ''}`}
                                                onClick={() => setSelectedChar(id)}
                                            >
                                                <div className="char-option-badge-wrap">
                                                    <div
                                                        className="student-avatar-badge"
                                                        style={{ width: 72, height: 72, background: bg, color: fg, padding: 15, boxSizing: 'border-box' }}
                                                    >
                                                        <Icon />
                                                    </div>
                                                    {selectedChar === id && <span className="char-check">✓</span>}
                                                </div>
                                                <span className="char-label">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {avatarError && <p className="avatar-error">{avatarError}</p>}
                                    <div className="avatar-picker-actions">
                                        <button
                                            className="play-button"
                                            onClick={handleAvatarSave}
                                            disabled={!selectedChar || avatarSaving}
                                        >
                                            {avatarSaving ? 'Tallennetaan...' : 'Valitse hahmo'}
                                        </button>
                                        {avatarSelecting && (
                                            <button className="logout-button" onClick={() => setAvatarSelecting(false)}>
                                                Peruuta
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

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
