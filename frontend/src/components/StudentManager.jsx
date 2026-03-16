import { useState, useEffect } from 'react'
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
    const [editEmailId, setEditEmailId] = useState(null)
    const [editEmail, setEditEmail] = useState('')
    const [editEmailError, setEditEmailError] = useState('')

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/users/my-students')
            if (res.ok) {
                setStudents(await res.json())
            } else {
                const data = await res.json()
                setError(data.error || 'Oppilaiden haku epäonnistui')
            }
        } catch {
            setError('Yhteysvirhe')
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
                const data = await res.json()
                setError(data.error || 'Nimen muokkaus epäonnistui')
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

    const handleEmailSave = async (id) => {
        setEditEmailError('')
        try {
            const res = await fetch(`/api/users/profile/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: editEmail.trim() }),
            })
            if (res.ok) {
                setEditEmailId(null)
                fetchStudents()
            } else {
                const data = await res.json()
                setEditEmailError(data.error || 'Sähköpostin muokkaus epäonnistui')
            }
        } catch {
            setEditEmailError('Yhteysvirhe')
        }
    }

    const handleDelete = async (id, studentName) => {
        if (!window.confirm(`Haluatko varmasti poistaa oppilaan "${studentName}"?`)) return
        try {
            const res = await fetch(`/api/users/students/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchStudents()
            } else {
                const data = await res.json()
                setError(data.error || 'Poisto epäonnistui')
            }
        } catch {
            setError('Yhteysvirhe')
        }
    }

    return (
        <div className="dashboard-section">
            <h2>Oppilaat {students.length > 0 && <span className="student-count">{students.length}</span>}</h2>
            {students.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nimi</th>
                            <th>Gmail</th>
                            <th>Toiminnot</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id} className={resetPwdId === s.id ? 'editing-row lock-row' : (editingId === s.id || editEmailId === s.id ? 'editing-row' : '')}>
                                <td data-label="Nimi">
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
                                                className="icon-btn--edit"
                                                onClick={() => { setEditingId(s.id); setEditName(s.name); setResetPwdId(null); setEditEmailId(null) }}
                                                title="Muokkaa nimeä"
                                            >
                                                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                                    <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"/>
                                                    <path d="M7.5 3.5L10.5 6.5"/>
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </td>
                                <td data-label="Gmail">
                                    {editEmailId === s.id ? (
                                        <>
                                            <input
                                                className="inline-edit-input"
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => { setEditEmail(e.target.value); setEditEmailError('') }}
                                                autoFocus
                                            />
                                            {editEmailError && <span className="section-error" style={{ fontSize: '0.8rem' }}>{editEmailError}</span>}
                                        </>
                                    ) : (
                                        <>
                                            {s.email
                                                ? <><span className="gmail-g">G</span>{s.email}</>
                                                : <span className="gmail-empty">—</span>}
                                            <button
                                                className="icon-btn--edit"
                                                onClick={() => { setEditEmailId(s.id); setEditEmail(s.email || ''); setEditingId(null); setResetPwdId(null) }}
                                                title="Muokkaa sähköpostia"
                                            >
                                                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                                    <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z"/>
                                                    <path d="M7.5 3.5L10.5 6.5"/>
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </td>
                                <td data-label="Toiminnot">
                                    {editingId === s.id ? (
                                        <>
                                            <button className="add-button" style={{ padding: '0.35rem 0.75rem', alignSelf: 'unset', fontSize: '0.85rem' }} onClick={() => handleEditSave(s.id)}>Tallenna</button>
                                            <button className="cancel-button" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', marginLeft: '0.5rem' }} onClick={() => setEditingId(null)}>Peruuta</button>
                                        </>
                                    ) : editEmailId === s.id ? (
                                        <>
                                            <button className="add-button" style={{ padding: '0.35rem 0.75rem', alignSelf: 'unset', fontSize: '0.85rem' }} onClick={() => handleEmailSave(s.id)}>Tallenna</button>
                                            <button className="cancel-button" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', marginLeft: '0.5rem' }} onClick={() => { setEditEmailId(null); setEditEmailError('') }}>Peruuta</button>
                                        </>
                                    ) : resetPwdId === s.id ? (
                                        <div className="pwd-reset-widget">
                                            <input
                                                className="pwd-reset-input"
                                                type="password"
                                                placeholder="Uusi salasana"
                                                value={resetPwd}
                                                onChange={(e) => { setResetPwd(e.target.value); setResetPwdError('') }}
                                                autoFocus
                                            />
                                            {resetPwdError && <span className="pwd-reset-error">{resetPwdError}</span>}
                                            <div className="pwd-reset-actions">
                                                <button className="pwd-save-btn" onClick={() => handlePasswordReset(s.id)}>Tallenna</button>
                                                <button className="cancel-button" onClick={() => { setResetPwdId(null); setResetPwd(''); setResetPwdError('') }}>Peruuta</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row-actions">
                                            <button
                                                className="icon-btn icon-btn--lock"
                                                onClick={() => { setResetPwdId(s.id); setResetPwd(''); setResetPwdError(''); setEditingId(null); setEditEmailId(null) }}
                                                title="Vaihda salasana"
                                            >
                                                <svg viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="15" height="18">
                                                    <rect x="1" y="9" width="16" height="12" rx="1.5" />
                                                    <path d="M4.5 9V7A4.5 4 0 0 1 13.5 7V9" />
                                                    <circle cx="9" cy="15" r="1.8" fill="currentColor" stroke="none" />
                                                    <path d="M8.1 16.5 L8.1 18.5 L9.9 18.5 L9.9 16.5" fill="currentColor" stroke="none" />
                                                </svg>
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDelete(s.id, s.name)}
                                            >
                                                Poista
                                            </button>
                                        </div>
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
                    <label>Gmail-osoite (valinnainen)</label>
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
