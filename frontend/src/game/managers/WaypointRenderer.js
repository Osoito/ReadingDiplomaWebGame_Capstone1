import { DEPTHS } from '../ui/constants.js';

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
            const dotColor = isVideo ? 0xffcc00 : (themeColor || 0xffffff);
            const dotRadius = 18 * baseScale;
            const dot = this.scene.add.circle(pos.x, pos.y, dotRadius, dotColor, 1)
                .setStrokeStyle(2, 0xffffff)
                .setDepth(DEPTHS.WAYPOINT);
            this.dotObjects.push(dot);

            if (isVideo) {
                const iconSize = (14 * baseScale) + 'px';
                const txt = this.scene.add.text(pos.x, pos.y, '▶', {
                    fontSize: iconSize, color: '#000'
                }).setOrigin(0.5).setDepth(DEPTHS.WAYPOINT_TEXT);
                this.dotTexts.push(txt);

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
