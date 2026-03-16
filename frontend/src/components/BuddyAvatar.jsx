import buddySpriteSheet from '../assets/buddyAvatar/buddies-0001.png'
import pandaIcon from '../assets/buddyAvatar/panda/panda_icon.png'
import './BuddyAvatar.css'

export const BUDDIES = [
    { id: 'buddy_1', name: 'Panda' },
    { id: 'buddy_2', name: 'P.P.' },
    { id: 'buddy_3', name: 'Matti' },
]

const BUDDY_ICONS = {
    buddy_1: pandaIcon,
}

const BUDDY_POSITIONS = {
    buddy_1: '0%',
    buddy_2: '50%',
    buddy_3: '100%',
}

// Each frame in the sprite sheet is 590×779
const FRAME_ASPECT = 779 / 590

export function BuddyIcon({ buddyId, size = 36 }) {
    const icon = BUDDY_ICONS[buddyId]
    if (icon) {
        return (
            <img
                className="buddy-icon"
                src={icon}
                alt={BUDDIES.find(b => b.id === buddyId)?.name ?? ''}
                style={{ width: size, height: size }}
            />
        )
    }
    // Fallback: small sprite crop for buddies without a dedicated icon
    const pos = BUDDY_POSITIONS[buddyId]
    if (pos == null) return null
    return (
        <div
            className="buddy-icon buddy-icon--sprite"
            style={{
                width: size,
                height: size,
                backgroundImage: `url(${buddySpriteSheet})`,
                backgroundSize: '300% auto',
                backgroundPosition: `${pos} 15%`,
            }}
        />
    )
}

export function BuddySprite({ buddyId, size = 120 }) {
    const pos = BUDDY_POSITIONS[buddyId]
    const h = Math.round(size * FRAME_ASPECT)
    if (pos == null) {
        return (
            <div
                className="buddy-sprite buddy-sprite--empty"
                style={{ width: size, height: h }}
            >
                ?
            </div>
        )
    }
    return (
        <div
            className="buddy-sprite"
            style={{
                width: size,
                height: h,
                backgroundImage: `url(${buddySpriteSheet})`,
                backgroundSize: '300% 100%',
                backgroundPosition: `${pos} 0`,
            }}
        />
    )
}
