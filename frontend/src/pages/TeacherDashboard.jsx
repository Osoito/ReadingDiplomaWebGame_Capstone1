import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import StudentManager from '../components/StudentManager'
import BookManager from '../components/BookManager'
import './TeacherDashboard.css'

function TeacherDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Opettajan hallintapaneeli</h1>
                <div className="header-right">
                    <span>Tervetuloa, {user?.name || user?.email}</span>
                    <button className="logout-button" onClick={handleLogout}>
                        Kirjaudu ulos
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <StudentManager />
                <BookManager />
            </div>
        </div>
    )
}

export default TeacherDashboard
