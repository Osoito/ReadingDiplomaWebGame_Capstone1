import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import PhaserGame from './components/PhaserGame'
import WelcomePage from './pages/WelcomePage'
import TeacherLoginPage from './pages/TeacherLoginPage'
import StudentLoginPage from './pages/StudentLoginPage'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import TrafficWarningBanner from './components/TrafficWarningBanner'
// Note: I think all the css of all these pages might get mixed with these imports
// e.g. classes in TeacherDashboard.css have access to elements in StudentDashboard.jsx and vice versa, so we need to avoid using same classnames

function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth()
    if (loading) return null
    if (!user) return <Navigate to="/" />
    if (role && user.role !== role) return <Navigate to="/" />
    return children
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return null
    if (user) {
        if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />
        return <Navigate to="/student/dashboard" />
    }
    return children
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <TrafficWarningBanner />
                <Routes>
                    <Route path="/" element={
                        <PublicRoute><WelcomePage /></PublicRoute>
                    } />
                    <Route path="/login/teacher" element={
                        <PublicRoute><TeacherLoginPage /></PublicRoute>
                    } />
                    <Route path="/login/student" element={
                        <PublicRoute><StudentLoginPage /></PublicRoute>
                    } />
                    <Route path="/teacher/dashboard" element={
                        <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
                    } />
                    <Route path="/student/dashboard" element={
                        <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
                    } />
                    <Route path="/game" element={
                        <ProtectedRoute role="student"><PhaserGame /></ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
