import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const getCsrfToken = () => {
        const match = document.cookie.match(new RegExp('(^| )' + 'X-CSRF-TOKEN' + '=([^;]+)'))
        return match ? decodeURIComponent(match[2]) : null
    }

    const checkAuth = async () => {
        try {
            const res = await fetch('/auth/me')
            if (res.ok) {
                const data = await res.json()
                setUser(data)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, [])

    const logout = async () => {
        const csrfToken = getCsrfToken()
        await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        })
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout, checkAuth, getCsrfToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
