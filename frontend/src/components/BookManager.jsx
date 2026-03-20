import { useState, useEffect } from 'react'
import { getCsrfToken } from '../services/api'

function BookManager() {
    const [books, setBooks] = useState([])
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [coverimage, setCoverimage] = useState('')
    const [booktype, setBooktype] = useState('physical')
    const [error, setError] = useState('')

    const fetchBooks = async () => {
        try {
            const res = await fetch('/api/books')
            if (res.ok) {
                setBooks(await res.json())
            }
        } catch {
            setError('Kirjojen haku epäonnistui')
        }
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const csrfToken = getCsrfToken()
            const res = await fetch('/api/books', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({ title, author, coverimage, booktype })
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Kirjan lisäys epäonnistui')
                return
            }
            setTitle('')
            setAuthor('')
            setCoverimage('')
            setBooktype('physical')
            fetchBooks()
        } catch {
            setError('Yhteysvirhe')
        }
    }

    return (
        <div className="dashboard-section">
            <h2>Kirjat</h2>
            {books.length > 0 ? (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nimi</th>
                            <th>Kirjoittaja</th>
                            <th>Tyyppi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((b) => (
                            <tr key={b.id}>
                                <td>{b.title}</td>
                                <td>{b.author}</td>
                                <td>{b.booktype}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="empty-message">Ei kirjoja vielä.</p>
            )}

            <form className="add-form" onSubmit={handleAdd}>
                <div className="form-group">
                    <label>Nimi</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Kirjoittaja</label>
                    <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Kansikuva URL</label>
                    <input
                        type="text"
                        value={coverimage}
                        onChange={(e) => setCoverimage(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Tyyppi</label>
                    <select value={booktype} onChange={(e) => setBooktype(e.target.value)}>
                        <option value="physical">Fyysinen</option>
                        <option value="e-book">E-kirja</option>
                        <option value="audio">Äänikirja</option>
                    </select>
                </div>
                <button type="submit" className="add-button">Lisää kirja</button>
            </form>
            {error && <p className="section-error">{error}</p>}
        </div>
    )
}

export default BookManager
