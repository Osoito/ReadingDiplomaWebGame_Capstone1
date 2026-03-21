import { DEPTHS, COLORS } from '../ui/constants.js';
import { ICON_KEYS } from '../ui/icons.js';

export default class WaypointRenderer {
    constructor(scene) {
        this.scene = scene;
        this.dotObjects = [];
        this.dotTexts = [];
    }

    render(pointPositions, baseScale, currentIndex, themeColor, videoCheckpoints, onVideoClick) {
        this.destroy();

        pointPositions.forEach((pos, index) => {
            const isVideo = !!videoCheckpoints[index];
            const dotColor = isVideo ? COLORS.VIDEO_BLUE : (themeColor || 0xffffff);
            const dotRadius = (isVideo ? 26 : 18) * baseScale;
            const dot = this.scene.add.circle(pos.x, pos.y, dotRadius, dotColor, 1)
                .setStrokeStyle(isVideo ? 3 : 2, 0xffffff)
                .setDepth(DEPTHS.WAYPOINT);
            this.dotObjects.push(dot);

            if (isVideo) {
                const iconSize = 32 * baseScale;
                // Offset play icon slightly right (+8%) to visually center the triangle
                const img = this.scene.add.image(pos.x + dotRadius * 0.08, pos.y, ICON_KEYS.PLAY)
                    .setDisplaySize(iconSize, iconSize).setDepth(DEPTHS.WAYPOINT_TEXT);
                this.dotTexts.push(img);

                dot.setInteractive({ useHandCursor: true });
                dot.on('pointerdown', () => {
                    if (onVideoClick) onVideoClick(videoCheckpoints[index], index);
                });
            }
        });
    }

    destroy() {
        this.dotObjects.forEach(d => d.destroy());
        this.dotTexts.forEach(t => t.destroy());
        this.dotObjects = [];
        this.dotTexts = [];
    }
}
