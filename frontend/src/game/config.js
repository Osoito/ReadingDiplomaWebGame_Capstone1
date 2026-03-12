// 文件路径：game/config.js

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

export default function createGameConfig(parent, width, height) {
  return {
    type: Phaser.AUTO,
    parent,
    dom: {
      createContainer: true
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width,    // 使用传入的数值宽度
      height    // 使用传入的数值高度
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
