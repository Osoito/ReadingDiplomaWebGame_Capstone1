import Phaser from 'phaser';
import WorldMapScene from './scenes/WorldMapScene.js';
import EuropeMapScene from './scenes/EuropeMapScene.js';
import AsiaMapScene from './scenes/AsiaMapScene.js';
import AfricaMapScene from './scenes/AfricaMapScene.js';
import AntarcticaMapScene from './scenes/AntarcticaMapScene.js';
import ArcticMapScene from './scenes/ArcticMapScene.js';
import NorthAmericaMapScene from './scenes/NorthAmericaMapScene.js';
import SouthAmericaMapScene from './scenes/SouthAmericaMapScene.js';
import OceaniaMapScene from './scenes/OceaniaMapScene.js';
import ReadingScene from './scenes/ReadingScene.js';

export default function createGameConfig(parent) {
    return {
        type: Phaser.AUTO,
        parent,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1280,
            height: 720,
        },
        scene: [
            WorldMapScene,
            EuropeMapScene,
            AsiaMapScene,
            AfricaMapScene,
            AntarcticaMapScene,
            ArcticMapScene,
            NorthAmericaMapScene,
            SouthAmericaMapScene,
            OceaniaMapScene,
            ReadingScene
        ]
    };
}
