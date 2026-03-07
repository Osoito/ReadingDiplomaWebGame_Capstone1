import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './TeacherProfileCard.css'

/* ── Avatar SVG Icons ──────────────────────────────────────── */
const HelmIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="3" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="5.4" y1="5.4" x2="18.6" y2="18.6"/>
        <line x1="18.6" y1="5.4" x2="5.4" y2="18.6"/>
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
    </svg>
)

const CompassIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 4 L13.5 11 L12 10 L10.5 11 Z" fill="currentColor"/>
        <path d="M12 20 L10.5 13 L12 14 L13.5 13 Z" fill="currentColor" opacity="0.4"/>
        <path d="M20 12 L13 10.5 L14 12 L13 13.5 Z" fill="currentColor"/>
        <path d="M4 12 L11 13.5 L10 12 L11 10.5 Z" fill="currentColor" opacity="0.4"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
)

const MapIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6 L4 18 L8.5 16 L15.5 18 L20 16 L20 4 L15.5 6 L8.5 4 Z"/>
        <line x1="8.5" y1="4" x2="8.5" y2="16"/>
        <line x1="15.5" y1="6" x2="15.5" y2="18"/>
        <line x1="4" y1="10" x2="8.5" y2="10"/>
        <line x1="15.5" y1="11" x2="20" y2="11"/>
    </svg>
)

const AnchorIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.5"/>
        <line x1="12" y1="7.5" x2="12" y2="20"/>
        <line x1="7" y1="10" x2="17" y2="10"/>
        <path d="M7 20 C7 20 7 15.5 12 15.5 C17 15.5 17 20 17 20"/>
    </svg>
)

const BookIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7 C2 7 7 5 12 7 C17 5 22 7 22 7 L22 19 C22 19 17 17 12 19 C7 17 2 19 2 19 Z"/>
        <line x1="12" y1="7" x2="12" y2="19"/>
        <line x1="5" y1="9.5" x2="11" y2="9.5"/>
        <line x1="5" y1="12" x2="11" y2="12"/>
        <line x1="13" y1="9.5" x2="19" y2="9.5"/>
        <line x1="13" y1="12" x2="19" y2="12"/>
    </svg>
)

const ScopeIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="7.5"/>
        <line x1="21" y1="21" x2="16.5" y2="16.5"/>
        <line x1="11" y1="3.5" x2="11" y2="7"/>
        <line x1="11" y1="15" x2="11" y2="18.5"/>
        <line x1="3.5" y1="11" x2="7" y2="11"/>
        <line x1="15" y1="11" x2="18.5" y2="11"/>
        <circle cx="11" cy="11" r="2" fill="currentColor" stroke="none" opacity="0.6"/>
    </svg>
)

/* ── Avatar Definitions ────────────────────────────────────── */
const PRESET_AVATARS = [
    { id: 'avatar_captain',      label: 'Kapteeni',     Icon: HelmIcon,    bg: '#1e3a5f', fg: '#D8B25A' },
    { id: 'avatar_explorer',     label: 'Tutkija',      Icon: CompassIcon, bg: '#1a4a47', fg: '#a8d4c8' },
    { id: 'avatar_cartographer', label: 'Kartografi',   Icon: MapIcon,     bg: '#7a5a18', fg: '#FDFBF4' },
    { id: 'avatar_sailor',       label: 'Ankkuri',      Icon: AnchorIcon,  bg: '#1d4a6e', fg: '#9ecfef' },
    { id: 'avatar_scholar',      label: 'Kirjailija',   Icon: BookIcon,    bg: '#4a2518', fg: '#f0dfc0' },
    { id: 'avatar_navigator',    label: 'Navigaattori', Icon: ScopeIcon,   bg: '#2d1455', fg: '#c4a8e8' },
]

/* ── AvatarBadge (used in header + card) ───────────────────── */
export function AvatarBadge({ avatarId, size = 56 }) {
    const preset = PRESET_AVATARS.find(a => a.id === avatarId)
    const pad = Math.round(size * 0.22)
    return (
        <div
            className="avatar-badge"
            style={{
                width: size,
                height: size,
                background: preset ? preset.bg : 'rgba(196,151,58,0.12)',
                color: preset ? preset.fg : '#C4973A',
                border: preset ? 'none' : '2px dashed rgba(196,151,58,0.5)',
                padding: preset ? pad : 0,
                boxSizing: 'border-box',
                fontSize: preset ? undefined : size * 0.42,
            }}
        >
            {preset ? <preset.Icon /> : '?'}
        </div>
    )
}

/* ── TeacherProfileCard ────────────────────────────────────── */
function TeacherProfileCard() {
    const { user } = useAuth()
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(user?.name || '')
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => {
            setToast(null)
            if (type === 'success') window.location.reload()
        }, 1700)
    }

    const handleSave = async () => {
        const body = {}
        if (name.trim() !== (user?.name || '')) body.name = name.trim()
        if (selectedAvatar !== (user?.avatar || '')) body.avatar = selectedAvatar

        if (Object.keys(body).length === 0) {
            setEditing(false)
            return
        }

        setSaving(true)
        try {
            const res = await fetch(`/api/users/profile/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                const data = await res.json()
                showToast(data.error || 'Tallennus epäonnistui', 'error')
            } else {
                showToast('Profiili päivitetty!')
            }
        } catch {
            showToast('Yhteysvirhe', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setName(user?.name || '')
        setSelectedAvatar(user?.avatar || '')
        setEditing(false)
    }

    return (
        <div className="dashboard-section profile-section">
            {toast && (
                <div className={`profile-toast profile-toast--${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <h2>Oma profiili</h2>

            {!editing ? (
                <div className="profile-view">
                    <div className="avatar-ring">
                        <AvatarBadge avatarId={user?.avatar} size={88} />
                    </div>
                    <div className="profile-info">
                        <p className="profile-name">{user?.name}</p>
                        <p className="profile-email">{user?.email}</p>
                        <button className="edit-profile-button" onClick={() => setEditing(true)}>
                            Muokkaa
                        </button>
                    </div>
                </div>
            ) : (
                <div className="profile-edit">
                    <div className="profile-field">
                        <label>Nimi</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="profile-input"
                        />
                    </div>

                    <div className="profile-field">
                        <label>Hahmo</label>
                        <div className="avatar-grid">
                            {PRESET_AVATARS.map(({ id, label, Icon, bg, fg }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={`avatar-option${selectedAvatar === id ? ' avatar-option--selected' : ''}`}
                                    onClick={() => setSelectedAvatar(id)}
                                    title={label}
                                >
                                    <div className="avatar-option-badge">
                                        <div
                                            className="avatar-badge"
                                            style={{ width: 54, height: 54, background: bg, color: fg, padding: 12, boxSizing: 'border-box' }}
                                        >
                                            <Icon />
                                        </div>
                                        {selectedAvatar === id && (
                                            <span className="avatar-check">✓</span>
                                        )}
                                    </div>
                                    <span className="avatar-label">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="profile-edit-actions">
                        <button className="add-button" onClick={handleSave} disabled={saving}>
                            {saving ? 'Tallennetaan...' : 'Tallenna'}
                        </button>
                        <button className="cancel-button" onClick={handleCancel} disabled={saving}>
                            Peruuta
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TeacherProfileCard
