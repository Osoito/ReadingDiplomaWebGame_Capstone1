import { DEPTHS } from '../ui/constants.js';
import ReadingState from '../state.js';

export default class TokenManager {
    constructor() {
        this.token = null;
        this.baseTokenScale = 0.25;
    }

    create(scene, savedIndex) {
        // Create animation from atlas frames (once globally)
        if (!scene.anims.exists('buddy_idle')) {
            const frames = scene.anims.generateFrameNames('buddyIdle');
            scene.anims.create({
                key: 'buddy_idle',
                frames: frames,
                frameRate: 3,
                repeat: -1
            });
        }

        this.token = scene.add.sprite(0, 0, 'buddyIdle');
        this.token.setScale(this.baseTokenScale);
        this.token.setDepth(DEPTHS.TOKEN);
        this.token.lastPointIndex = savedIndex;
        this.token.play('buddy_idle');
        return this.token;
    }

    updateScale(baseScale) {
        if (this.token) {
            this.token.setScale(this.baseTokenScale * baseScale);
        }
    }

    setPosition(x, y) {
        if (this.token) this.token.setPosition(x, y);
    }

    get lastPointIndex() {
        return this.token?.lastPointIndex ?? 0;
    }

    set lastPointIndex(val) {
        if (this.token) this.token.lastPointIndex = val;
    }

    animateAlongPath(scene, pointPositions, fromIndex, toIndex, sceneKey, onComplete) {
        if (fromIndex === toIndex) {
            if (onComplete) onComplete(toIndex);
            return;
        }

        const moveStep = (current) => {
            if (current === toIndex) {
                this.token.lastPointIndex = toIndex;
                ReadingState.tokenPositions = ReadingState.tokenPositions || {};
                ReadingState.tokenPositions[sceneKey] = toIndex;
                if (onComplete) onComplete(toIndex);
                return;
            }

            const nextI = (current < toIndex) ? current + 1 : current - 1;

            scene.tweens.add({
                targets: this.token,
                x: pointPositions[nextI].x,
                y: pointPositions[nextI].y,
                duration: 300,
                ease: 'Linear',
                onStart: () => {
                    scene.cameras.main.startFollow(this.token, true, 0.1, 0.1);
                },
                onComplete: () => {
                    moveStep(nextI);
                }
            });
        };

        moveStep(fromIndex);
    }

    snapToPoint(scene, pointPositions, index, sceneKey) {
        const pos = pointPositions[index];
        this.token.setPosition(pos.x, pos.y);
        this.token.lastPointIndex = index;
        ReadingState.tokenPositions = ReadingState.tokenPositions || {};
        ReadingState.tokenPositions[sceneKey] = index;
        scene.cameras.main.startFollow(this.token, true, 1, 1);
    }
}
