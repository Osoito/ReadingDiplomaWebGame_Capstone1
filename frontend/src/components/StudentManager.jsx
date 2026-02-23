import { useState, useEffect } from 'react'

function StudentManager() {
    const [students, setStudents] = useState([])
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

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
            const res = await fetch('/api/users/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password })
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Oppilaan luonti epäonnistui')
                return
            }
            setName('')
            setPassword('')
            fetchStudents()
        } catch {
            setError('Yhteysvirhe')
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
                            <th>Nimi</th>
                            <th>Luokka-aste</th>
                            <th>Toiminnot</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>{s.grade}</td>
                                <td>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(s.id, s.name)}
                                    >
                                        Poista
                                    </button>
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
                <button type="submit" className="add-button">Lisää oppilas</button>
            </form>
            {error && <p className="section-error">{error}</p>}
        </div>
    )
}

export default StudentManager
