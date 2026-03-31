import Phaser from 'phaser';
import ReadingState from '../state.js';
import { DEPTHS, CSS_COLORS, FONTS } from '../ui/constants.js';
import { ICON_KEYS } from '../ui/icons.js';

export default class CelebrationModal {
    constructor(scene) {
        this.scene = scene;
        this.celebrationUI = null;
        this._resizeHandler = null;
    }

    show(mapKey) {
        if (!ReadingState._continentCompletedFlags) {
            ReadingState._continentCompletedFlags = {};
        }
        ReadingState._continentCompletedFlags[mapKey] = true;

        this.destroy();

        const { width, height } = this.scene.scale;
        const s = Phaser.Math.Clamp(width / 1200, 0.8, 1.2);

        this.celebrationUI = this.scene.add.container(0, 0).setDepth(DEPTHS.CELEBRATION).setScrollFactor(0);

        this.celebrationUI.once('destroy', () => {
            if (this._resizeHandler) {
                this.scene.scale.off('resize', this._resizeHandler, this.scene);
                this._resizeHandler = null;
            }
            this.celebrationUI = null;
        });

        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x0a192f, 0.85)
            .setOrigin(0).setInteractive().setScrollFactor(0);
        this.celebrationUI.add(overlay);

        const boxW = Math.min(width * 0.85, 500 * s);
        const boxH = 300 * s;
        const box = this.scene.add.rectangle(width / 2, height / 2, boxW, boxH, 0x1e3a5f)
            .setStrokeStyle(4, 0xc4973a).setScrollFactor(0);
        this.celebrationUI.add(box);

        const partyIcon = this.scene.add.image(width / 2 - (110 * s), height / 2 - (60 * s), ICON_KEYS.PARTY)
            .setDisplaySize(36 * s, 36 * s).setScrollFactor(0);
        this.celebrationUI.add(partyIcon);

        const titleMsg = this.scene.add.text(width / 2 + (10 * s), height / 2 - (60 * s), 'ONNITTELUT!', {
            fontSize: `${32 * s}px`,
            color: CSS_COLORS.GOLD,
            fontFamily: FONTS.HEADING,
            fontWeight: 'bold',
            shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 4, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        this.celebrationUI.add(titleMsg);

        const subMsg = this.scene.add.text(width / 2, height / 2 + (15 * s),
            'Olet suorittanut tutkimusmatkan loppuun!', {
                fontSize: `${20 * s}px`,
                color: CSS_COLORS.WHITE,
                fontFamily: FONTS.BODY,
                align: 'center',
                wordWrap: { width: boxW - 40 }
            }).setOrigin(0.5).setScrollFactor(0);
        this.celebrationUI.add(subMsg);

        const okBtn = this.scene.add.text(width / 2, height / 2 + (90 * s), ' SELVÄ ', {
            fontSize: `${22 * s}px`,
            color: CSS_COLORS.WHITE,
            backgroundColor: CSS_COLORS.GOLD,
            padding: { x: 40, y: 12 },
            fontFamily: FONTS.BODY,
            fontWeight: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

        okBtn.on('pointerover', () => okBtn.setBackgroundColor('#d4a74a'));
        okBtn.on('pointerout', () => okBtn.setBackgroundColor(CSS_COLORS.GOLD));
        okBtn.on('pointerdown', () => this.destroy());
        this.celebrationUI.add(okBtn);

        this._resizeHandler = () => { if (this.celebrationUI) this.show(mapKey); };
        this.scene.scale.on('resize', this._resizeHandler, this.scene);

        // Entry animation
        box.setScale(0.5);
        this.scene.tweens.add({
            targets: [box, titleMsg, subMsg, okBtn],
            scaleX: 1, scaleY: 1, duration: 400, ease: 'Back.easeOut'
        });

        // Add completion reward to backend (fire-and-forget)
        const userId = this.scene.game.registry.get('userId');
        ReadingState.addCompletionReward(userId, 'continent_complete', mapKey);
    }

    destroy() {
        if (this._resizeHandler) {
            this.scene.scale.off('resize', this._resizeHandler, this.scene);
            this._resizeHandler = null;
        }
        if (this.celebrationUI) {
            this.celebrationUI.destroy(true);
            this.celebrationUI = null;
        }
    }
}
