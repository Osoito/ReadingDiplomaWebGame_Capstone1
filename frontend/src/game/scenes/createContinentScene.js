import BaseMapScene from './BaseMapScene.js';
import { buddyIdleImg, buddyIdleJson } from './continentRegistry.js';

export default function createContinentScene(config) {
    class ContinentScene extends BaseMapScene {
        constructor() {
            super(config.key, config.assetKey, config.title);
            this.themeColor = config.themeColor;
            this.rawPoints = config.rawPoints;
        }

        preload() {
            this.load.image(config.assetKey, config.assetPath);
            if (!this.textures.exists('buddyIdle')) {
                this.load.atlas('buddyIdle', buddyIdleImg, buddyIdleJson);
            }
        }
    }

    return ContinentScene;
}
