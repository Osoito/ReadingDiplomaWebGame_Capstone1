import './StudentAvatar.css'

/* ── Placeholder character icons (designers swap these without key changes) ── */
const FlameIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M12 2C10 5.5 7.5 8 9 11.5c-1.5-.5-2.5-2-2.5-2C5 13 5.5 16.5 8 18.5c-2-.8-3-3-3-3C3.5 19 6.5 22 12 22s8.5-3.5 8.5-7.5c0-3.5-2.5-5-3.5-5 .5 2-1 3.5-2 4.5C16 12 14 8 12 2z"/>
    </svg>
)

const LeafIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 4-5 12 0 0-3-2-3-6-2 2-2.5 5.5-2 8a11 11 0 0 1-2-4c-1 3.5 0 7 2 9"/>
    </svg>
)

const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"/>
    </svg>
)

const StarIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
)

/* ── Avatar definitions — keys char_1–char_4 are stable; labels/colors are designer-editable ── */
export const STUDENT_AVATARS = [
    { id: 'char_1', label: 'Hahmo 1', Icon: FlameIcon,  bg: '#e8734a', fg: '#fff8f0' },
    { id: 'char_2', label: 'Hahmo 2', Icon: LeafIcon,   bg: '#4aab7a', fg: '#f0fff4' },
    { id: 'char_3', label: 'Hahmo 3', Icon: ShieldIcon, bg: '#6a8fd8', fg: '#f0f4ff' },
    { id: 'char_4', label: 'Hahmo 4', Icon: StarIcon,   bg: '#c46abf', fg: '#fff0fe' },
]

/* ── Badge component — used in dashboard header, avatar section, and teacher table ── */
export function StudentAvatarBadge({ avatarId, size = 48 }) {
    const avatar = STUDENT_AVATARS.find(a => a.id === avatarId)
    const pad = Math.round(size * 0.2)
    return (
        <div
            className="student-avatar-badge"
            style={{
                width: size,
                height: size,
                background: avatar ? avatar.bg : 'rgba(196,151,58,0.12)',
                color: avatar ? avatar.fg : '#C4973A',
                border: avatar ? 'none' : '2px dashed rgba(196,151,58,0.5)',
                padding: avatar ? pad : 0,
                boxSizing: 'border-box',
                fontSize: avatar ? undefined : size * 0.42,
            }}
        >
            {avatar ? <avatar.Icon /> : '?'}
        </div>
    )
}
