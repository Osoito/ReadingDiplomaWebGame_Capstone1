import { useState, useEffect } from 'react'
import { StudentAvatarBadge } from './StudentAvatar'

function StudentManager() {
    const [students, setStudents] = useState([])
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editName, setEditName] = useState('')
    const [resetPwdId, setResetPwdId] = useState(null)
    const [resetPwd, setResetPwd] = useState('')
    const [resetPwdError, setResetPwdError] = useState('')

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/users/my-students')
            if (res.ok) {
                setStudents(await res.json())
            }
        } catch {
            setError('Oppilaiden haku epäonnistui')
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const body = { name, password }
            if (email.trim()) body.email = email.trim()
            const res = await fetch('/api/users/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Oppilaan luonti epäonnistui')
                return
            }
            setName('')
            setPassword('')
            setEmail('')
            fetchStudents()
        } catch {
            setError('Yhteysvirhe')
        }
    }

    const handleEditSave = async (id) => {
        if (!editName.trim()) return
        try {
            const res = await fetch(`/api/users/profile/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim() }),
            })
            if (res.ok) {
                setEditingId(null)
                fetchStudents()
            } else {
                setError('Nimen muokkaus epäonnistui')
            }
        } catch {
            setError('Yhteysvirhe')
        }
    }

    const handlePasswordReset = async (id) => {
        if (resetPwd.length < 3) {
            setResetPwdError('Salasanan on oltava vähintään 3 merkkiä')
            return
        }
        setResetPwdError('')
        try {
            const res = await fetch(`/api/users/students/${id}/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: resetPwd }),
            })
            if (res.ok) {
                setResetPwdId(null)
                setResetPwd('')
            } else {
                const data = await res.json()
                setResetPwdError(data.error || 'Salasanan vaihto epäonnistui')
            }
        } catch {
            setResetPwdError('Yhteysvirhe')
        }
    }

    const handleDelete = async (id, studentName) => {
        if (!window.confirm(`Haluatko varmasti poistaa oppilaan "${studentName}"?`)) return
        try {
            const res = await fetch(`/api/users/students/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchStudents()
            } else {
                setError('Poisto epäonnistui')
            }
        } catch {
            setError('Yhteysvirhe')
        }
    }

    return (
        <div className="dashboard-section">
            <h2>Oppilaat</h2>
            {students.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Hahmo</th>
                            <th>Nimi</th>
                            <th>Toiminnot</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id}>
                                <td><StudentAvatarBadge avatarId={s.avatar} size={32} /></td>
                                <td>
                                    {editingId === s.id ? (
                                        <input
                                            className="inline-edit-input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            {s.name}
                                            <button
                                                className="icon-btn"
                                                onClick={() => { setEditingId(s.id); setEditName(s.name); setResetPwdId(null) }}
                                                title="Muokkaa nimeä"
                                            >
                                                ✏
                                            </button>
                                        </>
                                    )}
                                </td>
                                <td>
                                    {editingId === s.id ? (
                                        <>
                                            <button className="add-button" style={{ padding: '0.35rem 0.75rem', alignSelf: 'unset', fontSize: '0.85rem' }} onClick={() => handleEditSave(s.id)}>Tallenna</button>
                                            <button className="cancel-button" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', marginLeft: '0.5rem' }} onClick={() => setEditingId(null)}>Peruuta</button>
                                        </>
                                    ) : resetPwdId === s.id ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <input
                                                className="inline-edit-input"
                                                type="password"
                                                placeholder="Uusi salasana"
                                                value={resetPwd}
                                                onChange={(e) => { setResetPwd(e.target.value); setResetPwdError('') }}
                                                autoFocus
                                            />
                                            {resetPwdError && <span className="section-error" style={{ fontSize: '0.8rem' }}>{resetPwdError}</span>}
                                            <div>
                                                <button className="add-button" style={{ padding: '0.35rem 0.75rem', alignSelf: 'unset', fontSize: '0.85rem' }} onClick={() => handlePasswordReset(s.id)}>Tallenna</button>
                                                <button className="cancel-button" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', marginLeft: '0.5rem' }} onClick={() => { setResetPwdId(null); setResetPwd(''); setResetPwdError('') }}>Peruuta</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                className="icon-btn"
                                                onClick={() => { setResetPwdId(s.id); setResetPwd(''); setResetPwdError(''); setEditingId(null) }}
                                                title="Vaihda salasana"
                                            >
                                                🔒
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(s.id, s.name)}
                                            >
                                                Poista
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="empty-message">Ei oppilaita vielä.</p>
            )}

            <form className="add-form" onSubmit={handleAdd}>
                <div className="form-group">
                    <label>Nimi</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={3}
                    />
                </div>
                <div className="form-group">
                    <label>Salasana</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={3}
                    />
                </div>
                <div className="form-group">
                    <label>Sähköposti (valinnainen, Google-kirjautumista varten)</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit" className="add-button">Lisää oppilas</button>
            </form>
            {error && <p className="section-error">{error}</p>}
        </div>
    )
}

export default StudentManager
