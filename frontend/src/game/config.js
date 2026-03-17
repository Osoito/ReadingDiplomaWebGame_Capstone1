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
    type: Phaser.AUTO, // 确保使用 WebGL 才能发挥 Mipmap 效果
    parent,
    dom: {
      createContainer: true
    },
    render: {
      antialias: true,
      roundPixels: true 
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width,
      height,
      // ⭐ 适配手机高分屏，防止物理像素级闪烁
      resolution: window.devicePixelRatio || 1 
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
