import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BUDDIES, BuddySprite, BuddyIcon } from '../components/BuddyAvatar'
import homeBG from '../assets/HomeBG1.jpg'
import './StudentDashboard.css'
import { getCsrfToken } from '../services/api'

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
    const [buddySelecting, setBuddySelecting] = useState(false)
    const [selectedBuddy, setSelectedBuddy] = useState('')
    const [buddySaving, setBuddySaving] = useState(false)
    const [buddyError, setBuddyError] = useState('')

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
        navigate('/game')
    }

    const handleBuddySave = async () => {
        if (!selectedBuddy) return
        setBuddySaving(true)
        setBuddyError('')
        try {
            const csrfToken = getCsrfToken()
            const res = await fetch(`/api/users/profile/${user.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ avatar: selectedBuddy }),
            })
            if (!res.ok) {
                const data = await res.json()
                setBuddyError(data.error || 'Tallennus epäonnistui')
            } else {
                await checkAuth()
                setBuddySelecting(false)
            }
        } catch {
            setBuddyError('Yhteysvirhe')
        } finally {
            setBuddySaving(false)
        }
    }

    const getStatus = (level) => {
        const entry = progress.find(p => p.level === level)
        return entry?.level_status ?? 'incomplete'
    }

    const completedCount = progress.filter(p => p.level_status === 'complete').length
    const hasBuddy = !!user?.avatar
    const showPicker = !hasBuddy || buddySelecting

    return (
        <div
            className="student-dashboard"
            style={{ backgroundImage: `linear-gradient(rgba(235,243,254,0.82), rgba(235,243,254,0.82)), url(${homeBG})` }}
        >
            <header className="student-header">
                <h1>Matkapäiväkirja</h1>
                <div className="header-right">
                    {hasBuddy && <BuddyIcon buddyId={user.avatar} size={38} />}
                    <span>{hasBuddy
                        ? <>matkustaa <strong>{user?.name}</strong> kanssa!</>
                        : <>Tervetuloa, {user?.name}</>
                    }</span>
                    <button
                        className="play-button"
                        onClick={hasBuddy ? handlePlay : undefined}
                        disabled={!hasBuddy}
                        title={!hasBuddy ? 'Valitse ensin seikkailukaveri' : undefined}
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
                        <section className={`dashboard-section buddy-selection-section${!hasBuddy ? ' buddy-selection-section--prominent' : ''}`}>
                            <h2>Seikkailukaveri</h2>
                            {!showPicker ? (
                                <div className="buddy-current">
                                    <div className="buddy-current-showcase">
                                        <div className="buddy-current-glow" />
                                        <BuddySprite buddyId={user.avatar} size={150} />
                                    </div>
                                    <p className="buddy-current-name">
                                        {BUDDIES.find(b => b.id === user.avatar)?.name ?? user.avatar}
                                    </p>
                                    <button
                                        className="change-avatar-button"
                                        onClick={() => {
                                            setSelectedBuddy(user.avatar)
                                            setBuddySelecting(true)
                                        }}
                                    >
                                        Vaihda kaveria
                                    </button>
                                </div>
                            ) : (
                                <div className="buddy-picker">
                                    <div className="char-grid">
                                        {BUDDIES.map(({ id, name }) => (
                                            <button
                                                key={id}
                                                type="button"
                                                className={`char-option${selectedBuddy === id ? ' char-option--selected' : ''}`}
                                                onClick={() => setSelectedBuddy(id)}
                                            >
                                                <div className="char-option-stage">
                                                    <BuddySprite buddyId={id} size={160} />
                                                    {selectedBuddy === id && <span className="char-check">✓</span>}
                                                </div>
                                                <span className="char-label">{name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {buddyError && <p className="avatar-error">{buddyError}</p>}
                                    <div className="avatar-picker-actions">
                                        <button
                                            className="play-button"
                                            onClick={handleBuddySave}
                                            disabled={!selectedBuddy || buddySaving}
                                        >
                                            {buddySaving ? 'Tallennetaan...' : 'Tallenna'}
                                        </button>
                                        {buddySelecting && (
                                            <button className="logout-button" onClick={() => setBuddySelecting(false)}>
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
